# Mobile Responsiveness — Design Spec

**Date:** 2026-04-16
**Approach:** Convert inline styles to Tailwind responsive utilities (`sm:`, `md:`, `lg:`), with a `useBreakpoint` hook for the Recharts height prop.

---

## Problem

The entire app uses inline `style` objects with fixed pixel values. No Tailwind responsive utilities are used anywhere. This causes:

- Critical overflow: stock card grid (280px min), MetricsPanel (600px total), chart (60px YAxis on narrow screens)
- Undersized touch targets (24px button height, should be 44px)
- Fixed container padding that wastes space on phones
- Titles and fonts that don't scale down

---

## Approach

Replace inline style objects with Tailwind utility classes plus responsive variants. Add a single `useBreakpoint` hook for the Recharts `height` prop (Recharts requires a prop, not CSS).

---

## Section 1: Global Layout & Navigation

**Files:** `src/app/layout.tsx`, `src/components/Navigation.tsx`, all page containers

- Page containers: `px-4 py-6 md:px-6 md:py-8` (replaces fixed `padding: "32px 24px"`)
- Navigation padding: `px-4 md:px-6`
- Navigation title: add `truncate` class to prevent overflow on XS
- Settings icon button: `min-w-[44px] min-h-[44px]` touch target

---

## Section 2: Dashboard Page

**Files:** `src/app/page.tsx`, `src/components/FilterBar.tsx`, `src/components/ScanButton.tsx`

### Stock Card Grid
- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (removes 280px minimum)

### Dashboard Header Controls
- Title/count row + ticker input + scan button: `flex-col gap-3 sm:flex-row sm:items-start`
- Ticker input: `w-full sm:w-24`

### FilterBar
- Gap: `gap-3 md:gap-5` (replaces fixed `20px`)
- Period/sort button groups: `gap-2 flex-wrap`
- Slider label text: `text-sm`
- Buttons: `min-h-[36px]`

### Pagination
- Buttons: `px-4 py-2.5 text-sm` (≈44px height)

---

## Section 3: Stock Detail Page

**Files:** `src/app/stocks/[ticker]/page.tsx`, `src/components/MetricsPanel.tsx`, `src/components/RegressionChart.tsx`

### Header
- Ticker font: `text-2xl md:text-4xl` (replaces fixed `36px`)
- Meta info row: `flex-col sm:flex-row`

### Period Tabs
- Buttons: `min-h-[44px] px-3 text-sm`

### MetricsPanel
- Layout: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5` (replaces 5×`minWidth:120px`)
- Card padding: `p-3 md:p-4`
- Value font: `text-xl md:text-2xl`

### RegressionChart
- Add `useBreakpoint` hook: returns `isMobile` (true when `window.innerWidth < 640`)
- Height prop: `isMobile ? 220 : 350`
- YAxis `width`: `isMobile ? 40 : 60`
- Axis tick font: `isMobile ? 10 : 11`

---

## Section 4: Settings Page

**File:** `src/app/settings/page.tsx`

- Container padding: `px-4 py-6 md:px-6 md:py-10`
- SliderSetting card padding: `p-4 md:p-5`
- Value badge: add `shrink-0` to prevent number wrapping
- Min/max labels: `text-xs`

---

## Implementation Notes

- All inline `style` objects are replaced with `className` Tailwind strings
- `useBreakpoint` hook goes in `src/hooks/useBreakpoint.ts`; it listens to `resize` with a debounce and initializes from `window.innerWidth` (client-only, safe for Next.js with `"use client"`)
- No changes to API routes, DB schema, or business logic
- Existing `.glass-card` and animation CSS classes in `globals.css` are unchanged
