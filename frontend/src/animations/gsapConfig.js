import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Checks if user prefers reduced motion
 */
export const isReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Centralized easing & timing configuration
 */
export const ANIMATION_CONFIG = {
  duration: {
    instant: 0.15,
    fast: 0.25,
    normal: 0.5,
    slow: 0.8,
    page: 0.6,
    counter: 1.4
  },
  ease: {
    smooth: 'power2.out',
    expressive: 'power3.out',
    snappy: 'power4.out',
    bounce: 'back.out(1.4)',
    expo: 'expo.out',
    linear: 'none'
  }
};

export { gsap, ScrollTrigger };
