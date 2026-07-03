import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useDocument, usePages } from '@/api/documents';
import { LoadingScreen } from '@/components/LoadingScreen';
import { getApiErrorMessage } from '@/api/client';

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: document, isLoading, isError, error } = useDocument(id ?? '');
  const { data: pages } = usePages(id ?? '');

  if (isLoading) {
    return <LoadingScreen message="Loading document..." fullScreen={false} />;
  }

  if (isError || !document) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-red-600 dark:text-red-400">
          {isError ? getApiErrorMessage(error) : 'Document not found'}
        </p>
        <Link to="/upload" className="btn-primary mt-4 inline-block">
          Back to Upload
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/upload"
          className="mb-6 inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to documents
        </Link>

        <div className="card">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                {document.original_filename}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(document.file_size)}
                {document.page_count !== null && ` · ${document.page_count} pages`}
              </p>
            </div>
            <StatusBadge status={document.status} />
          </div>

          {document.status === 'processing' && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Processing document — extracting pages...
                </p>
              </div>
            </div>
          )}

          {document.status === 'failed' && document.error_message && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-300">{document.error_message}</p>
            </div>
          )}

          {pages && pages.data.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Pages</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pages.data.map((page) => (
                  <div
                    key={page.id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="mb-2 flex h-24 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                      <span className="text-2xl font-bold text-gray-400">{page.page_number}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Page {page.page_number}
                    </p>
                    {page.width && page.height && (
                      <p className="text-xs text-gray-500">
                        {Math.round(page.width)} × {Math.round(page.height)} pt
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {document.status === 'ready' && (
            <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
              <button type="button" className="btn-primary" disabled>
                Open Flipbook (Module 5)
              </button>
              <p className="mt-2 text-xs text-gray-500">Page flip viewer coming in Module 5</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    ready: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${styles[status] ?? ''}`}
    >
      {status}
    </span>
  );
}
