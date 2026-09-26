import { gsap, isReducedMotion, ANIMATION_CONFIG } from './gsapConfig';

/**
 * Standard page entrance animation
 */
export const pageEntrance = (container, options = {}) => {
  if (isReducedMotion() || !container) return;
  const { onComplete } = options;

  gsap.fromTo(
    container,
    { opacity: 0, y: 16 },
    {
      opacity: 1,
      y: 0,
      duration: ANIMATION_CONFIG.duration.page,
      ease: ANIMATION_CONFIG.ease.smooth,
      clearProps: 'transform',
      onComplete
    }
  );
};

/**
 * Page exit animation before route transition
 */
export const pageExit = (container, onComplete) => {
  if (isReducedMotion() || !container) {
    if (onComplete) onComplete();
    return;
  }

  gsap.to(container, {
    opacity: 0,
    y: -12,
    duration: 0.25,
    ease: 'power2.in',
    onComplete
  });
};
