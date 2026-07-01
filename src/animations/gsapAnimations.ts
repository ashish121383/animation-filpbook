import gsap from 'gsap';

export function animatePageTurn(
  element: HTMLElement,
  direction: 'forward' | 'backward' = 'forward'
): gsap.core.Tween {
  return gsap.fromTo(
    element,
    {
      rotateY: direction === 'forward' ? 0 : -180,
      transformOrigin: 'left center',
    },
    {
      rotateY: direction === 'forward' ? -180 : 0,
      duration: 0.8,
      ease: 'power2.inOut',
    }
  );
}

export function animateLightSweep(element: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline();
  tl.fromTo(
    element,
    { backgroundPosition: '-200% 0' },
    { backgroundPosition: '200% 0', duration: 1.5, ease: 'power1.inOut' }
  );
  return tl;
}

export function animateTypewriter(
  element: HTMLElement,
  text: string,
  speed = 0.05
): gsap.core.Timeline {
  element.textContent = '';
  const tl = gsap.timeline();
  const chars = text.split('');

  chars.forEach((char, i) => {
    tl.call(() => {
      element.textContent += char;
    }, [], i * speed);
  });

  return tl;
}

export function animateKenBurns(
  element: HTMLElement,
  duration = 8
): gsap.core.Tween {
  return gsap.fromTo(
    element,
    { scale: 1.1, x: '-2%', y: '-1%' },
    {
      scale: 1,
      x: '2%',
      y: '1%',
      duration,
      ease: 'none',
      repeat: -1,
      yoyo: true,
    }
  );
}

export function animateReadingHighlight(
  elements: HTMLElement[],
  activeIndex: number
): void {
  elements.forEach((el, i) => {
    gsap.to(el, {
      opacity: i === activeIndex ? 1 : 0.4,
      backgroundColor: i === activeIndex ? 'rgba(255, 235, 59, 0.2)' : 'transparent',
      duration: 0.3,
    });
  });
}

export function killAllAnimations(): void {
  gsap.killTweensOf('*');
}
