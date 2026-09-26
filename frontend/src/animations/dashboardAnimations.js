import { gsap, isReducedMotion, ANIMATION_CONFIG } from './gsapConfig';

/**
 * Dashboard sequential entrance:
 * Header -> KPI cards -> Charts -> Content
 */
export const dashboardSequenceReveal = (elements = {}) => {
  if (isReducedMotion()) return;
  const { header, kpis, charts, content } = elements;

  const tl = gsap.timeline();

  if (header) {
    tl.fromTo(header, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.35, ease: ANIMATION_CONFIG.ease.smooth }, 0);
  }
  if (kpis && kpis.length > 0) {
    tl.fromTo(
      kpis,
      { opacity: 0, y: 20, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.05, ease: ANIMATION_CONFIG.ease.expressive },
      0.1
    );
  }
  if (charts) {
    tl.fromTo(
      charts,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: ANIMATION_CONFIG.ease.expressive },
      0.25
    );
  }
  if (content) {
    tl.fromTo(
      content,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: ANIMATION_CONFIG.ease.smooth },
      0.35
    );
  }

  return tl;
};
