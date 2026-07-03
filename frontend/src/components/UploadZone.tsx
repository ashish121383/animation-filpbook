import { motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { useUploadDocument } from '@/api/documents';
import { getApiErrorMessage } from '@/api/client';
import { cn } from '@/utils/cn';

interface UploadZoneProps {
  onUploadComplete?: (documentId: string) => void;
  className?: string;
}

export function UploadZone({ onUploadComplete, className }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocument();

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setProgress(0);

      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are allowed');
        return;
      }

      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File exceeds maximum size of 500MB');
        return;
      }

      try {
        const result = await uploadMutation.mutateAsync({
          file,
          onProgress: setProgress,
        });
        setProgress(100);
        onUploadComplete?.(result.document.id);
      } catch (err) {
        setError(getApiErrorMessage(err));
        setProgress(0);
      }
    },
    [uploadMutation, onUploadComplete],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        void handleUpload(file);
      }
    },
    [handleUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void handleUpload(file);
      }
      e.target.value = '';
    },
    [handleUpload],
  );

  const isUploading = uploadMutation.isPending;

  return (
    <div className={cn('w-full', className)}>
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        animate={{ scale: isDragging ? 1.02 : 1 }}
        className={cn(
          'relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          isDragging
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
            : 'border-gray-300 hover:border-brand-400 dark:border-gray-600 dark:hover:border-brand-500',
          isUploading && 'pointer-events-none opacity-70',
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload PDF file"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
          <svg
            className="h-8 w-8 text-brand-600 dark:text-brand-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {isUploading ? (
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Uploading... {progress}%
            </p>
            <div className="mx-auto h-2 max-w-xs overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <motion.div
                className="h-full rounded-full bg-brand-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        ) : (
          <>
            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Drag & drop your PDF here
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              or click to browse · Max 500MB
            </p>
          </>
        )}
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
