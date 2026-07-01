import { useState, useCallback } from 'react';
import styles from '@/styles/toolbar.module.css';

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  isFullscreen: boolean;
  readingMode: boolean;
  showThumbnails: boolean;
  animationsEnabled: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
  onToggleReadingMode: () => void;
  onToggleThumbnails: () => void;
  onToggleAnimations: () => void;
  onSearch: (query: string) => void;
  onAddBookmark: () => void;
  onFileUpload: (file: File) => void;
}

export function Toolbar({
  currentPage,
  totalPages,
  zoom,
  isFullscreen,
  readingMode,
  showThumbnails,
  animationsEnabled,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  onToggleReadingMode,
  onToggleThumbnails,
  onToggleAnimations,
  onSearch,
  onAddBookmark,
  onFileUpload,
}: ToolbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(searchQuery);
    },
    [searchQuery, onSearch]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileUpload(file);
    },
    [onFileUpload]
  );

  return (
    <nav className={styles.toolbar} role="toolbar" aria-label="Flipbook controls">
      <div className={styles.toolbarGroup}>
        <label className={styles.uploadBtn} aria-label="Upload PDF">
          <input type="file" accept=".pdf" onChange={handleFileChange} hidden />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </label>
      </div>

      <div className={styles.toolbarGroup}>
        <button
          className={styles.toolBtn}
          onClick={onPrevPage}
          disabled={currentPage <= 0}
          aria-label="Previous page"
        >
          ‹
        </button>
        <span className={styles.pageIndicator} aria-live="polite">
          {currentPage + 1} / {totalPages}
        </span>
        <button
          className={styles.toolBtn}
          onClick={onNextPage}
          disabled={currentPage >= totalPages - 1}
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      <div className={styles.toolbarGroup}>
        <button className={styles.toolBtn} onClick={onZoomOut} aria-label="Zoom out">−</button>
        <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
        <button className={styles.toolBtn} onClick={onZoomIn} aria-label="Zoom in">+</button>
      </div>

      <div className={styles.toolbarGroup}>
        <button
          className={`${styles.toolBtn} ${searchOpen ? styles.active : ''}`}
          onClick={() => setSearchOpen(!searchOpen)}
          aria-label="Search"
          aria-expanded={searchOpen}
        >
          🔍
        </button>
        {searchOpen && (
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in document..."
              className={styles.searchInput}
              aria-label="Search query"
            />
          </form>
        )}
        <button className={styles.toolBtn} onClick={onAddBookmark} aria-label="Add bookmark">
          ★
        </button>
        <button
          className={`${styles.toolBtn} ${showThumbnails ? styles.active : ''}`}
          onClick={onToggleThumbnails}
          aria-label="Toggle thumbnails"
          aria-pressed={showThumbnails}
        >
          ⊞
        </button>
        <button
          className={`${styles.toolBtn} ${readingMode ? styles.active : ''}`}
          onClick={onToggleReadingMode}
          aria-label="Reading mode"
          aria-pressed={readingMode}
        >
          📖
        </button>
        <button
          className={`${styles.toolBtn} ${animationsEnabled ? styles.active : ''}`}
          onClick={onToggleAnimations}
          aria-label="Toggle animations"
          aria-pressed={animationsEnabled}
        >
          ✨
        </button>
        <button
          className={styles.toolBtn}
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? '⊠' : '⛶'}
        </button>
      </div>
    </nav>
  );
}
