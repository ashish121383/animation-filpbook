import { useCallback } from 'react';
import { useFlipbookContext } from '@/context';
import {
  PageFlipBook,
  Toolbar,
  ThumbnailPanel,
  SearchResults,
  BookmarkPanel,
  LoadingOverlay,
} from '@/components';
import {
  usePDFLoader,
  usePageNavigation,
  useZoom,
  useFullscreen,
  useSearch,
  useBookmarks,
  useReadingMode,
  useKeyboardNavigation,
} from '@/hooks';
import styles from '@/styles/flipbook.module.css';

export function FlipbookViewer() {
  const { state, dispatch } = useFlipbookContext();
  const { loadPDF, isLoading, progress } = usePDFLoader();
  const { currentPage, totalPages, goToPage, nextPage, prevPage } = usePageNavigation();
  const { zoom, zoomIn, zoomOut } = useZoom();
  const { isFullscreen, toggleFullscreen, containerRef } = useFullscreen();
  const { results, activeIndex, search, nextResult, prevResult, goToActiveResult, query } = useSearch();
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();
  const { readingMode, activeElementId, toggleReadingMode } = useReadingMode();

  useKeyboardNavigation();

  const handleFileUpload = useCallback(
    (file: File) => loadPDF(file),
    [loadPDF]
  );

  const toggleThumbnails = useCallback(() => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { showThumbnails: !state.settings.showThumbnails },
    });
  }, [dispatch, state.settings.showThumbnails]);

  const toggleAnimations = useCallback(() => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { animationsEnabled: !state.settings.animationsEnabled },
    });
  }, [dispatch, state.settings.animationsEnabled]);

  const handleSearchResultClick = useCallback(
    (index: number) => {
      dispatch({ type: 'SET_ACTIVE_SEARCH_INDEX', payload: index });
      const result = results[index];
      if (result) goToPage(result.pageNumber - 1);
    },
    [dispatch, results, goToPage]
  );

  return (
    <div
      ref={containerRef}
      className={`${styles.viewer} ${isFullscreen ? styles.fullscreen : ''}`}
    >
      <Toolbar
        currentPage={currentPage}
        totalPages={totalPages}
        zoom={zoom}
        isFullscreen={isFullscreen}
        readingMode={readingMode}
        showThumbnails={state.settings.showThumbnails}
        animationsEnabled={state.settings.animationsEnabled}
        onPrevPage={prevPage}
        onNextPage={nextPage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onToggleFullscreen={toggleFullscreen}
        onToggleReadingMode={toggleReadingMode}
        onToggleThumbnails={toggleThumbnails}
        onToggleAnimations={toggleAnimations}
        onSearch={search}
        onAddBookmark={addBookmark}
        onFileUpload={handleFileUpload}
      />

      <div className={styles.viewerBody}>
        <ThumbnailPanel
          pageAnalyses={state.pageAnalyses}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageSelect={goToPage}
          visible={state.settings.showThumbnails}
        />

        <main className={styles.mainContent}>
          {state.error && (
            <div className={styles.error} role="alert">
              <p>{state.error}</p>
            </div>
          )}

          {totalPages > 0 ? (
            <PageFlipBook
              pageAnalyses={state.pageAnalyses}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={goToPage}
              animationsEnabled={state.settings.animationsEnabled}
              readingMode={readingMode}
              activeElementId={activeElementId}
              coverType={state.settings.coverType}
              zoom={zoom}
            />
          ) : (
            !isLoading && (
              <div className={styles.welcome}>
                <div className={styles.welcomeContent}>
                  <h1>Premium AI Flipbook</h1>
                  <p>Upload a PDF to transform it into an interactive digital magazine with AI-powered element detection and premium animations.</p>
                  <label className={styles.uploadArea}>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      hidden
                    />
                    <span className={styles.uploadIcon}>📄</span>
                    <span>Drop PDF here or click to browse</span>
                  </label>
                </div>
              </div>
            )
          )}

          <SearchResults
            results={results}
            activeIndex={activeIndex}
            onResultClick={handleSearchResultClick}
            onNext={() => { nextResult(); goToActiveResult(); }}
            onPrev={() => { prevResult(); goToActiveResult(); }}
            visible={query.length > 0}
          />
        </main>

        <BookmarkPanel
          bookmarks={bookmarks}
          onBookmarkClick={goToPage}
          onRemoveBookmark={removeBookmark}
        />
      </div>

      {isLoading && <LoadingOverlay progress={progress} />}
    </div>
  );
}
