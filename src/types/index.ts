export type ElementType =
  | 'heading'
  | 'paragraph'
  | 'title'
  | 'subtitle'
  | 'text-block'
  | 'image'
  | 'logo'
  | 'icon'
  | 'person'
  | 'product'
  | 'background-image'
  | 'table'
  | 'chart'
  | 'qr-code'
  | 'callout'
  | 'badge'
  | 'sticker'
  | 'button'
  | 'colored-box'
  | 'photo'
  | 'illustration'
  | 'shape'
  | 'decorative';

export type TextAnimationType =
  | 'fade'
  | 'slide-up'
  | 'slide-left'
  | 'typewriter'
  | 'character-reveal'
  | 'word-reveal'
  | 'underline'
  | 'marker-highlight'
  | 'glow'
  | 'gradient-sweep'
  | 'reading-highlight';

export type ImageAnimationType =
  | 'fade'
  | 'zoom'
  | 'ken-burns'
  | 'parallax'
  | 'float'
  | 'tilt'
  | 'blur-to-sharp'
  | 'scale'
  | 'rotate'
  | 'depth'
  | 'mask-reveal'
  | 'light-sweep';

export type LogoAnimationType =
  | 'glow'
  | 'scale'
  | 'bounce'
  | 'pulse'
  | 'light-reflection'
  | '3d-rotate'
  | 'elastic';

export type IconAnimationType =
  | 'bounce'
  | 'pop'
  | 'scale'
  | 'rotate'
  | 'hover'
  | 'float';

export type BackgroundAnimationType =
  | 'gradient'
  | 'particles'
  | 'noise'
  | 'light-rays'
  | 'moving-shadows'
  | 'depth'
  | 'glass-morphism';

export type AnimationType =
  | TextAnimationType
  | ImageAnimationType
  | LogoAnimationType
  | IconAnimationType
  | BackgroundAnimationType
  | 'none';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedElement {
  id: string;
  type: ElementType;
  boundingBox: BoundingBox;
  confidence: number;
  hierarchy: number;
  zIndex: number;
  animationType: AnimationType;
  content?: string;
  imageData?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  children?: DetectedElement[];
}

export interface PageAnalysis {
  pageNumber: number;
  width: number;
  height: number;
  isScanned: boolean;
  elements: DetectedElement[];
  textContent: string;
  backgroundImage?: string;
}

export interface PDFDocumentInfo {
  numPages: number;
  title: string;
  author: string;
  subject: string;
}

export interface FlipbookSettings {
  zoom: number;
  isFullscreen: boolean;
  readingMode: boolean;
  showThumbnails: boolean;
  animationsEnabled: boolean;
  coverType: 'hard' | 'soft';
  magazineStyle: boolean;
  lazyLoadRange: number;
}

export interface SearchResult {
  pageNumber: number;
  elementId: string;
  text: string;
  index: number;
}

export interface Bookmark {
  id: string;
  pageNumber: number;
  title: string;
  createdAt: number;
}

export interface Note {
  id: string;
  pageNumber: number;
  elementId?: string;
  content: string;
  position: { x: number; y: number };
  createdAt: number;
}

export interface OCRProvider {
  name: 'tesseract' | 'google-vision' | 'azure-vision';
  recognize(imageData: ImageData | string): Promise<string>;
}

export type LayerType =
  | 'background'
  | 'image'
  | 'text'
  | 'logo'
  | 'shape'
  | 'table'
  | 'highlight'
  | 'animation';

export interface FlipbookState {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  loadingProgress: number;
  error: string | null;
  documentInfo: PDFDocumentInfo | null;
  pageAnalyses: Map<number, PageAnalysis>;
  settings: FlipbookSettings;
  searchQuery: string;
  searchResults: SearchResult[];
  activeSearchIndex: number;
  bookmarks: Bookmark[];
  notes: Note[];
  activeReadingElementId: string | null;
}

export type FlipbookAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DOCUMENT_INFO'; payload: PDFDocumentInfo }
  | { type: 'SET_TOTAL_PAGES'; payload: number }
  | { type: 'SET_PAGE_ANALYSIS'; payload: { pageNumber: number; analysis: PageAnalysis } }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<FlipbookSettings> }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: SearchResult[] }
  | { type: 'SET_ACTIVE_SEARCH_INDEX'; payload: number }
  | { type: 'ADD_BOOKMARK'; payload: Bookmark }
  | { type: 'REMOVE_BOOKMARK'; payload: string }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'REMOVE_NOTE'; payload: string }
  | { type: 'SET_ACTIVE_READING_ELEMENT'; payload: string | null };
