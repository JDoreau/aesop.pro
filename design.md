# Design: Aesop Analytics

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.

## System
- Genre: editorial
- Shape of the first page: Long Document (the front page: the claim at poster scale, the lead study, a box score, an index); the hubs are Index-First, the articles Long Document, About is a Letter, the two tools are app screens
- Theme: Newsprint (Hallmark catalog, dealt 1/3 on 2026-11-12; Almanac and Specimen were the alternatives)
- Axes: light/slab-serif/warm · posture: restrained
- Copy: verbatim. Article words, numbers, sources and dates are the owner's and are never reworded

## Tokens
`src/styles/tokens.css` is the source of truth. The roles:
```css
:root {
  --color-paper: oklch(94% 0.011 92);  --color-paper-2: oklch(90.5% 0.015 88);  --color-paper-3: oklch(87% 0.017 86);
  --color-ink: oklch(17% 0.012 60);  --color-ink-2: oklch(27% 0.012 58);  --color-muted: oklch(46% 0.014 60);
  --color-rule: oklch(68% 0.016 75);  --color-rule-2: oklch(34% 0.012 60);
  --color-accent: oklch(44% 0.13 32);  --color-accent-ink: oklch(95% 0.012 90);  --color-focus: oklch(48% 0.17 32);
  --font-display: "Zilla Slab", ui-serif, Georgia, serif;  --font-body: "Spectral", ui-serif, Georgia, serif;
  --font-outlier: "Libre Franklin", ui-sans-serif, system-ui, sans-serif;  --font-wordmark: "Abril Fatface", …;
  --radius-card: 0;  --radius-pill: 0;  --rule-hair: 1px;  --shadow-card: none;  --rule-double: 4px double var(--color-rule-2);
}
```
The spacing scale, the type scale, the easings and the durations are the scaffold's and live in `tokens.css`, with the site's additions (`--text-poster`, `--text-head`, `--text-numeral`, `--text-prose`). The ink band has its own pairs (`--color-on-ink`, `--color-on-ink-2`, `--color-rule-on-ink`, `--color-accent-on-ink`). Charts and diagrams take the `--chart-*` roles and the tools the `--status-*` roles: never a literal.

## Type
- Zilla Slab 700, roman, for every head, figure and control label. Never lighter, never italic.
- Spectral 400, 500 and 700 for text, labels, captions and meta: sentence case, untracked. Italic only as emphasis in running text.
- Libre Franklin 500 (agate) only for figures in lists, tables and charts, tabular.
- Abril Fatface only for "aesop" in the lockup and the æ end mark.

## Surfaces
- Rules, never boxes: radius 0, no shadow. A hairline for ordinary breaks, the double rule for major ones.
- A well is `--color-paper-2` ruled top and bottom. One ink band a page at most beside it; the brick never fills anything.
- Pictures print black and white with a one-line caption in the byline voice.

## Controls
- Primary: an ink-filled rectangle with paper type · radius 0 · 48px
- Secondary: ruled top and bottom in ink · same radius and height
- Links in running text: brick, a 1px underline that thickens on hover

## Motion
- Character: still. State only (an underline thickens, a button steps down 1px). No reveal, no counter, no animated chart.

## Exports
`src/styles/tokens.css` in this project. Tailwind, DTCG or shadcn blocks are added here on request.
