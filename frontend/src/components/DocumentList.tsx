import { motion } from 'framer-motion';
import { useDeleteDocument, useDocuments } from '@/api/documents';
import { LoadingScreen } from '@/components/LoadingScreen';
import { getApiErrorMessage } from '@/api/client';
import type { Document, DocumentStatus } from '@/types/document';
import { cn, formatDate } from '@/utils/cn';

interface DocumentListProps {
  onSelect?: (document: Document) => void;
  selectedId?: string;
}

const statusConfig: Record<
  DocumentStatus,
  { label: string; className: string; dotClass: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    dotClass: 'bg-yellow-500',
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    dotClass: 'bg-blue-500 animate-pulse',
  },
  ready: {
    label: 'Ready',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    dotClass: 'bg-green-500',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    dotClass: 'bg-red-500',
  },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({ onSelect, selectedId }: DocumentListProps) {
  const { data, isLoading, isError, error } = useDocuments();
  const deleteMutation = useDeleteDocument();

  if (isLoading) {
    return <LoadingScreen message="Loading documents..." fullScreen={false} />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        Failed to load documents: {getApiErrorMessage(error)}
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No documents uploaded yet. Upload a PDF to get started.
        </p>
      </div>
    );
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this document?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-2">
      {data.data.map((doc, index) => {
        const status = statusConfig[doc.status];
        const isSelected = selectedId === doc.id;

        return (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect?.(doc)}
            className={cn(
              'group flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors',
              isSelected
                ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/20'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50',
            )}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSelect?.(doc);
            }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-5 w-5 text-red-600 dark:text-red-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 12h8v2H8v-2zm0 4h5v2H8v-2z" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {doc.original_filename}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatFileSize(doc.file_size)}</span>
                {doc.page_count !== null && (
                  <>
                    <span>·</span>
                    <span>{doc.page_count} pages</span>
                  </>
                )}
                <span>·</span>
                <span>{formatDate(doc.created_at)}</span>
              </div>
            </div>

            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                status.className,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', status.dotClass)} />
              {status.label}
            </span>

            <button
              type="button"
              onClick={(e) => void handleDelete(e, doc.id)}
              className="rounded p-1.5 text-gray-400 opacity-0 transition-opacity hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              aria-label={`Delete ${doc.original_filename}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
