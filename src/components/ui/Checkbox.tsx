"use client";

import { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function Checkbox({ label, id, className = "", ...props }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 min-h-[44px] cursor-pointer select-none ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        className="h-5 w-5 rounded border-border text-primary focus:ring-border-focus"
        {...props}
      />
      <span className="text-sm font-medium text-text-secondary">{label}</span>
    </label>
  );
}
