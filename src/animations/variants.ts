import type { Variants, Transition } from 'framer-motion';
import type { AnimationType, ElementType } from '@/types';

const baseTransition: Transition = {
  duration: 0.6,
  ease: [0.25, 0.46, 0.45, 0.94],
};

export const textAnimations: Record<string, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: baseTransition },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { ...baseTransition, duration: 0.7 } },
  },
  'slide-left': {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: baseTransition },
  },
  typewriter: {
    hidden: { opacity: 0, width: 0 },
    visible: { opacity: 1, width: 'auto', transition: { duration: 1.2, ease: 'linear' } },
  },
  'character-reveal': {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
  },
  'word-reveal': {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  },
  underline: {
    hidden: { opacity: 0, backgroundSize: '0% 2px' },
    visible: {
      opacity: 1,
      backgroundSize: '100% 2px',
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  },
  'marker-highlight': {
    hidden: { opacity: 0, backgroundSize: '0% 100%' },
    visible: {
      opacity: 1,
      backgroundSize: '100% 100%',
      transition: { duration: 0.6, delay: 0.2 },
    },
  },
  glow: {
    hidden: { opacity: 0, textShadow: '0 0 0px transparent' },
    visible: {
      opacity: 1,
      textShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
      transition: { duration: 1, repeat: Infinity, repeatType: 'reverse' },
    },
  },
  'gradient-sweep': {
    hidden: { opacity: 0, backgroundPosition: '200% center' },
    visible: {
      opacity: 1,
      backgroundPosition: '0% center',
      transition: { duration: 1.5 },
    },
  },
  'reading-highlight': {
    hidden: { opacity: 0.4 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  },
};

export const imageAnimations: Record<string, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: baseTransition },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { ...baseTransition, duration: 0.8 } },
  },
  'ken-burns': {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 8, ease: 'linear' },
    },
  },
  parallax: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1 } },
  },
  float: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: [0, -8, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  tilt: {
    hidden: { opacity: 0, rotateX: 15, rotateY: -10 },
    visible: { opacity: 1, rotateX: 0, rotateY: 0, transition: baseTransition },
  },
  'blur-to-sharp': {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.8 } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200 } },
  },
  rotate: {
    hidden: { opacity: 0, rotate: -90 },
    visible: { opacity: 1, rotate: 0, transition: baseTransition },
  },
  depth: {
    hidden: { opacity: 0, z: -50 },
    visible: { opacity: 1, z: 0, transition: { duration: 1 } },
  },
  'mask-reveal': {
    hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
    visible: { opacity: 1, clipPath: 'inset(0 0% 0 0)', transition: { duration: 0.8 } },
  },
  'light-sweep': {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  },
};

export const logoAnimations: Record<string, Variants> = {
  glow: {
    hidden: { opacity: 0, filter: 'drop-shadow(0 0 0 transparent)' },
    visible: {
      opacity: 1,
      filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.5))',
      transition: { duration: 1, repeat: Infinity, repeatType: 'reverse' },
    },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300 } },
  },
  bounce: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.6 } },
  },
  pulse: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity },
    },
  },
  'light-reflection': {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  },
  '3d-rotate': {
    hidden: { opacity: 0, rotateY: 90 },
    visible: { opacity: 1, rotateY: 0, transition: { duration: 0.8 } },
  },
  elastic: {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 10 } },
  },
};

export const iconAnimations: Record<string, Variants> = {
  bounce: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.5 } },
  },
  pop: {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500 } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: baseTransition },
  },
  rotate: {
    hidden: { opacity: 0, rotate: -180 },
    visible: { opacity: 1, rotate: 0, transition: { duration: 0.5 } },
  },
  hover: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: baseTransition },
  },
  float: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      y: [0, -5, 0],
      transition: { duration: 2, repeat: Infinity },
    },
  },
};

export const backgroundAnimations: Record<string, Variants> = {
  gradient: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } },
  },
  particles: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  },
  noise: {
    hidden: { opacity: 0 },
    visible: { opacity: 0.03, transition: { duration: 0.3 } },
  },
  'light-rays': {
    hidden: { opacity: 0 },
    visible: { opacity: 0.15, transition: { duration: 1.5 } },
  },
  'moving-shadows': {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  },
  depth: {
    hidden: { opacity: 0, scale: 1.05 },
    visible: { opacity: 1, scale: 1, transition: { duration: 2 } },
  },
  'glass-morphism': {
    hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
    visible: { opacity: 1, backdropFilter: 'blur(10px)', transition: { duration: 0.6 } },
  },
};

const TEXT_TYPES: ElementType[] = ['heading', 'paragraph', 'title', 'subtitle', 'text-block'];
const IMAGE_TYPES: ElementType[] = ['image', 'photo', 'illustration', 'background-image'];
const LOGO_TYPES: ElementType[] = ['logo'];
const ICON_TYPES: ElementType[] = ['icon', 'badge', 'sticker', 'button', 'qr-code'];

export function getAnimationVariants(
  animationType: AnimationType,
  elementType: ElementType
): Variants {
  if (animationType !== 'none') {
    const allAnimations = {
      ...textAnimations,
      ...imageAnimations,
      ...logoAnimations,
      ...iconAnimations,
      ...backgroundAnimations,
    };
    if (allAnimations[animationType]) {
      return allAnimations[animationType];
    }
  }

  if (TEXT_TYPES.includes(elementType)) return textAnimations.fade;
  if (LOGO_TYPES.includes(elementType)) return logoAnimations.pulse;
  if (ICON_TYPES.includes(elementType)) return iconAnimations.bounce;
  if (IMAGE_TYPES.includes(elementType)) return imageAnimations['ken-burns'];
  return textAnimations.fade;
}

export function getStaggerDelay(index: number, baseDelay = 0.1): number {
  return index * baseDelay;
}

export function getParagraphStagger(index: number): number {
  return 0.15 + index * 0.12;
}
