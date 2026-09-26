import React from 'react';

/**
 * A quiet, editorial input: label above, bottom-border only (no box, no
 * pill), brand-colored underline on focus. Used across the auth pages so
 * the visual panel in AuthLayout stays the one bold element on the screen.
 */
export const AuthField = ({
  label,
  icon: Icon,
  error,
  rightElement,
  className = '',
  ...inputProps
}) => {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && <Icon className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />}
        <input
          {...inputProps}
          className={`peer w-full bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none border-b-2 transition-colors ${
            error ? 'border-red-400' : 'border-slate-200 focus:border-brand-700'
          }`}
        />
        {rightElement}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
};
