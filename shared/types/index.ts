export type BoundingBox = [number, number, number, number];

export type ObjectType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'table'
  | 'chart'
  | 'caption'
  | 'footer'
  | 'header'
  | 'logo'
  | 'barcode'
  | 'qrcode'
  | 'signature'
  | 'image'
  | 'icon';

export type AnimationType =
  | 'slideDown'
  | 'slideUp'
  | 'fade'
  | 'scale'
  | 'glow'
  | 'typewriter'
  | 'word'
  | 'line'
  | 'zoom'
  | 'parallax'
  | 'rotate'
  | 'rowReveal'
  | 'columnReveal'
  | 'cellReveal'
  | 'grow'
  | 'pop'
  | 'bounce';

export interface PageObject {
  id: string;
  type: ObjectType;
  text?: string;
  bbox: BoundingBox;
  animation?: AnimationType;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface PageAnimationData {
  page: number;
  objects: PageObject[];
  width?: number;
  height?: number;
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  pageCount: number;
  createdAt: string;
  ocrEngine?: string;
  languages?: string[];
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  environment: string;
  timestamp: string;
}
