# Simple Touch label library

Control maps and an interactive label editor for the Synthux Simple Touch (Daisy Seed).

- **Live Label Library**: https://jonwaterschoot.github.io/simple-touch-labels/
- **Live Label Editor**: https://jonwaterschoot.github.io/simple-touch-labels/editor.html

## Examples

| Pd / Plugdata · Light | libDaisy · Synthux panel |
| --- | --- |
| ![Label Library — Pd / Plugdata (Light)](assets/example_library_pd_light.png) | ![Label Library — libDaisy (Synthux panel)](assets/example_library_ld_panel.png) |

| Label Editor — TouchBass · Synthux gold | Exported Print · Line art |
| --- | --- |
| ![Label Editor — TouchBass (Synthux gold)](assets/example_editor_touchbass_gold.png) | ![Exported Print · Line art panel](assets/example_panel_print.png) |

## Pages

- `index.html` — label library. Label sets: Pd / Plugdata, libDaisy, Synthux, None. Styles: Light, Dark, Visualiser, Synthux panel, Synthux gold. PNG export (panel / table / both, colour or print line art). Accepts `?labels=pd|ld|sx|none&style=light|dark|vis|panel|gold`.
- `editor.html` — editor. Start from a label set, add your own labels, drag positions, fonts, colours, sketch table (filled or blank rows), Markdown notes. Exports PNG and a standalone HTML file. State is saved in localStorage (`simpleTouchLabelEditor.v1`). Accepts `?preset=pd|ld|sx|blank&style=light|dark|vis|panel|gold`.

## Files

- `support.js` — runtime that renders the `<x-dc>` pages. Required.
- `styles.css` — base typography (`Archivo`) and CSS custom property tokens.
- `assets/panel_full_bartali*.svg` — Synthux panel drawing (gray, gold, print line art). Original drawing by Roey Tsemah (Synthux Academy), adapted via Fabio Bartali's [Touch FX manual](https://bartali.nl/touch-fx-manual.html).
- `assets/simple_touch_pd.png` — screenshot of `simple_touch.pd`.
- `assets/favicon.svg`, `assets/social_preview.png` — browser tab icon and 1280×640 social media preview banner.

External at runtime: html-to-image (jsDelivr) for PNG export, Google Fonts for the font picker.

## How the pages are built

Each HTML file has two parts:

1. Template markup between `<x-dc>` and `</x-dc>`: inline styles only, `{{ path }}` holes for values, `<sc-for list="{{ … }}" as="x">` for loops, `<sc-if value="{{ … }}">` for conditions. Holes are plain lookups, no expressions.
2. A logic class in `<script type="text/x-dc" data-dc-script>`: `class Component extends DCLogic { renderVals() { return {…}; } }`. All computed values, handlers and lists come from `renderVals()`.

Label data (positions, names per set) lives in the constants at the top of the logic class: `THEMES`, `CTRL`, `SX`, `SX_SUB`, `SW`, `PD_ROWS`, `LD_ROWS`. Positions are percentages of the drawing; each control has an `abstract` position (Light/Dark/Visualiser drawing) and a `panel` position (Synthux SVG).

## Sources

- json: https://github.com/jonwaterschoot/hvcc-examples-daisy/blob/simple_touch/simple_touch.json
- pd: https://github.com/jonwaterschoot/hvcc-examples-daisy/blob/simple_touch/simple_touch.pd
- pin sheet: https://docs.google.com/spreadsheets/d/1xtg_s1tk8tm-6qNkBLFc6V1L_Mpmu-PCOvv7qEyr9mU/edit?usp=sharing
- TouchBass: https://github.com/Synthux-Academy/TouchBass
- Touch FX manual (Fabio Bartali): https://bartali.nl/touch-fx-manual.html

## License & Credits

- **Repository code**: Licensed under the [MIT License](LICENSE).
- **Simple Touch panel drawing (`assets/panel_full_bartali*.svg`)**: Excluded from the MIT license. Original drawing created by **Roey Tsemah** (founder of [Synthux Academy](https://synthux.academy)), sourced and adapted via **Fabio Bartali's** [Touch FX manual](https://bartali.nl/touch-fx-manual.html). All rights to the original Simple Touch panel artwork and hardware design remain with Roey Tsemah / Synthux Academy.

## Open items

- Confirm `Switch3` pin_a / pin_b orientation on hardware.

