# Brand & Design System
> Apply to ALL visual output: dashboards, reports, slides, web apps, documents, charts.
> Do not use Overproof logos. Use "Dobbles.AI" as placeholder brand name until updated.

---

## COLORS

### Primary Palette
| Role | Name | Hex |
|------|------|-----|
| Accent / CTA | Coral Red | `#DB5461` |
| Background Dark | Near Black | `#1D1D1D` |
| Brand Blue | Steel Blue | `#225A8E` |
| Deep Navy | Navy | `#060A57` |

### Secondary Palette
| Role | Name | Hex |
|------|------|-----|
| Success / Positive | Teal Green | `#00B98E` |
| Highlight | Sky Blue | `#85E4FD` |
| Interactive | Bright Blue | `#3273DB` |
| Background Light | Off White | `#F7FBFE` |

### Gradients
```
Primary gradient:   #225A8E → #060A57 → #8E083F → #DB5461  (dark blue to red)
Secondary gradient: #324EAB → #3288F5 → #ECF7FF → #9E1047  (blue to light to deep red)
```

### Usage Rules
- **Dark mode default.** Primary backgrounds use `#1D1D1D` or `#060A57`.
- **Coral red (`#DB5461`)** for primary CTAs, alerts, key metrics that demand attention.
- **Teal (`#00B98E`)** for positive trends, success states, growth indicators.
- **Off white (`#F7FBFE`)** for body text on dark backgrounds. Never pure `#FFFFFF`.
- **Never use generic Bootstrap or Material blue.** Use the palette above.

---

## TYPOGRAPHY

| Use | Font | Weight |
|-----|------|--------|
| Headings / Labels | Montserrat | Bold (700) |
| Body / Data | Montserrat | Regular (400) |
| Fallback stack | `'Montserrat', 'Segoe UI', sans-serif` | — |

### Typography Rules
- Headings: Montserrat Bold, tracked slightly wide (letter-spacing: 0.05em)
- No serif fonts. No decorative fonts.
- Data values in tables/charts: Regular weight, right-aligned numbers
- All-caps labels acceptable for section headers and KPI labels

---

## LAYOUT & SPACING

- **Dense but not cluttered.** This is executive analytics — pack value, eliminate decoration.
- Card-based layouts preferred for dashboards
- Consistent 16px / 24px / 32px spacing grid
- Dark cards on dark background: use `#1D1D1D` cards on `#0D0D0D` or `#060A57` base
- Rounded corners: `border-radius: 8px` for cards, `4px` for inputs/buttons

---

## CHARTS & DATA VISUALIZATION

- Background: Dark (`#1D1D1D` or `#060A57`)
- Grid lines: `rgba(255,255,255,0.08)` — subtle, not distracting
- Primary data series: `#00B98E` (teal) or `#85E4FD` (sky blue)
- Secondary data series: `#DB5461` (coral) or `#3273DB` (bright blue)
- Axis labels: `#F7FBFE` at 80% opacity
- Tooltips: Dark background `#1D1D1D`, `#F7FBFE` text, `#DB5461` accent border
- **No 3D charts. No pie charts unless the audience demands it. Prefer bar, line, scatter.**

---

## COMPONENT STANDARDS

### Buttons
- Primary: `#DB5461` background, `#F7FBFE` text, `border-radius: 4px`
- Secondary: Transparent, `#DB5461` border, `#DB5461` text
- Hover: 10% lighter, subtle transition (200ms)

### Tables
- Header: `#225A8E` or `#060A57` background, `#F7FBFE` text, Bold
- Row alternating: `#1D1D1D` / `rgba(255,255,255,0.03)`
- Borders: `rgba(255,255,255,0.1)`

### KPI Cards
- Dark background card (`#1D1D1D`)
- Metric value: Large (32–48px), Montserrat Bold, `#F7FBFE` or `#00B98E`
- Label: Small (12px), all-caps, `#85E4FD` or muted white
- Trend indicator: `#00B98E` for positive, `#DB5461` for negative

---

## BRANDING

- **Logo placeholder:** "Dobbles.AI" — text-based wordmark until a logo is provided
- **Wordmark style:** Montserrat Bold, `#F7FBFE`, with `.AI` in `#DB5461`
- **Do NOT use Overproof logos or wordmarks in any output**
- Brand voice: Direct, executive, data-driven. No fluff.

---

## CSS QUICK-START

```css
:root {
  --color-bg:         #1D1D1D;
  --color-navy:       #060A57;
  --color-blue:       #225A8E;
  --color-red:        #DB5461;
  --color-teal:       #00B98E;
  --color-sky:        #85E4FD;
  --color-bright:     #3273DB;
  --color-text:       #F7FBFE;
  --font-main:        'Montserrat', 'Segoe UI', sans-serif;
  --radius-card:      8px;
  --radius-btn:       4px;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-main);
}
```
