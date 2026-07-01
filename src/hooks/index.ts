import { useCallback, useEffect, useRef } from 'react';
import { useFlipbookContext } from '@/context';
import { pdfEngine, aiDetectionLayer } from '@/pdf';
import { searchPages } from '@/utils/search';
import { generateId } from '@/utils';

export function usePDFLoader() {
  const { state, dispatch } = useFlipbookContext();

  const loadPDF = useCallback(
    async (source: string | ArrayBuffer | File) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_PROGRESS', payload: 0 });

      try {
        let data: string | ArrayBuffer;
        if (source instanceof File) {
          data = await source.arrayBuffer();
        } else {
          data = source;
        }

        const info = await pdfEngine.loadDocument(data);
        dispatch({ type: 'SET_DOCUMENT_INFO', payload: info });
        dispatch({ type: 'SET_TOTAL_PAGES', payload: info.numPages });

        const batchSize = 3;
        for (let i = 1; i <= info.numPages; i += batchSize) {
          const batch = [];
          for (let j = i; j < Math.min(i + batchSize, info.numPages + 1); j++) {
            batch.push(
              pdfEngine.analyzePage(j).then(async (analysis) => {
                if (analysis.isScanned && analysis.backgroundImage) {
                  return aiDetectionLayer.enhanceScannedPage(analysis, analysis.backgroundImage);
                }
                return analysis;
              })
            );
          }

          const results = await Promise.all(batch);
          for (const analysis of results) {
            dispatch({
              type: 'SET_PAGE_ANALYSIS',
              payload: { pageNumber: analysis.pageNumber, analysis },
            });
          }

          dispatch({
            type: 'SET_PROGRESS',
            payload: (Math.min(i + batchSize - 1, info.numPages) / info.numPages) * 100,
          });
        }

        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_PROGRESS', payload: 100 });
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          payload: err instanceof Error ? err.message : 'Failed to load PDF',
        });
      }
    },
    [dispatch]
  );

  return { loadPDF, isLoading: state.isLoading, progress: state.loadingProgress, error: state.error };
}

export function usePageNavigation() {
  const { state, dispatch } = useFlipbookContext();

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(0, Math.min(page, state.totalPages - 1));
      dispatch({ type: 'SET_CURRENT_PAGE', payload: clamped });
    },
    [dispatch, state.totalPages]
  );

  const nextPage = useCallback(() => goToPage(state.currentPage + 1), [goToPage, state.currentPage]);
  const prevPage = useCallback(() => goToPage(state.currentPage - 1), [goToPage, state.currentPage]);

  return { currentPage: state.currentPage, totalPages: state.totalPages, goToPage, nextPage, prevPage };
}

export function useZoom() {
  const { state, dispatch } = useFlipbookContext();
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;

  const setZoom = useCallback(
    (zoom: number) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)) } });
    },
    [dispatch]
  );

  const zoomIn = useCallback(() => setZoom(state.settings.zoom + 0.1), [setZoom, state.settings.zoom]);
  const zoomOut = useCallback(() => setZoom(state.settings.zoom - 0.1), [setZoom, state.settings.zoom]);

  return { zoom: state.settings.zoom, setZoom, zoomIn, zoomOut };
}

export function useFullscreen() {
  const { state, dispatch } = useFlipbookContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      dispatch({ type: 'UPDATE_SETTINGS', payload: { isFullscreen: true } });
    } else {
      await document.exitFullscreen();
      dispatch({ type: 'UPDATE_SETTINGS', payload: { isFullscreen: false } });
    }
  }, [dispatch]);

  useEffect(() => {
    const handler = () => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { isFullscreen: !!document.fullscreenElement } });
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [dispatch]);

  return { isFullscreen: state.settings.isFullscreen, toggleFullscreen, containerRef };
}

export function useSearch() {
  const { state, dispatch } = useFlipbookContext();

  const search = useCallback(
    (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
      const results = searchPages(query, state.pageAnalyses);
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
    },
    [dispatch, state.pageAnalyses]
  );

  const nextResult = useCallback(() => {
    if (state.activeSearchIndex < state.searchResults.length - 1) {
      dispatch({ type: 'SET_ACTIVE_SEARCH_INDEX', payload: state.activeSearchIndex + 1 });
    }
  }, [dispatch, state.activeSearchIndex, state.searchResults.length]);

  const prevResult = useCallback(() => {
    if (state.activeSearchIndex > 0) {
      dispatch({ type: 'SET_ACTIVE_SEARCH_INDEX', payload: state.activeSearchIndex - 1 });
    }
  }, [dispatch, state.activeSearchIndex]);

  const goToActiveResult = useCallback(() => {
    const result = state.searchResults[state.activeSearchIndex];
    if (result) {
      dispatch({ type: 'SET_CURRENT_PAGE', payload: result.pageNumber - 1 });
    }
  }, [dispatch, state.searchResults, state.activeSearchIndex]);

  return {
    query: state.searchQuery,
    results: state.searchResults,
    activeIndex: state.activeSearchIndex,
    search,
    nextResult,
    prevResult,
    goToActiveResult,
  };
}

export function useBookmarks() {
  const { state, dispatch } = useFlipbookContext();

  const addBookmark = useCallback(() => {
    const bookmark = {
      id: generateId('bm'),
      pageNumber: state.currentPage,
      title: `Page ${state.currentPage + 1}`,
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADD_BOOKMARK', payload: bookmark });
  }, [dispatch, state.currentPage]);

  const removeBookmark = useCallback(
    (id: string) => dispatch({ type: 'REMOVE_BOOKMARK', payload: id }),
    [dispatch]
  );

  return { bookmarks: state.bookmarks, addBookmark, removeBookmark };
}

export function useReadingMode() {
  const { state, dispatch } = useFlipbookContext();

  const toggleReadingMode = useCallback(() => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { readingMode: !state.settings.readingMode } });
  }, [dispatch, state.settings.readingMode]);

  const setActiveElement = useCallback(
    (id: string | null) => dispatch({ type: 'SET_ACTIVE_READING_ELEMENT', payload: id }),
    [dispatch]
  );

  return {
    readingMode: state.settings.readingMode,
    activeElementId: state.activeReadingElementId,
    toggleReadingMode,
    setActiveElement,
  };
}

export function useKeyboardNavigation() {
  const { nextPage, prevPage } = usePageNavigation();
  const { zoomIn, zoomOut } = useZoom();
  const { toggleFullscreen } = useFullscreen();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          nextPage();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          prevPage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case 'f':
        case 'F11':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Home':
          e.preventDefault();
          break;
        case 'End':
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nextPage, prevPage, zoomIn, zoomOut, toggleFullscreen]);
}

export function useIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = useCallback(
    (element: HTMLElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach(callback);
      }, options);

      if (element) observerRef.current.observe(element);
    },
    [callback, options]
  );

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return observe;
}

export function useLazyPages() {
  const { state } = useFlipbookContext();
  const { currentPage, totalPages, settings, pageAnalyses } = state;

  const visiblePages = [];
  const range = settings.lazyLoadRange;
  const start = Math.max(0, currentPage - range);
  const end = Math.min(totalPages - 1, currentPage + range);

  for (let i = start; i <= end; i++) {
    visiblePages.push(i);
  }

  return { visiblePages, pageAnalyses, currentPage };
}
