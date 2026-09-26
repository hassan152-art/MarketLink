import React from 'react';
import { Link } from 'react-router-dom';

export const BrandLogo = ({ className = '', iconSize = 'w-10 h-10', textSize = 'text-2xl', subtitle = true, dark = false }) => {
  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>
      <div className={`${iconSize} rounded-2xl bg-gradient-to-tr from-brand-800 via-brand-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-brand-900/15 group-hover:scale-105 transition-transform shrink-0`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </div>
      <div>
        <span className={`${textSize} font-bold font-serif tracking-tight ${dark ? 'text-white' : 'text-slate-900'} group-hover:text-brand-400 transition-colors`}>
          Market<span className={dark ? 'text-brand-400' : 'text-brand-600'}>Link</span>
        </span>
        {subtitle && (
          <p className={`text-[10px] font-semibold uppercase tracking-wider ${dark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Fresh Local Harvest
          </p>
        )}
      </div>
    </Link>
  );
};
