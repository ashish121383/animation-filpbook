import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiClient } from './client';
import type {
  Document,
  DocumentListResponse,
  PageListResponse,
  UploadResponse,
} from '@/types/document';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export async function uploadDocument(
  file: File,
  onProgress?: (percentage: number) => void,
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axios.post<UploadResponse>(`${API_BASE_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600_000,
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
  return data;
}

export async function fetchDocuments(
  page = 1,
  perPage = 20,
): Promise<DocumentListResponse> {
  const { data } = await apiClient.get<DocumentListResponse>('/documents', {
    params: { page, per_page: perPage },
  });
  return data;
}

export async function fetchDocument(id: string): Promise<Document> {
  const { data } = await apiClient.get<Document>(`/documents/${id}`);
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/documents/${id}`);
}

export async function fetchPages(documentId: string): Promise<PageListResponse> {
  const { data } = await apiClient.get<PageListResponse>('/pages', {
    params: { document_id: documentId },
  });
  return data;
}

export function useDocuments(page = 1) {
  return useQuery({
    queryKey: ['documents', page],
    queryFn: () => fetchDocuments(page),
    refetchInterval: (query) => {
      const docs = query.state.data?.data;
      if (docs?.some((d) => d.status === 'pending' || d.status === 'processing')) {
        return 3000;
      }
      return false;
    },
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => fetchDocument(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'pending' || status === 'processing') {
        return 3000;
      }
      return false;
    },
  });
}

export function usePages(documentId: string) {
  return useQuery({
    queryKey: ['pages', documentId],
    queryFn: () => fetchPages(documentId),
    enabled: !!documentId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (percentage: number) => void;
    }) => uploadDocument(file, onProgress),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
