# 달무티 점수판 — Component Specifications

> **Version**: 1.0
> **Author**: Designer
> **Date**: 2026-02-13

---

## 1. ThemeToggle

**File**: `src/components/ui/ThemeToggle.tsx`
**Owner**: frontend

### Props

None — reads/writes theme from Zustand store.

### Behavior

- Renders a single icon button cycling: system → dark → light → system
- Icon changes based on current mode:
  - `system`: monitor icon (ComputerDesktopIcon)
  - `light`: sun icon (SunIcon)
  - `dark`: moon icon (MoonIcon)
- On click: cycle to next mode, update Zustand store + `<html>` class
- Icons: inline SVG, 20x20px, `strokeWidth={1.5}`

### Visual Spec

```
Size: min-h-[44px] min-w-[44px]
Style: ghost button (bg-transparent, hover:bg-surface-sunken)
Icon: 20x20, text-text-secondary
Border radius: rounded-lg
Transition: transition-colors duration-150
aria-label: "테마 변경" (required — icon-only button)
```

### Placement

AppHeader right side, before page-specific actions.

---

## 2. ThemeProvider

**File**: `src/components/providers/ThemeProvider.tsx`
**Owner**: frontend

### Props

```typescript
children: React.ReactNode
```

### Behavior

1. On mount: read theme from Zustand persist store
2. Apply `.dark` or `.light` class to `document.documentElement`
3. Subscribe to store changes, update class on change
4. For FOWT prevention: add inline `<script>` in layout.tsx `<head>`

### Inline Script (layout.tsx)

```javascript
(function() {
  try {
    var stored = JSON.parse(localStorage.getItem('dalmuti-store') || '{}');
    var theme = stored.state && stored.state.theme;
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else if (theme === 'light') document.documentElement.classList.add('light');
  } catch(e) {}
})();
```

---

## 3. StatCard

**File**: `src/components/statistics/StatCard.tsx`
**Owner**: frontend

### Props

```typescript
interface StatCardProps {
  label: string;          // e.g., "총 게임"
  value: string | number; // e.g., 12 or "42%"
  icon?: React.ReactNode; // optional leading icon
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;        // e.g., "+3"
  };
}
```

### Visual Spec

```
Base: Card component (bg-surface-elevated, border-border, rounded-xl, p-4)
Layout: vertical stack, gap-1

Row 1 (top):
  - label: text-xs font-medium text-text-secondary
  - icon (if provided): 16x16, text-text-tertiary, to left of label

Row 2 (value):
  - text-2xl font-bold text-text-primary
  - leading-tight (line-height: 1.2)

Row 3 (trend, optional):
  - text-xs font-medium
  - up: text-success-text + "↑" prefix
  - down: text-danger-text + "↓" prefix
  - neutral: text-text-tertiary + "→" prefix
```

### Grid Layout

```
grid grid-cols-2 gap-3
```

---

## 4. ScoreChart (Line Chart)

**File**: `src/components/statistics/ScoreChart.tsx`
**Owner**: frontend
**Dependency**: `recharts`

### Props

```typescript
interface ChartDataPoint {
  label: string;                    // "R1", "R2", "S1", etc.
  [playerName: string]: number;     // cumulative scores
}

interface PlayerLine {
  name: string;
  dataKey: string;
  color: string;  // CSS variable value
}

interface ScoreChartProps {
  data: ChartDataPoint[];
  players: PlayerLine[];
  height?: number;          // default: 256
  invertYAxis?: boolean;    // default: true (lower=better=top)
}
```

### Visual Spec

```
Container: w-full, fixed height (default 256px)
Background: transparent (inherits parent)

Recharts components:
- ResponsiveContainer: width="100%" height={height}
- LineChart: margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
- XAxis: dataKey="label", tick text-xs text-text-tertiary
- YAxis: reversed={invertYAxis}, tick text-xs text-text-tertiary
- CartesianGrid: strokeDasharray="3 3", stroke=var(--color-border-light)
- Tooltip: bg-surface-elevated, border-border, rounded-lg, shadow-md
- Legend: below chart, iconType="circle", iconSize=8
- Line: strokeWidth=2, dot radius=3, activeDot radius=5, type="monotone"
```

### Chart Colors

Use CSS variables `--color-chart-1` through `--color-chart-12`.
Read computed values at render time for Recharts (which needs hex/rgb values).

```typescript
// Helper to read chart color
function getChartColor(index: number): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-chart-${index + 1}`).trim();
}
```

### Accessibility

- `prefers-reduced-motion`: disable animation props on Line
- Provide data table alternative below chart (collapsible)

---

## 5. PlayerStatRow

**File**: `src/components/statistics/PlayerStatRow.tsx`
**Owner**: frontend

### Props

```typescript
interface PlayerStatRowProps {
  rank: number;
  name: string;
  winRate: number;       // 0-100
  avgRank: number;       // decimal, e.g. 2.3
  totalGames: number;
}
```

### Visual Spec

```
Container: bg-surface-elevated border-border rounded-lg px-4 py-3

Row 1:
  flex items-center gap-2
  [Badge rank] [player name font-medium text-text-primary] ... [totalGames text-xs text-text-tertiary]

Row 2:
  flex items-center gap-3 mt-2

  Win rate bar:
    - Container: h-1 flex-1 rounded-full bg-surface-sunken
    - Fill: h-full rounded-full bg-primary, width={winRate}%
    - Label before bar: "승률 {winRate}%" text-xs text-text-secondary min-w-[64px]

  Avg rank:
    - "평균순위 {avgRank}" text-xs text-text-secondary
```

---

## 6. Navigation Update

### Sessions Page AppHeader

Current: `action={<Button>+ 새 세션</Button>}`

Updated: Two buttons in action slot:

```
<div className="flex items-center gap-1">
  <ThemeToggle />
  <Link href="/stats">
    <Button variant="ghost" size="sm" aria-label="통계">
      {/* chart-bar icon SVG */}
    </Button>
  </Link>
  <Button size="sm" onClick={...}>+ 새 세션</Button>
</div>
```

### Other Pages

ThemeToggle always present in AppHeader action slot (leftmost position).
