import React from 'react';
import { Link } from 'react-router-dom';

export const BrandLogo = ({ className = '', iconSize = 'w-10 h-10', textSize = 'text-2xl', subtitle = true, dark = false }) => {
  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>
      {/* Modern Leaf Logo Badge */}
      <div className={`relative ${iconSize} rounded-full bg-gradient-to-br from-emerald-500 via-brand-700 to-emerald-950 flex items-center justify-center text-white shadow-lg shadow-emerald-900/25 group-hover:scale-105 transition-all duration-300 shrink-0 overflow-hidden`}>
        
        {/* Soft Radial Gloss Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 rounded-full pointer-events-none" />

        {/* High-Detail Leaf SVG Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/5 h-3/5 text-emerald-50 drop-shadow-sm transition-transform duration-300 group-hover:rotate-6"
        >
          {/* Leaf Outer Contour */}
          <path d="M12 21C16.9706 21 21 16.9706 21 12C21 5 13 3 12 3C11 3 3 5 3 12C3 16.9706 7.02944 21 12 21Z" />
          
          {/* Center Vein */}
          <path d="M12 21V3" />
          
          {/* Detailed Side Veins */}
          <path d="M12 17L17 14" />
          <path d="M12 13L18 9" />
          <path d="M12 17L7 14" />
          <path d="M12 13L6 9" />
        </svg>
      </div>

      {/* Brand Name & Subtitle */}
      <div className="flex flex-col">
        <span className={`${textSize} font-extrabold tracking-tight leading-none ${dark ? 'text-white' : 'text-slate-900'} group-hover:text-emerald-600 transition-colors`}>
          Market<span className={dark ? 'text-emerald-400' : 'text-emerald-600'}>Link</span>
        </span>
        
        {subtitle && (
          <p className={`text-[10px] font-bold tracking-widest uppercase mt-1 ${dark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Pure Bio-Grow
          </p>
        )}
      </div>
    </Link>
  );
};