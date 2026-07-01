import type { Bookmark } from '@/types';
import styles from '@/styles/bookmarks.module.css';

interface BookmarkPanelProps {
  bookmarks: Bookmark[];
  onBookmarkClick: (pageNumber: number) => void;
  onRemoveBookmark: (id: string) => void;
}

export function BookmarkPanel({ bookmarks, onBookmarkClick, onRemoveBookmark }: BookmarkPanelProps) {
  if (bookmarks.length === 0) return null;

  return (
    <aside className={styles.bookmarkPanel} aria-label="Bookmarks">
      <h3 className={styles.bookmarkTitle}>Bookmarks</h3>
      <ul className={styles.bookmarkList}>
        {bookmarks.map((bookmark) => (
          <li key={bookmark.id} className={styles.bookmarkItem}>
            <button
              className={styles.bookmarkLink}
              onClick={() => onBookmarkClick(bookmark.pageNumber)}
            >
              <span className={styles.bookmarkPage}>Page {bookmark.pageNumber + 1}</span>
              <span className={styles.bookmarkName}>{bookmark.title}</span>
            </button>
            <button
              className={styles.bookmarkRemove}
              onClick={() => onRemoveBookmark(bookmark.id)}
              aria-label={`Remove bookmark: ${bookmark.title}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
