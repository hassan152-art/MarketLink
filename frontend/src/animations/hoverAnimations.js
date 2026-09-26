import { gsap, isReducedMotion, ANIMATION_CONFIG } from './gsapConfig';

/**
 * Button press micro-interaction
 */
export const buttonPress = (button) => {
  if (isReducedMotion() || !button) return;
  gsap.fromTo(
    button,
    { scale: 0.96 },
    { scale: 1, duration: 0.2, ease: ANIMATION_CONFIG.ease.bounce }
  );
};

/**
 * Subtle icon bounce/pop (e.g. for favorite heart)
 */
export const iconPop = (iconElement) => {
  if (isReducedMotion() || !iconElement) return;
  const tl = gsap.timeline();
  tl.to(iconElement, { scale: 0.8, duration: 0.1, ease: 'power2.in' })
    .to(iconElement, { scale: 1.25, duration: 0.15, ease: ANIMATION_CONFIG.ease.bounce })
    .to(iconElement, { scale: 1, duration: 0.15, ease: 'power2.out' });
};
