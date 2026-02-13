import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface-elevated p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
