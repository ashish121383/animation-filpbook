import type { SearchResult } from '@/types';
import styles from '@/styles/search.module.css';

interface SearchResultsProps {
  results: SearchResult[];
  activeIndex: number;
  onResultClick: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  visible: boolean;
}

export function SearchResults({
  results,
  activeIndex,
  onResultClick,
  onNext,
  onPrev,
  visible,
}: SearchResultsProps) {
  if (!visible || results.length === 0) return null;

  return (
    <div className={styles.searchResults} role="search" aria-label="Search results">
      <div className={styles.searchHeader}>
        <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
        <div className={styles.searchNav}>
          <button onClick={onPrev} disabled={activeIndex <= 0} aria-label="Previous result">‹</button>
          <span>{activeIndex + 1} / {results.length}</span>
          <button onClick={onNext} disabled={activeIndex >= results.length - 1} aria-label="Next result">›</button>
        </div>
      </div>
      <ul className={styles.resultList}>
        {results.slice(0, 20).map((result, index) => (
          <li key={`${result.pageNumber}-${result.elementId}-${result.index}`}>
            <button
              className={`${styles.resultItem} ${index === activeIndex ? styles.active : ''}`}
              onClick={() => onResultClick(index)}
            >
              <span className={styles.resultPage}>Page {result.pageNumber}</span>
              <span className={styles.resultText}>{result.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
