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
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        {...props}
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}
