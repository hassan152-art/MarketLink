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

  // Content that loads after the first render (e.g. products from the API)
  // changes the page height, so trigger positions must be recalculated.
  ScrollTrigger.refresh();

  return () => {
    if (anim.scrollTrigger) anim.scrollTrigger.kill();
    anim.kill();
    // Killing a tween leaves its inline opacity/transform behind. If the
    // section was hidden (opacity: 0) before its data arrived, it would stay
    // invisible forever, so reset the animated properties on cleanup.
    gsap.set(targets, { clearProps: 'opacity,transform' });
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
