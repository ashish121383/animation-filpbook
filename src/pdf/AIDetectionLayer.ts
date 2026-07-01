import type { DetectedElement, ElementType, BoundingBox, PageAnalysis } from '@/types';
import { generateId, getDefaultAnimation } from '@/utils';
import { performOCR } from './OCRService';
import type { OCRProviderName } from './OCRService';

export interface DetectionConfig {
  ocrProvider: OCRProviderName;
  minConfidence: number;
  enableObjectDetection: boolean;
}

const DEFAULT_CONFIG: DetectionConfig = {
  ocrProvider: 'tesseract',
  minConfidence: 0.5,
  enableObjectDetection: true,
};

export class AIDetectionLayer {
  private config: DetectionConfig;

  constructor(config: Partial<DetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async enhanceScannedPage(
    analysis: PageAnalysis,
    imageSource: string
  ): Promise<PageAnalysis> {
    if (!analysis.isScanned) return analysis;

    const ocrText = await performOCR(imageSource, this.config.ocrProvider);
    const ocrElements = this.parseOCRToElements(ocrText, analysis.width, analysis.height);

    return {
      ...analysis,
      elements: [...analysis.elements, ...ocrElements],
      textContent: ocrText,
      isScanned: false,
    };
  }

  private parseOCRToElements(
    text: string,
    _pageWidth: number,
    pageHeight: number
  ): DetectedElement[] {
    const lines = text.split('\n').filter((l) => l.trim());
    const lineHeight = pageHeight / Math.max(lines.length, 1);
    const elements: DetectedElement[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const isHeading = trimmed.length < 50 && index === 0;
      const type: ElementType = isHeading ? 'heading' : 'paragraph';

      elements.push({
        id: generateId('ocr'),
        type,
        boundingBox: {
          x: 5,
          y: (index * lineHeight / pageHeight) * 100,
          width: 90,
          height: (lineHeight / pageHeight) * 100,
        },
        confidence: 0.75,
        hierarchy: isHeading ? 2 : 5,
        zIndex: 10 + index,
        animationType: getDefaultAnimation(type),
        content: trimmed,
      });
    });

    return elements;
  }

  detectQRCode(imageData: ImageData): DetectedElement | null {
    const { data, width, height } = imageData;
    const blockSize = 20;

    for (let y = 0; y < height - blockSize; y += blockSize) {
      for (let x = 0; x < width - blockSize; x += blockSize) {
        if (this.isQRPattern(data, width, x, y, blockSize)) {
          return {
            id: generateId('qr'),
            type: 'qr-code',
            boundingBox: {
              x: (x / width) * 100,
              y: (y / height) * 100,
              width: (blockSize * 3 / width) * 100,
              height: (blockSize * 3 / height) * 100,
            },
            confidence: 0.7,
            hierarchy: 4,
            zIndex: 15,
            animationType: 'scale',
          };
        }
      }
    }
    return null;
  }

  private isQRPattern(
    data: Uint8ClampedArray,
    width: number,
    startX: number,
    startY: number,
    size: number
  ): boolean {
    let blackCount = 0;
    let whiteCount = 0;
    const total = size * size;

    for (let y = startY; y < startY + size; y++) {
      for (let x = startX; x < startX + size; x++) {
        const i = (y * width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness < 128) blackCount++;
        else whiteCount++;
      }
    }

    const ratio = blackCount / total;
    return ratio > 0.3 && ratio < 0.7;
  }

  detectTables(elements: DetectedElement[]): DetectedElement[] {
    const textElements = elements.filter(
      (e) => e.type === 'text-block' || e.type === 'paragraph'
    );

    const rows = this.clusterByY(textElements);
    if (rows.length < 3) return elements;

    const avgCols = rows.reduce((sum, row) => sum + row.length, 0) / rows.length;
    if (avgCols < 2) return elements;

    const tableBox = this.computeBoundingBox(textElements);
    const tableElement: DetectedElement = {
      id: generateId('table'),
      type: 'table',
      boundingBox: tableBox,
      confidence: 0.65,
      hierarchy: 4,
      zIndex: 8,
      animationType: 'fade',
      children: textElements,
    };

    const filtered = elements.filter((e) => !textElements.includes(e));
    return [...filtered, tableElement];
  }

  private clusterByY(elements: DetectedElement[]): DetectedElement[][] {
    const sorted = [...elements].sort((a, b) => a.boundingBox.y - b.boundingBox.y);
    const rows: DetectedElement[][] = [];
    let currentRow: DetectedElement[] = [];
    let lastY = -1;

    for (const el of sorted) {
      if (lastY >= 0 && Math.abs(el.boundingBox.y - lastY) > 2) {
        if (currentRow.length > 0) rows.push(currentRow);
        currentRow = [];
      }
      currentRow.push(el);
      lastY = el.boundingBox.y;
    }
    if (currentRow.length > 0) rows.push(currentRow);

    return rows.filter((row) => row.length >= 2);
  }

  private computeBoundingBox(elements: DetectedElement[]): BoundingBox {
    const xs = elements.map((e) => e.boundingBox.x);
    const ys = elements.map((e) => e.boundingBox.y);
    const rights = elements.map((e) => e.boundingBox.x + e.boundingBox.width);
    const bottoms = elements.map((e) => e.boundingBox.y + e.boundingBox.height);

    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...rights) - Math.min(...xs),
      height: Math.max(...bottoms) - Math.min(...ys),
    };
  }

  assignAnimations(elements: DetectedElement[]): DetectedElement[] {
    return elements
      .filter((e) => e.confidence >= this.config.minConfidence)
      .map((el, index) => ({
        ...el,
        animationType: el.animationType || getDefaultAnimation(el.type),
        zIndex: el.zIndex || index,
      }));
  }
}

export const aiDetectionLayer = new AIDetectionLayer();
