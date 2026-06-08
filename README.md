# Aesop Analytics — Visual Assets

Shared brand assets referenced across the site. Edit a file here once and every
page that links it updates automatically.

## Files

| File | Use | Notes |
|------|-----|-------|
| `favicon.svg` | Browser tab / bookmark icon | Owl on navy `#0F1F38` rounded square, twine `#C18C5D` eyes. Linked in every page's `<head>` as `assets/favicon.svg`. |
| `owl-mark.svg` | Standalone owl, light backgrounds | Navy body, twine eyes, transparent background. For nav logos, print, decks. |
| `owl-mark-reversed.svg` | Standalone owl, dark backgrounds | Paper `#FBFAF5` body, twine eyes. For navy/dark placements. |

## Brand palette (reference)
- Navy `#0F1F38` · Twine `#C18C5D` · Paper `#FBFAF5`
- Display/headers: Newsreader · Body: DM Sans · Accent (sparingly): Abril Fatface

## How pages reference these
All HTML pages link the favicon with:
`<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">`

To change the favicon site-wide, edit `favicon.svg` only — no need to touch any page.
