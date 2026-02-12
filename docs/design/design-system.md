# 달무티 점수판 — Design System

> **Version**: 1.0
> **Author**: Designer
> **Date**: 2026-02-13
> **Style**: Flat Design / Minimalism (Clean, functional, mobile-first)

---

## 1. Color Architecture

Semantic CSS custom properties defined in `src/app/globals.css`.
All components use semantic tokens via Tailwind utility classes (e.g., `bg-surface`, `text-text-primary`).

### 1.1 Surfaces

| Token | Light | Dark | Usage |
|---|---|---|---|
| `surface` | `#ffffff` | `#1e2028` | Page background, body |
| `surface-elevated` | `#ffffff` | `#2a2d35` | Cards, list items, dialogs |
| `surface-sunken` | `#f9fafb` | `#111318` | Table headers, hover states |
| `surface-overlay` | `rgba(255,255,255,0.95)` | `rgba(30,32,40,0.95)` | AppHeader glassmorphism |

### 1.2 Text

| Token | Light | Dark | Contrast (Light) | Contrast (Dark) |
|---|---|---|---|---|
| `text-primary` | `#111827` | `#f3f4f6` | 16.3:1 | 13.8:1 |
| `text-secondary` | `#4b5563` | `#9ca3af` | 7.1:1 | 5.6:1 |
| `text-tertiary` | `#9ca3af` | `#6b7280` | 3.0:1* | 3.3:1* |
| `text-inverse` | `#ffffff` | `#111827` | — | — |

*text-tertiary: Below 4.5:1 — use only for non-essential decorative text (placeholders, dashes).

### 1.3 Interactive — Primary

| Token | Light | Dark |
|---|---|---|
| `primary` | `#2563eb` | `#3b82f6` |
| `primary-hover` | `#1d4ed8` | `#60a5fa` |
| `primary-active` | `#1e40af` | `#2563eb` |
| `primary-light` | `#dbeafe` | `#1e3a5f` |
| `primary-text` | `#1d4ed8` | `#60a5fa` |

### 1.4 Interactive — Secondary

| Token | Light | Dark |
|---|---|---|
| `secondary` | `#e5e7eb` | `#374151` |
| `secondary-hover` | `#d1d5db` | `#4b5563` |
| `secondary-active` | `#9ca3af` | `#6b7280` |
| `secondary-text` | `#1f2937` | `#e5e7eb` |

### 1.5 Interactive — Danger

| Token | Light | Dark |
|---|---|---|
| `danger` | `#dc2626` | `#ef4444` |
| `danger-hover` | `#b91c1c` | `#f87171` |
| `danger-text` | `#dc2626` | `#f87171` |

### 1.6 Badge Colors

| Badge | BG (Light) | Text (Light) | Border (Light) |
|---|---|---|---|
| Gold | `#fef9c3` | `#854d0e` | `#fcd34d` |
| Silver | `#f3f4f6` | `#374151` | `#d1d5db` |
| Bronze | `#ffedd5` | `#9a3412` | `#fdba74` |
| Default | `#f9fafb` | `#4b5563` | `#e5e7eb` |

Dark mode inverts to darker BG with lighter text — see globals.css.

### 1.7 Chart Colors (12-player palette)

| # | Light | Dark | Usage |
|---|---|---|---|
| 1 | `#2563eb` | `#60a5fa` | Player 1 |
| 2 | `#dc2626` | `#f87171` | Player 2 |
| 3 | `#16a34a` | `#4ade80` | Player 3 |
| 4 | `#ca8a04` | `#facc15` | Player 4 |
| 5 | `#9333ea` | `#c084fc` | Player 5 |
| 6 | `#0891b2` | `#22d3ee` | Player 6 |
| 7 | `#e11d48` | `#fb7185` | Player 7 |
| 8 | `#65a30d` | `#a3e635` | Player 8 |
| 9 | `#c026d3` | `#e879f9` | Player 9 |
| 10 | `#0d9488` | `#2dd4bf` | Player 10 |
| 11 | `#ea580c` | `#fb923c` | Player 11 |
| 12 | `#4f46e5` | `#818cf8` | Player 12 |

---

## 2. Typography

Font: **Geist** (sans-serif) + **Geist Mono** (monospace) — loaded via Next.js `next/font/google`.

