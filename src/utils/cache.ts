import type { PageAnalysis, DetectedElement } from '@/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  size: number;
}

const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_ENTRIES = 50;

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private totalSize = 0;

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  set(key: string, data: T, size = 0): void {
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      this.totalSize -= existing.size;
      this.cache.delete(key);
    }

    while (
      (this.totalSize + size > MAX_CACHE_SIZE || this.cache.size >= MAX_ENTRIES) &&
      this.cache.size > 0
    ) {
      const oldest = this.cache.keys().next().value;
      if (oldest) {
        const entry = this.cache.get(oldest)!;
        this.totalSize -= entry.size;
        this.cache.delete(oldest);
      }
    }

    this.cache.set(key, { data, timestamp: Date.now(), size });
    this.totalSize += size;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
    this.totalSize = 0;
  }
}

export const pageAnalysisCache = new LRUCache<PageAnalysis>();
export const canvasCache = new LRUCache<ImageBitmap>();
export const elementCache = new LRUCache<DetectedElement[]>();

export function estimatePageSize(analysis: PageAnalysis): number {
  let size = JSON.stringify(analysis).length;
  if (analysis.backgroundImage) {
    size += analysis.backgroundImage.length;
  }
  for (const el of analysis.elements) {
    if (el.imageData) size += el.imageData.length;
  }
  return size;
}
