import { gsap, isReducedMotion, ANIMATION_CONFIG } from './gsapConfig';

/**
 * Animate modal opening (backdrop fade + dialog scale/slide)
 */
export const modalOpen = (backdropRef, dialogRef, onComplete) => {
  if (isReducedMotion() || !dialogRef) {
    if (onComplete) onComplete();
    return;
  }

  const tl = gsap.timeline({ onComplete });
  if (backdropRef) {
    tl.fromTo(backdropRef, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' }, 0);
  }
  tl.fromTo(
    dialogRef,
    { opacity: 0, scale: 0.94, y: 16 },
    { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: ANIMATION_CONFIG.ease.bounce },
    0.05
  );
};

/**
 * Animate modal closing
 */
export const modalClose = (backdropRef, dialogRef, onComplete) => {
  if (isReducedMotion() || !dialogRef) {
    if (onComplete) onComplete();
    return;
  }

  const tl = gsap.timeline({ onComplete });
  tl.to(dialogRef, { opacity: 0, scale: 0.96, y: 10, duration: 0.2, ease: 'power2.in' }, 0);
  if (backdropRef) {
    tl.to(backdropRef, { opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.05);
  }
};
