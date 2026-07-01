import type { DetectedElement, BoundingBox, ElementType } from '@/types';

export interface WorkerAnalysisRequest {
  type: 'analyze-page';
  pageNumber: number;
  imageData: ImageData;
  textItems: Array<{
    str: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontName: string;
  }>;
  pageWidth: number;
  pageHeight: number;
}

export interface WorkerAnalysisResponse {
  type: 'analysis-complete';
  pageNumber: number;
  elements: DetectedElement[];
  isScanned: boolean;
}

function classifyTextElement(
  text: string,
  fontSize: number,
  fontName: string,
  box: BoundingBox
): { type: ElementType; hierarchy: number; confidence: number } {
  const isBold = fontName.toLowerCase().includes('bold') || fontName.toLowerCase().includes('heavy');
  const isLarge = fontSize > 24;
  const isMedium = fontSize > 16;
  const wordCount = text.trim().split(/\s+/).length;
  const isShort = wordCount <= 5;
  const isAllCaps = text === text.toUpperCase() && /[A-Z]/.test(text);

  if (isLarge && isShort) {
    return { type: 'title', hierarchy: 1, confidence: 0.85 };
  }
  if ((isBold || isAllCaps) && isMedium && isShort) {
    return { type: 'heading', hierarchy: 2, confidence: 0.8 };
  }
  if (isMedium && isShort && !isBold) {
    return { type: 'subtitle', hierarchy: 3, confidence: 0.75 };
  }
  if (wordCount > 15 || box.height > fontSize * 3) {
    return { type: 'paragraph', hierarchy: 5, confidence: 0.9 };
  }
  return { type: 'text-block', hierarchy: 4, confidence: 0.7 };
}

function detectImageRegions(
  imageData: ImageData,
  pageWidth: number,
  pageHeight: number
): DetectedElement[] {
  const elements: DetectedElement[] = [];
  const { data, width, height } = imageData;
  const blockSize = 32;
  const threshold = 30;

  for (let by = 0; by < height; by += blockSize) {
    for (let bx = 0; bx < width; bx += blockSize) {
      let colorVariance = 0;
      let avgR = 0, avgG = 0, avgB = 0;
      let count = 0;

      for (let y = by; y < Math.min(by + blockSize, height); y++) {
        for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
          const i = (y * width + x) * 4;
          avgR += data[i];
          avgG += data[i + 1];
          avgB += data[i + 2];
          count++;
        }
      }

      if (count === 0) continue;
      avgR /= count;
      avgG /= count;
      avgB /= count;

      for (let y = by; y < Math.min(by + blockSize, height); y++) {
        for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
          const i = (y * width + x) * 4;
          colorVariance += Math.abs(data[i] - avgR) + Math.abs(data[i + 1] - avgG) + Math.abs(data[i + 2] - avgB);
        }
      }

      if (colorVariance / count > threshold * 3) {
        const box: BoundingBox = {
          x: (bx / width) * pageWidth,
          y: (by / height) * pageHeight,
          width: (blockSize / width) * pageWidth,
          height: (blockSize / height) * pageHeight,
        };

        const aspectRatio = box.width / box.height;
        let type: ElementType = 'image';
        let confidence = 0.6;

        if (box.width < pageWidth * 0.15 && box.height < pageHeight * 0.1) {
          type = aspectRatio > 0.8 && aspectRatio < 1.2 ? 'icon' : 'logo';
          confidence = 0.55;
        } else if (box.width > pageWidth * 0.7 && box.height > pageHeight * 0.7) {
          type = 'background-image';
          confidence = 0.7;
        } else if (aspectRatio > 1.5) {
          type = 'photo';
          confidence = 0.65;
        }

        elements.push({
          id: `img-${bx}-${by}`,
          type,
          boundingBox: box,
          confidence,
          hierarchy: type === 'background-image' ? 0 : 3,
          zIndex: type === 'background-image' ? 0 : 2,
          animationType: type === 'logo' ? 'pulse' : 'ken-burns',
        });
      }
    }
  }

  return mergeOverlappingElements(elements);
}

function mergeOverlappingElements(elements: DetectedElement[]): DetectedElement[] {
  const merged: DetectedElement[] = [];
  const used = new Set<number>();

  for (let i = 0; i < elements.length; i++) {
    if (used.has(i)) continue;
    let current = { ...elements[i] };

    for (let j = i + 1; j < elements.length; j++) {
      if (used.has(j)) continue;
      const other = elements[j];
      if (current.type === other.type && boxesOverlap(current.boundingBox, other.boundingBox)) {
        current = {
          ...current,
          boundingBox: mergeBoxes(current.boundingBox, other.boundingBox),
          confidence: Math.max(current.confidence, other.confidence),
        };
        used.add(j);
      }
    }

    merged.push(current);
    used.add(i);
  }

  return merged;
}

function boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y);
}

function mergeBoxes(a: BoundingBox, b: BoundingBox): BoundingBox {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
}

function detectScannedPage(textItems: WorkerAnalysisRequest['textItems']): boolean {
  return textItems.length === 0 || textItems.every((t) => t.str.trim().length === 0);
}

self.onmessage = (event: MessageEvent<WorkerAnalysisRequest>) => {
  const { type, pageNumber, imageData, textItems, pageWidth, pageHeight } = event.data;

  if (type !== 'analyze-page') return;

  const elements: DetectedElement[] = [];
  const isScanned = detectScannedPage(textItems);

  for (let i = 0; i < textItems.length; i++) {
    const item = textItems[i];
    if (!item.str.trim()) continue;

    const box: BoundingBox = {
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
    };

    const classification = classifyTextElement(item.str, item.fontSize, item.fontName, box);

    elements.push({
      id: `text-${pageNumber}-${i}`,
      type: classification.type,
      boundingBox: box,
      confidence: classification.confidence,
      hierarchy: classification.hierarchy,
      zIndex: 10 + classification.hierarchy,
      animationType: classification.type === 'heading' || classification.type === 'title' ? 'slide-up' : 'fade',
      content: item.str,
      fontSize: item.fontSize,
      fontWeight: item.fontName.toLowerCase().includes('bold') ? 'bold' : 'normal',
    });
  }

  if (imageData) {
    const imageElements = detectImageRegions(imageData, pageWidth, pageHeight);
    elements.push(...imageElements);
  }

  const response: WorkerAnalysisResponse = {
    type: 'analysis-complete',
    pageNumber,
    elements,
    isScanned,
  };

  self.postMessage(response);
};
