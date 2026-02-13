type Variant = "gold" | "silver" | "bronze" | "default";

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  gold: "bg-badge-gold-bg text-badge-gold-text border-badge-gold-border",
  silver: "bg-badge-silver-bg text-badge-silver-text border-badge-silver-border",
  bronze: "bg-badge-bronze-bg text-badge-bronze-text border-badge-bronze-border",
  default: "bg-badge-default-bg text-badge-default-text border-badge-default-border",
};

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-tight ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}

export function rankBadgeVariant(rank: number): Variant {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "default";
}
