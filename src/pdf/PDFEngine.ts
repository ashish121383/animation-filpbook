import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, TextItem } from 'pdfjs-dist/types/src/display/api';
import type { PDFDocumentInfo, PageAnalysis, DetectedElement } from '@/types';
import { normalizeBox, getDefaultAnimation } from '@/utils';
import { pageAnalysisCache, estimatePageSize } from '@/utils/cache';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export class PDFEngine {
  private document: PDFDocumentProxy | null = null;
  private analysisWorker: Worker | null = null;

  async loadDocument(source: string | ArrayBuffer | Uint8Array): Promise<PDFDocumentInfo> {
    const loadingTask = pdfjsLib.getDocument(source);
    this.document = await loadingTask.promise;

    const metadata = await this.document.getMetadata().catch(() => null);

    return {
      numPages: this.document.numPages,
      title: (metadata?.info as Record<string, string>)?.Title || 'Untitled',
      author: (metadata?.info as Record<string, string>)?.Author || 'Unknown',
      subject: (metadata?.info as Record<string, string>)?.Subject || '',
    };
  }

  getDocument(): PDFDocumentProxy | null {
    return this.document;
  }

  async getPage(pageNumber: number): Promise<PDFPageProxy> {
    if (!this.document) throw new Error('No document loaded');
    return this.document.getPage(pageNumber);
  }

  async renderPageToCanvas(
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale: number = 2
  ): Promise<{ width: number; height: number }> {
    const page = await this.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get canvas context');

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    return { width: viewport.width, height: viewport.height };
  }

  async extractTextItems(pageNumber: number): Promise<Array<{
    str: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontName: string;
  }>> {
    const page = await this.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });

    return textContent.items
      .filter((item): item is TextItem => 'str' in item)
      .map((item) => {
        const transform = item.transform;
        return {
          str: item.str,
          x: transform[4],
          y: viewport.height - transform[5],
          width: item.width,
          height: item.height,
          fontSize: Math.abs(transform[0]),
          fontName: item.fontName,
        };
      });
  }

  async analyzePage(pageNumber: number, scale: number = 2): Promise<PageAnalysis> {
    const cacheKey = `page-${pageNumber}-${scale}`;
    const cached = pageAnalysisCache.get(cacheKey);
    if (cached) return cached;

    const page = await this.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const pageWidth = viewport.width;
    const pageHeight = viewport.height;

    const canvas = document.createElement('canvas');
    await this.renderPageToCanvas(pageNumber, canvas, scale);
    const textItems = await this.extractTextItems(pageNumber);

    const elements = await this.runAnalysisWorker(
      pageNumber,
      canvas,
      textItems,
      pageWidth,
      pageHeight
    );

    const normalizedElements = elements.map((el) => ({
      ...el,
      boundingBox: normalizeBox(el.boundingBox, pageWidth, pageHeight),
      animationType: el.animationType || getDefaultAnimation(el.type),
    }));

    const textContent = textItems.map((t) => t.str).join(' ');
    const isScanned = textItems.length === 0 || textItems.every((t) => !t.str.trim());

    const analysis: PageAnalysis = {
      pageNumber,
      width: pageWidth,
      height: pageHeight,
      isScanned,
      elements: normalizedElements,
      textContent,
      backgroundImage: canvas.toDataURL('image/jpeg', 0.85),
    };

    pageAnalysisCache.set(cacheKey, analysis, estimatePageSize(analysis));
    return analysis;
  }

  private async runAnalysisWorker(
    pageNumber: number,
    canvas: HTMLCanvasElement,
    textItems: Array<{
      str: string;
      x: number;
      y: number;
      width: number;
      height: number;
      fontSize: number;
      fontName: string;
    }>,
    pageWidth: number,
    pageHeight: number
  ): Promise<DetectedElement[]> {
    return new Promise((resolve) => {
      if (!this.analysisWorker) {
        this.analysisWorker = new Worker(
          new URL('../workers/pageAnalysis.worker.ts', import.meta.url),
          { type: 'module' }
        );
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve([]);
        return;
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const handler = (event: MessageEvent) => {
        if (event.data.pageNumber === pageNumber) {
          this.analysisWorker?.removeEventListener('message', handler);
          resolve(event.data.elements);
        }
      };

      this.analysisWorker.addEventListener('message', handler);
      this.analysisWorker.postMessage(
        {
          type: 'analyze-page',
          pageNumber,
          imageData,
          textItems,
          pageWidth,
          pageHeight,
        },
        [imageData.data.buffer]
      );
    });
  }

  destroy(): void {
    this.analysisWorker?.terminate();
    this.analysisWorker = null;
    this.document?.destroy();
    this.document = null;
  }
}

export const pdfEngine = new PDFEngine();
