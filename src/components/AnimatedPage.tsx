import { useMemo } from 'react';
import type { PageAnalysis } from '@/types';
import { groupElementsByLayer } from '@/utils';
import { aiDetectionLayer } from '@/pdf';
import {
  BackgroundLayer,
  ImageLayer,
  TextLayer,
  LogoLayer,
  ShapeLayer,
  TableLayer,
  HighlightLayer,
  AnimationLayer,
} from './layers/PageLayers';
import styles from '@/styles/page.module.css';

interface AnimatedPageProps {
  analysis: PageAnalysis;
  isVisible: boolean;
  animationsEnabled: boolean;
  readingMode: boolean;
  activeElementId?: string | null;
  pageRef?: React.RefObject<HTMLDivElement | null>;
}

export function AnimatedPage({
  analysis,
  isVisible,
  animationsEnabled,
  readingMode,
  activeElementId,
  pageRef,
}: AnimatedPageProps) {
  const layers = useMemo(() => {
    const enhanced = aiDetectionLayer.assignAnimations(
      aiDetectionLayer.detectTables(analysis.elements)
    );
    return groupElementsByLayer(enhanced);
  }, [analysis.elements]);

  const layerProps = {
    isVisible,
    animationsEnabled,
    activeElementId: readingMode ? activeElementId : null,
  };

  return (
    <div
      ref={pageRef}
      className={styles.animatedPage}
      style={{ aspectRatio: `${analysis.width} / ${analysis.height}` }}
      data-page={analysis.pageNumber}
      role="region"
      aria-label={`Page ${analysis.pageNumber}`}
    >
      {analysis.backgroundImage && (
        <img
          src={analysis.backgroundImage}
          alt=""
          className={styles.pageBackground}
          draggable={false}
          aria-hidden="true"
        />
      )}

      <BackgroundLayer elements={layers.background} {...layerProps} />
      <ImageLayer elements={layers.image} {...layerProps} />
      <ShapeLayer elements={layers.shape} {...layerProps} />
      <TableLayer elements={layers.table} {...layerProps} />
      <LogoLayer elements={layers.logo} {...layerProps} />
      <TextLayer elements={layers.text} {...layerProps} />
      <HighlightLayer elements={[]} {...layerProps} />
      <AnimationLayer elements={[]} {...layerProps} />
    </div>
  );
}
