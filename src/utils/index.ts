import type { BoundingBox, DetectedElement, ElementType, AnimationType } from '@/types';

export function generateId(prefix = 'el'): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: Parameters<T>) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

export function boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

export function normalizeBox(
  box: BoundingBox,
  pageWidth: number,
  pageHeight: number
): BoundingBox {
  return {
    x: (box.x / pageWidth) * 100,
    y: (box.y / pageHeight) * 100,
    width: (box.width / pageWidth) * 100,
    height: (box.height / pageHeight) * 100,
  };
}

export function denormalizeBox(
  box: BoundingBox,
  pageWidth: number,
  pageHeight: number
): BoundingBox {
  return {
    x: (box.x / 100) * pageWidth,
    y: (box.y / 100) * pageHeight,
    width: (box.width / 100) * pageWidth,
    height: (box.height / 100) * pageHeight,
  };
}

const TEXT_TYPES: ElementType[] = ['heading', 'paragraph', 'title', 'subtitle', 'text-block'];
const IMAGE_TYPES: ElementType[] = ['image', 'photo', 'illustration', 'background-image'];
const LOGO_TYPES: ElementType[] = ['logo'];
const ICON_TYPES: ElementType[] = ['icon', 'badge', 'sticker', 'button'];

export function getDefaultAnimation(type: ElementType): AnimationType {
  if (TEXT_TYPES.includes(type)) {
    if (type === 'heading' || type === 'title') return 'slide-up';
    if (type === 'subtitle') return 'fade';
    return 'fade';
  }
  if (LOGO_TYPES.includes(type)) return 'pulse';
  if (ICON_TYPES.includes(type)) return 'bounce';
  if (IMAGE_TYPES.includes(type)) return 'ken-burns';
  if (type === 'table' || type === 'chart') return 'fade';
  if (type === 'qr-code') return 'scale';
  if (type === 'background-image') return 'depth';
  return 'fade';
}

export function getLayerForType(type: ElementType): string {
  if (TEXT_TYPES.includes(type)) return 'text';
  if (LOGO_TYPES.includes(type)) return 'logo';
  if (ICON_TYPES.includes(type)) return 'shape';
  if (type === 'table' || type === 'chart') return 'table';
  if (IMAGE_TYPES.includes(type)) return 'image';
  if (type === 'shape' || type === 'colored-box' || type === 'callout') return 'shape';
  return 'image';
}

export function groupElementsByLayer(elements: DetectedElement[]): Record<string, DetectedElement[]> {
  const groups: Record<string, DetectedElement[]> = {
    background: [],
    image: [],
    text: [],
    logo: [],
    shape: [],
    table: [],
    highlight: [],
    animation: [],
  };

  for (const el of elements) {
    const layer = getLayerForType(el.type);
    if (el.type === 'background-image') {
      groups.background.push(el);
    } else {
      groups[layer]?.push(el);
    }
  }

  return groups;
}

export function sortByHierarchy(elements: DetectedElement[]): DetectedElement[] {
  return [...elements].sort((a, b) => a.hierarchy - b.hierarchy || a.zIndex - b.zIndex);
}

export async function canvasToImageData(canvas: HTMLCanvasElement): Promise<ImageData> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function imageDataToBase64(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightSearchText(text: string, query: string): string {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}
