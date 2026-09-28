import { gsap, isReducedMotion, ANIMATION_CONFIG } from './gsapConfig';

/**
 * Diagonal "blade" reveal for the auth screens (Login / Register).
 * The bold visual panel sweeps in from its outer edge with a slight skew,
 * like a blade sliding into place, then its own text and the form panel
 * settle in with a soft fade-up — echoing the classic sign in / sign up
 * swap animation where the coloured panel and the form trade sides.
 */
export const authBladeReveal = (refs = {}, options = {}) => {
  const { panel, panelContent, formContent } = refs;
  const { reverse = false } = options;

  if (isReducedMotion() || !panel) {
    return { revert: () => {} };
  }

  // Panel sits on the right when reversed, so the blade should travel in
  // from that same side (right → left), and from the left otherwise.
  const dir = reverse ? 1 : -1;

  const tl = gsap.timeline();

  tl.fromTo(
    panel,
    { xPercent: 55 * dir, skewX: 8 * dir, opacity: 0.5 },
    {
      xPercent: 0,
      skewX: 0,
      opacity: 1,
      duration: 0.85,
      ease: ANIMATION_CONFIG.ease.expo
    }
  );

  if (panelContent && panelContent.length) {
    tl.fromTo(
      panelContent,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: ANIMATION_CONFIG.ease.expressive
      },
      '-=0.45'
    );
  }

  if (formContent) {
    tl.fromTo(
      formContent,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: ANIMATION_CONFIG.ease.expressive
      },
      '-=0.5'
    );
  }

  return tl;
};
