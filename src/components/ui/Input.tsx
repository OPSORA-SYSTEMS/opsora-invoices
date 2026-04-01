"use client";

import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-brand-textDark mb-1.5">
            {label}
            {props.required && <span className="text-brand-accent ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-textMuted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-lg border px-3 py-2 text-sm text-brand-textDark placeholder-brand-textMuted
              bg-white transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              ${error ? "border-red-400 focus:ring-red-400" : "border-brand-border hover:border-pink-300"}
              ${leftIcon ? "pl-9" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-brand-textMuted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
