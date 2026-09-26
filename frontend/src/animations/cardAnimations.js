import { gsap, isReducedMotion, ANIMATION_CONFIG } from './gsapConfig';

/**
 * Staggered grid/card reveal
 */
export const cardStaggerReveal = (cards, options = {}) => {
  if (isReducedMotion() || !cards || cards.length === 0) return;
  const { stagger = 0.06, y = 24, delay = 0.05 } = options;

  return gsap.fromTo(
    cards,
    { opacity: 0, y, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: ANIMATION_CONFIG.duration.normal,
      stagger,
      delay,
      ease: ANIMATION_CONFIG.ease.expressive,
      clearProps: 'transform'
    }
  );
};

/**
 * Micro-interaction on card hover lift
 */
export const setupCardHover = (cardElement) => {
  if (isReducedMotion() || !cardElement) return () => {};

  const onEnter = () => {
    gsap.to(cardElement, {
      y: -4,
      boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.09), 0 6px 12px -4px rgba(0, 0, 0, 0.04)',
      duration: 0.25,
      ease: ANIMATION_CONFIG.ease.smooth
    });
  };

  const onLeave = () => {
    gsap.to(cardElement, {
      y: 0,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      duration: 0.25,
      ease: ANIMATION_CONFIG.ease.smooth
    });
  };

  cardElement.addEventListener('mouseenter', onEnter);
  cardElement.addEventListener('mouseleave', onLeave);

  return () => {
    cardElement.removeEventListener('mouseenter', onEnter);
    cardElement.removeEventListener('mouseleave', onLeave);
  };
};

/**
 * Add-to-cart confirmation button pop
 */
export const animateAddToCart = (buttonElement, onComplete) => {
  if (!buttonElement) {
    if (onComplete) onComplete();
    return;
  }
  if (isReducedMotion()) {
    if (onComplete) onComplete();
    return;
  }

  const tl = gsap.timeline({ onComplete });
  tl.to(buttonElement, { scale: 0.92, duration: 0.1, ease: 'power2.in' })
    .to(buttonElement, { scale: 1.05, duration: 0.15, ease: ANIMATION_CONFIG.ease.bounce })
    .to(buttonElement, { scale: 1, duration: 0.15, ease: 'power2.out' });
};
