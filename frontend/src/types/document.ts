export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  page_count: number | null;
  status: DocumentStatus;
  error_message: string | null;
  storage_backend: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  document_id: string;
  page_number: number;
  width: number | null;
  height: number | null;
  thumbnail_path: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UploadResponse {
  document: Document;
  message: string;
}

export interface DocumentListResponse {
  data: Document[];
  total: number;
  page: number;
  per_page: number;
}

export interface PageListResponse {
  data: Page[];
  total: number;
  document_id: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
