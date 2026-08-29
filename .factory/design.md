# Spend Pulse visual system

## Direction

**Topographic cartography** turns a spending limit into terrain. Concentric contour lines show the current week as a landscape: calm open ground when there is room, tighter lines near the allowance edge, and a clear trail marker for today. This fits a private utility because a map answers one small question — “Where am I?” — without becoming a finance dashboard.

The experience is deliberately tactile and quiet. It borrows field-note clarity, not outdoor-brand nostalgia. There are no gradients, glass panels, stock finance symbols, bank imagery, or decorative charts.

## Palette

Light mode is the primary treatment; dark mode follows the device setting.

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| `--paper` | `#F3F0E6` | `#151B19` | map-paper background |
| `--surface` | `#FCFAF3` | `#202724` | raised writing surface |
| `--ink` | `#17231E` | `#F5F1E6` | main text |
| `--muted` | `#53645B` | `#B7C2BB` | supporting text |
| `--line` | `#B8C4B8` | `#435149` | boundaries and contours |
| `--pine` | `#1E624B` | `#73C9A4` | primary action and on-pace state |
| `--pine-contrast` | `#FFFFFF` | `#102019` | text on primary action |
| `--ochre` | `#B95F28` | `#F2A36C` | trail marker and caution |
| `--danger` | `#9C3535` | `#FF9A91` | over-pace state |
| `--pulse-ink` | `#F3F0E6` | `#F5F1E6` | readable text within the high-contrast pace panel |

All text and controls target WCAG AA contrast. Pace is always stated in words and numbers, never by color alone.

## Type

- Display: **Georgia**, local system serif. Its humanist shapes resemble map titles and make the single result feel considered.
- Body and controls: **Atkinson Hyperlegible**, self-hosted TTF, with Arial/system sans fallback. It makes small dates and amounts easy to distinguish.
- Amounts use tabular figures. Headlines use a compact `clamp(2.45rem, 8vw, 5.75rem)` scale; body copy stays at 17–18px.

## Shape, spacing, and layout

- 8px base spacing with 4px for close label relationships.
- Corners use survey-cut shapes: mostly 2px or 18px, with clipped top-right corners on important panels.
- Lines are 1–2px and functional. Cards appear only for separate objects such as a log entry.
- The desktop first screen is an offset two-column field map. On a 390px phone it becomes one column, drops nonessential contour labels, and keeps the entry action above history.
- Content measure is 68 characters. Touch targets are at least 44px.

## Interaction grammar

- Primary actions resemble solid trail markers. Secondary actions resemble outlined map keys.
- Adding spending places a marker into the weekly route, then updates the terrain readout immediately.
- Destructive actions are reversible through an Undo message. Resetting all real data requires confirmation.
- Route changes focus the page heading and announce it.

## Motion policy

The signature motion is a single contour “settle”: after a saved entry, contour rings shift by at most 6px over 240ms while the pace number cross-fades. Route and panel changes use 180ms opacity and transform transitions. Nothing loops. Under `prefers-reduced-motion: reduce`, all transforms and smooth scrolling stop; updates are instant with a short opacity change only.

## Asset plan and provenance

- `assets/src/terrain-ledger.png` is the generated source. `src/assets/terrain-ledger.webp` is the optimized app asset, emitted as `dist/assets/terrain-ledger-*.webp` by the production build. The illustration appears beside the live product and is the source for the social preview.
- `public/social-card.webp`: locally composed 1200×630 crop using the original illustration and HTML text remains separate from the asset.
- App icons and favicon: hand-authored geometric SVG contour mark, rasterized locally for install icons. No icon library.

### Hero prompt sheet

**Use case:** stylized-concept  
**Asset type:** wide landing-page editorial illustration  
**Subject:** an abstract paper topographic map whose contour rings subtly form a weekly route with seven small brass trail markers and one rust-orange marker, no charts or currency symbols  
**World:** a quiet cartographer’s worktable seen almost top-down, no people  
**Materials:** recycled cream map paper, graphite contour ink, tiny blind-embossed grid, one linen edge  
**Light:** soft north-window light with restrained real paper shadows  
**Lens/composition:** wide 3:2 editorial crop, terrain concentrated to the right, calm open paper to the left, crisp macro detail  
**Palette words:** warm bone, forest pine, moss grey, oxidized copper, charcoal  
**Style:** premium editorial still life mixed with precise relief-map illustration; tactile and understated  
**Negative list:** no text, no numbers, no logos, no watermark, no people, no hands, no coins, no credit cards, no banking UI, no neon, no gradient, no glossy 3D, no illegible glyphs

Generated with the factory image deployment on 2026-08-28. The generated image is original to Spend Pulse. The source PNG and prompt sidecar live in `assets/src/`; the optimized app asset lives in `src/assets/` and builds to a hashed file in `dist/assets/`.
