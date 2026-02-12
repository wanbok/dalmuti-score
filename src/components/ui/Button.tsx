"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-text-inverse hover:bg-primary-hover active:bg-primary-active",
  secondary: "bg-secondary text-secondary-text hover:bg-secondary-hover active:bg-secondary-active",
  danger: "bg-danger text-text-inverse hover:bg-danger-hover active:bg-danger-active",
  ghost: "bg-transparent text-text-secondary hover:bg-surface-sunken active:bg-secondary",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors min-h-[44px] min-w-[44px] disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
