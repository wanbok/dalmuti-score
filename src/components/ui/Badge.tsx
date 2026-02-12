type Variant = "gold" | "silver" | "bronze" | "default";

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
  silver: "bg-gray-100 text-gray-700 border-gray-300",
  bronze: "bg-orange-100 text-orange-800 border-orange-300",
  default: "bg-gray-50 text-gray-600 border-gray-200",
};

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-semibold ${variantClasses[variant]}`}
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
