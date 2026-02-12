"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-lg border border-border bg-surface px-3 py-2 text-sm min-h-[44px] focus:border-border-focus focus:ring-1 focus:ring-border-focus outline-none ${className}`}
        {...props}
      />
    </div>
  );
}
