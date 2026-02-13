"use client";

import { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function Checkbox({ label, id, className = "", ...props }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 min-h-[44px] px-3 rounded-xl cursor-pointer select-none transition-colors duration-150 hover:bg-surface-sunken/50 active:bg-surface-sunken ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          id={id}
          className="peer h-5 w-5 rounded-md border-2 border-border bg-surface-elevated text-primary focus:ring-2 focus:ring-border-focus/20 focus-visible:ring-2 focus-visible:ring-border-focus/40 transition-all duration-150 cursor-pointer checked:border-primary checked:bg-primary"
          {...props}
        />
      </div>
      <span className="text-sm font-medium text-text-primary">{label}</span>
    </label>
  );
}
