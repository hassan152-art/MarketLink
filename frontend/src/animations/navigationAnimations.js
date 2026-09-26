import { gsap, isReducedMotion, ANIMATION_CONFIG } from './gsapConfig';

/**
 * Navbar entrance on load
 */
export const navbarEntrance = (navElement) => {
  if (isReducedMotion() || !navElement) return;
  gsap.fromTo(
    navElement,
    { y: -20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, ease: ANIMATION_CONFIG.ease.smooth }
  );
};

/**
 * Mobile drawer entrance & exit
 */
export const mobileMenuToggle = (drawerElement, isOpen, onComplete) => {
  if (!drawerElement) return;
  if (isReducedMotion()) {
    gsap.set(drawerElement, { opacity: isOpen ? 1 : 0 });
    if (onComplete) onComplete();
    return;
  }

  if (isOpen) {
    gsap.fromTo(
      drawerElement,
      { y: -16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, ease: ANIMATION_CONFIG.ease.smooth, onComplete }
    );
  } else {
    gsap.to(drawerElement, {
      y: -10,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete
    });
  }
};
