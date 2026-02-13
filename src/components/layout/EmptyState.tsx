interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: "cards" | "chart" | "search" | "trophy";
}

function CardIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="6" width="24" height="36" rx="4" className="stroke-text-tertiary" strokeWidth="2" fill="none" />
      <rect x="16" y="10" width="24" height="36" rx="4" className="stroke-text-tertiary fill-surface-elevated" strokeWidth="2" />
      <circle cx="28" cy="28" r="6" className="stroke-primary fill-primary-light" strokeWidth="2" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="28" width="8" height="14" rx="2" className="fill-primary/30" />
      <rect x="20" y="18" width="8" height="24" rx="2" className="fill-primary/50" />
      <rect x="32" y="8" width="8" height="34" rx="2" className="fill-primary/70" />
      <line x1="4" y1="44" x2="44" y2="44" className="stroke-text-tertiary" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="22" cy="22" r="12" className="stroke-text-tertiary" strokeWidth="2" fill="none" />
      <line x1="31" y1="31" x2="40" y2="40" className="stroke-text-tertiary" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 8h16v16c0 4.418-3.582 8-8 8s-8-3.582-8-8V8z" className="stroke-accent fill-accent-light" strokeWidth="2" />
      <path d="M16 12H10c0 4 2 8 6 8" className="stroke-text-tertiary" strokeWidth="2" fill="none" />
      <path d="M32 12h6c0 4-2 8-6 8" className="stroke-text-tertiary" strokeWidth="2" fill="none" />
      <line x1="24" y1="32" x2="24" y2="38" className="stroke-text-tertiary" strokeWidth="2" />
      <line x1="18" y1="38" x2="30" y2="38" className="stroke-text-tertiary" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const ICONS = {
  cards: CardIcon,
  chart: ChartIcon,
  search: SearchIcon,
  trophy: TrophyIcon,
};

export function EmptyState({ title, description, action, icon = "cards" }: EmptyStateProps) {
  const Icon = ICONS[icon];
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-5 opacity-50">
        <Icon />
      </div>
      <p className="text-lg font-semibold text-text-primary">{title}</p>
      {description && (
        <p className="mt-1.5 text-sm text-text-secondary max-w-[240px]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
