import { useEffect, useRef, useCallback } from 'react';
import { PageFlip } from 'page-flip';
import type { PageAnalysis } from '@/types';
import { AnimatedPage } from './AnimatedPage';
import styles from '@/styles/flipbook.module.css';

interface PageFlipBookProps {
  pageAnalyses: Map<number, PageAnalysis>;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  animationsEnabled: boolean;
  readingMode: boolean;
  activeElementId?: string | null;
  coverType: 'hard' | 'soft';
  zoom: number;
}

export function PageFlipBook({
  pageAnalyses,
  totalPages,
  currentPage,
  onPageChange,
  animationsEnabled,
  readingMode,
  activeElementId,
  coverType,
  zoom,
}: PageFlipBookProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const initializedRef = useRef(false);

  const initFlipBook = useCallback(() => {
    if (!containerRef.current || initializedRef.current || totalPages === 0) return;

    const pageElements = containerRef.current.querySelectorAll(`.${styles.flipPage}`);
    if (pageElements.length === 0) return;

    const width = Math.min(containerRef.current.clientWidth / 2, 400) || 400;
    const height = Math.min(containerRef.current.clientHeight, 560) || 560;

    const pageFlip = new PageFlip(containerRef.current, {
      width,
      height,
      size: 'stretch',
      minWidth: 280,
      maxWidth: 800,
      minHeight: 360,
      maxHeight: 1200,
      drawShadow: true,
      flippingTime: 800,
      usePortrait: window.innerWidth < 768,
      startPage: currentPage,
      autoSize: true,
      maxShadowOpacity: 0.5,
      showCover: true,
      mobileScrollSupport: true,
      clickEventForward: true,
      useMouseEvents: true,
      swipeDistance: 30,
      showPageCorners: true,
      disableFlipByClick: false,
    });

    pageFlip.loadFromHTML(pageElements);
    pageFlip.on('flip', (e: { data: number }) => {
      onPageChange(e.data);
    });

    flipRef.current = pageFlip;
    initializedRef.current = true;
  }, [totalPages, currentPage, onPageChange]);

  useEffect(() => {
    const timer = setTimeout(initFlipBook, 100);
    return () => {
      clearTimeout(timer);
      if (flipRef.current) {
        flipRef.current.destroy();
        flipRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [initFlipBook, totalPages]);

  useEffect(() => {
    if (flipRef.current && currentPage !== flipRef.current.getCurrentPageIndex()) {
      flipRef.current.flip(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    const handleResize = () => flipRef.current?.update();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={`${styles.flipbookWrapper} ${coverType === 'hard' ? styles.hardCover : styles.softCover}`}
      style={{ transform: `scale(${zoom})` }}
    >
      <div className={styles.flipbookContainer} ref={containerRef}>
        {Array.from({ length: totalPages }, (_, i) => {
          const analysis = pageAnalyses.get(i + 1);
          return (
            <div key={i} className={styles.flipPage} data-page-number={i}>
              {analysis ? (
                <AnimatedPage
                  analysis={analysis}
                  isVisible={Math.abs(i - currentPage) <= 2}
                  animationsEnabled={animationsEnabled}
                  readingMode={readingMode}
                  activeElementId={activeElementId}
                />
              ) : (
                <div className={styles.pageLoading}>
                  <div className={styles.spinner} />
                  <span>Loading page {i + 1}...</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
