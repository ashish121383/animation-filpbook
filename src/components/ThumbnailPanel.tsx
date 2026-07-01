import type { PageAnalysis } from '@/types';
import styles from '@/styles/thumbnails.module.css';

interface ThumbnailPanelProps {
  pageAnalyses: Map<number, PageAnalysis>;
  totalPages: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
  visible: boolean;
}

export function ThumbnailPanel({
  pageAnalyses,
  totalPages,
  currentPage,
  onPageSelect,
  visible,
}: ThumbnailPanelProps) {
  if (!visible) return null;

  return (
    <aside className={styles.thumbnailPanel} aria-label="Page thumbnails">
      <h3 className={styles.thumbnailTitle}>Pages</h3>
      <div className={styles.thumbnailGrid}>
        {Array.from({ length: totalPages }, (_, i) => {
          const analysis = pageAnalyses.get(i + 1);
          const isActive = i === currentPage;

          return (
            <button
              key={i}
              className={`${styles.thumbnail} ${isActive ? styles.active : ''}`}
              onClick={() => onPageSelect(i)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {analysis?.backgroundImage ? (
                <img
                  src={analysis.backgroundImage}
                  alt={`Page ${i + 1} thumbnail`}
                  className={styles.thumbnailImage}
                  loading="lazy"
                />
              ) : (
                <div className={styles.thumbnailPlaceholder}>
                  <span>{i + 1}</span>
                </div>
              )}
              <span className={styles.thumbnailNumber}>{i + 1}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
