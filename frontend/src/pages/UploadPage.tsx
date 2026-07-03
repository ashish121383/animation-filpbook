import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentList } from '@/components/DocumentList';
import { UploadZone } from '@/components/UploadZone';
import type { Document } from '@/types/document';

export function UploadPage() {
  const navigate = useNavigate();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const handleUploadComplete = (documentId: string) => {
    navigate(`/documents/${documentId}`);
  };

  const handleSelect = (doc: Document) => {
    setSelectedDoc(doc);
    if (doc.status === 'ready') {
      navigate(`/documents/${doc.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="font-display mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Upload PDF
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a PDF document for OCR processing and flipbook generation. Supports files up to
          500MB and 500+ pages.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8"
      >
        <UploadZone onUploadComplete={handleUploadComplete} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Your Documents
          {selectedDoc && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              — {selectedDoc.original_filename}
            </span>
          )}
        </h3>
        <DocumentList onSelect={handleSelect} selectedId={selectedDoc?.id} />
      </motion.div>
    </div>
  );
}
