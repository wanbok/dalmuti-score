"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-text-inverse hover:bg-primary-hover active:bg-primary-active shadow-sm hover:shadow-md focus-visible:ring-primary/40",
  secondary: "bg-secondary text-secondary-text hover:bg-secondary-hover active:bg-secondary-active focus-visible:ring-secondary-active/40",
  danger: "bg-danger text-text-inverse hover:bg-danger-hover active:bg-danger-active shadow-sm focus-visible:ring-danger/40",
  ghost: "bg-transparent text-text-secondary hover:bg-surface-sunken active:bg-secondary focus-visible:ring-border-focus/40",
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
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 cursor-pointer min-h-[44px] min-w-[44px] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
