import { motion } from 'framer-motion';
import type { DetectedElement } from '@/types';
import { getAnimationVariants } from '@/animations';
import styles from '@/styles/layers.module.css';

interface LayerProps {
  elements: DetectedElement[];
  isVisible: boolean;
  animationsEnabled: boolean;
  activeElementId?: string | null;
}

interface ElementWrapperProps {
  element: DetectedElement;
  index: number;
  isVisible: boolean;
  animationsEnabled: boolean;
  isActive?: boolean;
  children?: React.ReactNode;
}

export function ElementWrapper({
  element,
  index,
  isVisible,
  animationsEnabled,
  isActive,
  children,
}: ElementWrapperProps) {
  const variants = getAnimationVariants(element.animationType, element.type);
  const { boundingBox: box } = element;

  return (
    <motion.div
      className={`${styles.element} ${isActive ? styles.active : ''}`}
      style={{
        left: `${box.x}%`,
        top: `${box.y}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
        zIndex: element.zIndex,
      }}
      variants={variants}
      initial={animationsEnabled ? 'hidden' : 'visible'}
      animate={isVisible && animationsEnabled ? 'visible' : 'visible'}
      transition={{ delay: index * 0.08 }}
      data-element-id={element.id}
      data-element-type={element.type}
      role="article"
      aria-label={`${element.type}: ${element.content?.slice(0, 50) || ''}`}
    >
      {children}
    </motion.div>
  );
}

export function BackgroundLayer({ elements, isVisible, animationsEnabled }: LayerProps) {
  return (
    <div className={styles.backgroundLayer} aria-hidden="true">
      {elements.map((el, i) => (
        <ElementWrapper
          key={el.id}
          element={el}
          index={i}
          isVisible={isVisible}
          animationsEnabled={animationsEnabled}
        >
          {el.imageData && (
            <img src={el.imageData} alt="" className={styles.bgImage} draggable={false} />
          )}
        </ElementWrapper>
      ))}
    </div>
  );
}

export function ImageLayer({ elements, isVisible, animationsEnabled }: LayerProps) {
  return (
    <div className={styles.imageLayer}>
      {elements.map((el, i) => (
        <ElementWrapper
          key={el.id}
          element={el}
          index={i}
          isVisible={isVisible}
          animationsEnabled={animationsEnabled}
        >
          {el.imageData ? (
            <img src={el.imageData} alt={el.type} className={styles.layerImage} draggable={false} />
          ) : (
            <div className={styles.imagePlaceholder} data-type={el.type} />
          )}
        </ElementWrapper>
      ))}
    </div>
  );
}

export function TextLayer({
  elements,
  isVisible,
  animationsEnabled,
  activeElementId,
}: LayerProps) {
  return (
    <div className={styles.textLayer}>
      {elements.map((el, i) => (
        <ElementWrapper
          key={el.id}
          element={el}
          index={i}
          isVisible={isVisible}
          animationsEnabled={animationsEnabled}
          isActive={activeElementId === el.id}
        >
          <span
            className={styles.textContent}
            style={{
              fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
              fontWeight: el.fontWeight,
              color: el.color,
            }}
          >
            {el.content}
          </span>
        </ElementWrapper>
      ))}
    </div>
  );
}

export function LogoLayer({ elements, isVisible, animationsEnabled }: LayerProps) {
  return (
    <div className={styles.logoLayer}>
      {elements.map((el, i) => (
        <ElementWrapper
          key={el.id}
          element={el}
          index={i}
          isVisible={isVisible}
          animationsEnabled={animationsEnabled}
        >
          {el.imageData ? (
            <img src={el.imageData} alt="Logo" className={styles.logoImage} draggable={false} />
          ) : (
            <div className={styles.logoPlaceholder}>{el.content || 'LOGO'}</div>
          )}
        </ElementWrapper>
      ))}
    </div>
  );
}

export function ShapeLayer({ elements, isVisible, animationsEnabled }: LayerProps) {
  return (
    <div className={styles.shapeLayer}>
      {elements.map((el, i) => (
        <ElementWrapper
          key={el.id}
          element={el}
          index={i}
          isVisible={isVisible}
          animationsEnabled={animationsEnabled}
        >
          <div className={styles.shape} data-type={el.type} />
        </ElementWrapper>
      ))}
    </div>
  );
}

export function TableLayer({ elements, isVisible, animationsEnabled }: LayerProps) {
  return (
    <div className={styles.tableLayer}>
      {elements.map((el, i) => (
        <ElementWrapper
          key={el.id}
          element={el}
          index={i}
          isVisible={isVisible}
          animationsEnabled={animationsEnabled}
        >
          <div className={styles.tableContainer}>
            {el.children?.map((child) => (
              <div key={child.id} className={styles.tableCell}>
                {child.content}
              </div>
            ))}
          </div>
        </ElementWrapper>
      ))}
    </div>
  );
}

export function HighlightLayer({
  elements,
  isVisible,
  animationsEnabled,
  activeElementId,
}: LayerProps) {
  return (
    <div className={styles.highlightLayer}>
      {elements.map((el, i) => (
        <ElementWrapper
          key={el.id}
          element={el}
          index={i}
          isVisible={isVisible}
          animationsEnabled={animationsEnabled}
          isActive={activeElementId === el.id}
        >
          <div className={styles.highlight} />
        </ElementWrapper>
      ))}
    </div>
  );
}

export function AnimationLayer({ elements, isVisible, animationsEnabled }: LayerProps) {
  return (
    <div className={styles.animationLayer} aria-hidden="true">
      {elements.map((el, i) => (
        <ElementWrapper
          key={el.id}
          element={el}
          index={i}
          isVisible={isVisible}
          animationsEnabled={animationsEnabled}
        >
          <div className={styles.particleEffect} />
        </ElementWrapper>
      ))}
    </div>
  );
}
