import { gsap, isReducedMotion, ANIMATION_CONFIG } from './gsapConfig';

/**
 * Creates a scoped GSAP context that safely auto-cleans on component unmount
 */
export const createAnimationContext = (scopeRef, callback) => {
  if (isReducedMotion() || !scopeRef?.current) return { revert: () => {} };
  return gsap.context(callback, scopeRef);
};

/**
 * Universal text reveal (mask / line fade-up)
 */
export const textReveal = (targets, options = {}) => {
  if (isReducedMotion()) return;
  const { delay = 0, stagger = 0.04, duration = ANIMATION_CONFIG.duration.normal, y = 20 } = options;
  return gsap.fromTo(
    targets,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease: ANIMATION_CONFIG.ease.expressive
    }
  );
};

/**
 * Fade up element(s)
 */
export const fadeUp = (targets, options = {}) => {
  if (isReducedMotion()) return;
  const { delay = 0, y = 24, duration = ANIMATION_CONFIG.duration.normal, stagger = 0.05, ease = ANIMATION_CONFIG.ease.expressive } = options;
  return gsap.fromTo(
    targets,
    { opacity: 0, y },
    { opacity: 1, y: 0, duration, delay, stagger, ease }
  );
};

/**
 * Fade in element(s)
 */
export const fadeIn = (targets, options = {}) => {
  if (isReducedMotion()) return;
  const { delay = 0, duration = ANIMATION_CONFIG.duration.normal, stagger = 0.05 } = options;
  return gsap.fromTo(
    targets,
    { opacity: 0 },
    { opacity: 1, duration, delay, stagger, ease: ANIMATION_CONFIG.ease.smooth }
  );
};

/**
 * Scale reveal
 */
export const scaleReveal = (targets, options = {}) => {
  if (isReducedMotion()) return;
  const { delay = 0, duration = ANIMATION_CONFIG.duration.normal, startScale = 0.94 } = options;
  return gsap.fromTo(
    targets,
    { opacity: 0, scale: startScale },
    { opacity: 1, scale: 1, duration, delay, ease: ANIMATION_CONFIG.ease.bounce }
  );
};

/**
 * Animate numbers (e.g. KPI stats, counters)
 */
export const counterAnimation = (element, targetValue, options = {}) => {
  if (!element) return;
  if (isReducedMotion()) {
    element.textContent = targetValue;
    return;
  }
  const { duration = ANIMATION_CONFIG.duration.counter, decimals = 0, prefix = '', suffix = '' } = options;
  const rawTarget = typeof targetValue === 'string' ? parseFloat(targetValue.replace(/[^0-9.-]+/g, '')) || 0 : targetValue;
  const obj = { val: 0 };

  return gsap.to(obj, {
    val: rawTarget,
    duration,
    ease: ANIMATION_CONFIG.ease.smooth,
    onUpdate: () => {
      const formatted = decimals > 0 ? obj.val.toFixed(decimals) : Math.round(obj.val).toLocaleString();
      element.textContent = `${prefix}${formatted}${suffix}`;
    }
  });
};
