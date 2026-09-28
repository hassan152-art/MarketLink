import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { createAnimationContext, authBladeReveal } from '../animations';

/**
 * Shared shell for every auth screen (Login, Register, Forgot/Reset
 * Password). One panel carries the one bold visual moment — a woven-crate
 * motif on a deep harvest-green gradient with a wavy organic edge. The
 * other panel stays quiet: white, left-aligned, underline-style fields.
 *
 * By default the visual panel sits on the left and the form on the right.
 * Pass `reverse` to swap them (form left, visual panel right) — used so
 * Sign in and Create account mirror each other, like the two states of a
 * sign in / sign up swap animation. Each mount also plays a diagonal
 * "blade" sweep as the visual panel settles into place.
 */
export const AuthLayout = ({ title, subtitle, panelQuote, children, reverse = false }) => {
  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const panelContentRef = useRef(null);
  const formRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const ctx = createAnimationContext(containerRef, () => {
      authBladeReveal(
        {
          panel: panelRef.current,
          panelContent: panelContentRef.current ? [...panelContentRef.current.children] : null,
          formContent: formRef.current
        },
        { reverse }
      );
    });
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, reverse]);

  const panelOrder = reverse ? 'lg:order-2' : 'lg:order-1';
  const formOrder = reverse ? 'lg:order-1' : 'lg:order-2';
  const gridCols = reverse
    ? 'lg:grid-cols-[minmax(0,6fr)_minmax(0,7fr)]'
    : 'lg:grid-cols-[minmax(0,7fr)_minmax(0,6fr)]';

  return (
    <div ref={containerRef} className={`min-h-[calc(100vh-5rem)] grid ${gridCols}`}>

      {/* Visual panel — hidden on small screens, the one bold element on desktop */}
      <div
        ref={panelRef}
        className={`hidden lg:block relative z-10 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 overflow-hidden ${panelOrder}`}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 1000"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* faint contour lines suggesting furrowed fields */}
          {[120, 220, 320, 420, 520, 620, 720, 820, 920].map((y, i) => (
            <path
              key={y}
              d={`M -50 ${y} C 150 ${y - 40}, 250 ${y + 40}, 450 ${y} S 750 ${y - 30}, 850 ${y}`}
              fill="none"
              stroke="#dcfce7"
              strokeOpacity={0.05 + (i % 3) * 0.02}
              strokeWidth="2"
            />
          ))}

          {/* woven basket motif, lower-left */}
          <g transform="translate(70,660)" opacity="0.9">
            <path d="M0 90 Q90 150 180 90 L165 150 Q90 190 15 150 Z" fill="#166534" stroke="#4ade80" strokeOpacity="0.4" strokeWidth="2" />
            {[0, 1, 2, 3, 4].map(i => (
              <path key={i} d={`M${10 + i * 34} 90 Q${25 + i * 34} 120 ${18 + i * 34} 150`} fill="none" stroke="#052e16" strokeWidth="2" strokeOpacity="0.5" />
            ))}
            {/* produce peeking out */}
            <circle cx="55" cy="78" r="20" fill="#f59e0b" opacity="0.85" />
            <circle cx="95" cy="68" r="24" fill="#4ade80" opacity="0.85" />
            <circle cx="135" cy="80" r="18" fill="#dc2626" opacity="0.8" />
            <path d="M92 44 Q100 30 112 40 Q100 36 92 44Z" fill="#166534" />
          </g>

          {/* sprigs of wheat, upper right */}
          <g transform="translate(560,90)" opacity="0.5" stroke="#bbf7d0" strokeWidth="2" fill="none">
            <path d="M0 260 L20 0" />
            {[20, 45, 70, 95, 120, 145, 170, 195, 220].map(y => (
              <g key={y}>
                <path d={`M${0 + (260 - y) * 0.08} ${y} q14 -10 20 -26`} />
                <path d={`M${0 + (260 - y) * 0.08} ${y} q-14 -10 -20 -26`} />
              </g>
            ))}
          </g>
        </svg>

        {/* organic wavy seam into the form panel — mirrors to stay on the
            edge that touches the form panel, whichever side that's on */}
        <svg
          className={`absolute top-0 h-full w-16 text-white ${reverse ? 'left-0 -scale-x-100' : 'right-0'}`}
          viewBox="0 0 64 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M64 0 C 20 180, 44 320, 24 500 C 6 660, 40 820, 64 1000 L64 0 Z" fill="currentColor" />
        </svg>

        <div ref={panelContentRef} className="relative h-full flex flex-col justify-between p-12 xl:p-16 text-white">
          <Link to="/" className="inline-flex items-center gap-3 w-fit">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold font-serif tracking-tight">MarketLink</span>
          </Link>

          <div className="max-w-sm space-y-4">
            <h2 className="text-4xl xl:text-[2.75rem] leading-[1.1] font-serif font-bold">
              {title}
            </h2>
            <p className="text-brand-100/90 text-sm leading-relaxed">
              {subtitle}
            </p>
          </div>

          <p className="text-xs text-brand-200/70 max-w-xs leading-relaxed">
            {panelQuote}
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className={`flex items-center justify-center px-6 py-14 sm:px-10 ${formOrder}`}>
        <div ref={formRef} className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
};
