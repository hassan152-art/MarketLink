import { gsap, ScrollTrigger, isReducedMotion, ANIMATION_CONFIG } from './gsapConfig';

/**
 * Attaches a scroll reveal to a section or container
 */
export const setupScrollReveal = (element, options = {}) => {
  if (isReducedMotion() || !element) return () => {};
  const { start = 'top 85%', y = 30, duration = ANIMATION_CONFIG.duration.slow, stagger = 0.08 } = options;

  const children = element.querySelectorAll('[data-reveal]');
  const targets = children.length > 0 ? children : element;

  const anim = gsap.fromTo(
    targets,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger: targets.length > 1 ? stagger : 0,
      ease: ANIMATION_CONFIG.ease.expressive,
      scrollTrigger: {
        trigger: element,
        start,
        once: true
      }
    }
  );

  return () => {
    if (anim.scrollTrigger) anim.scrollTrigger.kill();
    anim.kill();
  };
};

/**
 * Setup subtle parallax effect
 */
export const setupParallax = (element, speed = 0.2) => {
  if (isReducedMotion() || !element) return () => {};

  const anim = gsap.to(element, {
    yPercent: speed * 25,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  return () => {
    if (anim.scrollTrigger) anim.scrollTrigger.kill();
    anim.kill();
  };
};