| Scale | Size | Weight | Line Height | Tailwind | Usage |
|---|---|---|---|---|---|
| Heading LG | 18px | 700 (bold) | 1.5 | `text-lg font-bold` | AppHeader h1 |
| Heading MD | 16px | 600 (semibold) | 1.5 | `text-base font-semibold` | Section headers |
| Body | 14px | 400 (normal) | 1.5 | `text-sm` | Body text, table cells |
| Body Medium | 14px | 500 (medium) | 1.5 | `text-sm font-medium` | Player names, labels |
| Caption | 12px | 400 (normal) | 1.5 | `text-xs` | Metadata, timestamps |
| Badge | 12px | 600 (semibold) | 1 | `text-xs font-semibold` | Badge text |
| Stat Value | 24px | 700 (bold) | 1.2 | `text-2xl font-bold` | Statistics numbers |
| Stat Label | 12px | 500 (medium) | 1.5 | `text-xs font-medium` | Statistics labels |

---

## 3. Spacing & Layout

| Token | Value | Usage |
|---|---|---|
| Container | `max-w-lg` (672px) | Page max width, centered |
| Page padding | `p-4` (16px) | Content area padding |
| Card padding | `p-4` (16px) | Internal card padding |
| Section gap | `gap-4` (16px) | Between major sections |
| List gap | `gap-2` (8px) | Between list items |
| Medium gap | `gap-3` (12px) | Between stat cards |
| Touch target | `min-h-[44px] min-w-[44px]` | WCAG AA minimum |
| Header height | `h-14` (56px) | Sticky header |

---

## 4. Border Radius

| Value | Tailwind | Usage |
|---|---|---|
| 12px | `rounded-xl` | Cards, Dialog |
| 8px | `rounded-lg` | Buttons, Inputs, list items |
| 9999px | `rounded-full` | Badges, rank circles, FAB |

---

## 5. Dark Mode Architecture

### Theme Modes

| Mode | HTML class | Behavior |
|---|---|---|
| System (default) | none | `prefers-color-scheme` media query decides |
| Light (forced) | `.light` on `<html>` | Overrides system dark |
| Dark (forced) | `.dark` on `<html>` | Always dark |

### CSS Structure in globals.css

```
1. :root { /* light tokens */ }
2. @media (prefers-color-scheme: dark) { :root:not(.light) { /* dark tokens */ } }
3. :root.dark { /* dark tokens (manual) */ }
4. @theme inline { /* Tailwind mapping */ }
```

### Flash Prevention (FOWT)

Inline `<script>` in layout.tsx reads `localStorage('dalmuti-theme')` before React hydrates:
- `'dark'` → add `.dark` to `<html>`
- `'light'` → add `.light` to `<html>`
- `null` → no class (system preference)

---

## 6. Component Migration Map

| Old Tailwind Class | New Semantic Class |
|---|---|
| `bg-white` | `bg-surface` or `bg-surface-elevated` |
| `bg-white/95` | `bg-surface-overlay` |
| `bg-gray-50` | `bg-surface-sunken` |
| `text-gray-900` | `text-text-primary` |
| `text-gray-600`, `text-gray-700` | `text-text-secondary` |
| `text-gray-400`, `text-gray-500` | `text-text-tertiary` |
| `border-gray-200` | `border-border` |
| `border-gray-100` | `border-border-light` |
| `bg-blue-600` | `bg-primary` |
| `hover:bg-blue-700` | `hover:bg-primary-hover` |
| `active:bg-blue-800` | `active:bg-primary-active` |
| `bg-gray-200` (interactive) | `bg-secondary` |
| `hover:bg-gray-300` | `hover:bg-secondary-hover` |
| `bg-red-600` | `bg-danger` |
| `text-red-500`, `text-red-600` | `text-danger-text` |
| `bg-gray-200` (skeleton) | `bg-skeleton` |
| `focus:border-blue-500` | `focus:border-border-focus` |
| `focus:ring-blue-500` | `focus:ring-border-focus` |

---

## 7. Accessibility Requirements

- **Color contrast**: 4.5:1 minimum for all essential text (WCAG AA)
- **Touch targets**: 44x44px minimum on all interactive elements
- **Focus rings**: Visible on all interactive elements via `focus:ring-border-focus`
- **aria-label**: Required on icon-only buttons (ThemeToggle, back button)
- **prefers-reduced-motion**: Respect for all animations
- **Color not sole indicator**: Use icons/text alongside color cues
