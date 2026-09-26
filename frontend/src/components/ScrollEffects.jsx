import { useEffect } from 'react';
import { gsap, ScrollTrigger, isReducedMotion, setupParallax } from '../animations';

/**
 * Universal ScrollEffects: reading progress bar, ScrollTrigger refresh on route/DOM change,
 * animated number counters, and prefers-reduced-motion safety.
 */
export function ScrollEffects() {
  useEffect(() => {
    if (isReducedMotion()) return;

    // ---- Reading progress bar ----
    let progress = document.querySelector('.scroll-progress');
    if (!progress) {
      progress = document.createElement('div');
      progress.className = 'scroll-progress';
      progress.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progress);
    }
    gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });

    const progressTrigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        gsap.to(progress, { scaleX: self.progress, duration: 0.15, ease: 'none', overwrite: true });
      }
    });

    const ctx = gsap.context(() => {
      // Counter animations
      gsap.utils.toArray('[data-counter]').forEach((el) => {
        const target = parseFloat(el.getAttribute('data-counter')) || 0;
        const decimals = (el.getAttribute('data-counter').split('.')[1] || '').length;
        const counterObj = { val: 0 };
        gsap.to(counterObj, {
          val: target,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true
          },
          onUpdate: () => {
            el.textContent = counterObj.val.toFixed(decimals);
          }
        });
      });
    });

    // ---- Site-wide floating parallax blobs ([data-parallax]) ----
    const parallaxCleanups = new Map();
    const bindParallax = (root) => {
      (root || document).querySelectorAll('[data-parallax]:not([data-parallax-bound])').forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
        el.setAttribute('data-parallax-bound', 'true');
        parallaxCleanups.set(el, setupParallax(el, speed));
      });
    };
    bindParallax();

    // Handle dynamically mounted components in <main>
    const main = document.querySelector('main');
    const mutationObserver = new MutationObserver(() => {
      ScrollTrigger.refresh();
      bindParallax(main);
    });
    if (main) mutationObserver.observe(main, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      progressTrigger.kill();
      parallaxCleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, []);

  return null;
}
