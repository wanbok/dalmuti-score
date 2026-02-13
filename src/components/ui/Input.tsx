"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm min-h-[44px] text-text-primary placeholder:text-text-tertiary hover:border-border-focus/40 focus:border-border-focus focus:ring-2 focus:ring-border-focus/20 outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {hint && (
        <p className="text-xs text-text-tertiary">{hint}</p>
      )}
    </div>
  );
}
