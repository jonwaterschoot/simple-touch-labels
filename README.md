# Simple Touch labels

Control maps, manuals and a manual designer for the Synthux Simple Touch (Daisy Seed).

- **Library**: https://jonwaterschoot.github.io/simple-touch-labels/
- **Designer**: https://jonwaterschoot.github.io/simple-touch-labels/editor.html

## Examples

| Library · TouchBass · Synthux panel | Library · Pd / Plugdata · Light |
| --- | --- |
| ![Library: TouchBass in the Synthux panel theme](assets/example_library_touchbass.png) | ![Library: Pd / Plugdata names in the Light theme](assets/example_library_pd_light.png) |

## Pages

- `index.html`: the library. Reference maps with Synthux, libDaisy and Pd / Plugdata names (with their pin tables), and manuals for TouchBass, Touch FX, Touch String, Audrey II Touch and TouchVink, with labels checked against each firmware's repo. Accepts `?src=sx|ld|pd|touchbass|touchfx|touchstring|audreytouch|touchvink&theme=…&layout=phone|desktop`. The Community picker lists the Simple Touch entries of the [Synthux community directory](https://synthux-academy.github.io/community-instruments/) (read from its `projects.json`, leaving out those already above); open one with `?community=<id>`. Its labels come from the repository's `simple-touch-labels.json` if it has one (made in the designer), else they are auto-extracted from its README and a linked manual, marked as such with the line each label came from. Controls without a label show the Synthux names.
- **Play**: when a firmware's label file has a browser build its author approved (an `emulator` block, see below), the library shows a Play button. The firmware then runs in the page, built with [simple-touch-web](https://github.com/jonwaterschoot/simple-touch-web): drag the knobs and faders on the drawing, click the levers, press the pads (higher up on a pad is harder; keys 3 4 · W E R · A S D F G · X V). Its LED and OLED show on the panel. A loop, the mic or a sound file of your own goes into its input. TouchVink is the first.
- `editor.html`: the designer. Accepts `?start=blank|touchbass|touchfx|touchstring|audreytouch|touchvink&ref=sx|ld|pd&theme=…&layout=…`, `?community=<id>` (a directory entry's name, author and repository, with the labels the library found) or `?s=<share link>`. State is kept in this browser (localStorage `simpleTouchManual.v1`).
- `about.html`: how the library, firmware repositories and the community directory fit together, how labels are found, and how creators publish theirs (including a README layout the extractor reads).

Both pages:

- **Themes**: Light, Dark and Visualiser (the simplified drawing), Synthux panel, Synthux gold and Print (the Synthux drawing). Each theme can use either drawing.
- **Layouts**: phone (label boxes on the controls) and desktop (side columns with leader lines). Labels lay themselves out; knob labels hang just below their knob.
- **Main and secondary functions**: up to four modifiers, held (P10 + knob) or tapped (a mode switch, as in TouchVink), shown side by side or stacked, with a legend and a black-and-white print style.
- **Export**: a preview popup where you drag the drawing to the size you want (or fit it to A4 / Letter), set the margin, panel gap, table gap and text size with sliders, then download a PNG or PDF (panel, table and notes) or print it; the export minimap in the header shows what is included.

The designer adds:

- **Labels tab**: firmware name and description, line 1 / line 2 per control, modifier columns, reference names as captions or fill-ins, extra free labels, drag to nudge any label, Markdown notes, control table (filled or blank rows).
- **Style tab**: faceplate upload (SVG or image) with area (whole panel or top plate), blend mode, opacity, position and scale, plus a layered SVG template and a PNG template; the drawing and its colours per theme; modifier colours; label boxes (sizes, fill opacity, drop shadow or glow, separate pad colours); secondary-view style.
- **Browser build**: paste the `emulator` block from a [simple-touch-web](https://github.com/jonwaterschoot/simple-touch-web#publishing-a-build) build's run summary to approve that build. `"embed": "allowed"` lets the library play it, `"link-only"` with a `"url"` links to the author's own page, and `"oled": true` shows the OLED. The build must come from the firmware's repository (raw files or its owner's Pages), and its `sha256` pins it.
- **Fonts**: any Google Font by name, or a CSS URL (Adobe Fonts projects work too).
- **Files**: save and open JSON (Fabio Bartali's `simple-touch-manual/3` format, plus extras), copy a compressed share link, download a standalone manual page (phone and desktop layouts, screen and print versions).
- **Repository kit**: one .zip for the firmware's repository, previewed before download: a README (intro, control map PNG, control table, notes, suggested install and build steps for libDaisy or Plugdata, internal flash or the Daisy bootloader, with TODOs for the creator), `simple-touch-labels.json`, the community directory entry and a short HOW-TO.
- **Directory entry**: builds `projects/<id>.json` for the Synthux community directory from the firmware name, author, repository and author link, checks it against the directory's schema and existing entries, and opens a pull request on GitHub with the file filled in (or the existing file, if the repository is already listed).

The pages load `assets/panel_blank.svg` with `fetch`, so open them over HTTP (GitHub Pages or a local server, e.g. `python -m http.server`), not as a file.

## Files

- `core.js`: slots, reference names, themes, the layout engine, both drawings, faceplates, fonts, Markdown, share links and exports. Shared by both pages.
- `play.js`: Play. The panel's controls as an interactive layer over the drawing, the audio chain (input, firmware, volume, limiter), the LED and OLED. It loads the runtime in `vendor/simple-touch-web/` (simple-touch-web's `web/`, tag `v1`, ABI `simple-touch-web/1`) on the first Play.
- `community.js`: the community directory (`projects.json`), reading firmware repositories on GitHub and Codeberg (`simple-touch-labels.json`, `README.md` and a linked manual), and the README label extractor. Repository text is only shown escaped, and repository faceplates are left out until the faceplate sanitiser is tightened.
- `ui.css`: page chrome; `styles.css`: base typography (`Archivo`) and colour tokens.
- `examples/*.json`: firmware labels and notes, from the [TouchBass](https://github.com/Synthux-Academy/TouchBass), [TouchFX](https://github.com/Synthux-Academy/TouchFX), [TouchString](https://github.com/Synthux-Academy/TouchString), [AudreyTouch](https://github.com/Synthux-Academy/AudreyTouch) and [TouchVink](https://github.com/jonwaterschoot/TouchVink) repos. The Touch FX and Touch String faceplates go in `examples/faceplates/` (`touchfx.svg`, `touchstring.svg`), which is kept out of the repository until the artwork is cleared. Where the files are present, the pages show them; elsewhere these examples use the blank faceplate.
- `assets/panel_blank.svg`: the Synthux panel drawing with a blank faceplate. Its colours are CSS custom properties (`--pbg`, `--pline`, `--pshape`, `--pmid`, `--ptop`, `--pctl`, …), so one file serves every theme. The simplified drawing is generated in `core.js`.
- `assets/simple_touch_pd.png`: screenshot of `simple_touch.pd`; `assets/example_*.png`: the screenshots above; `assets/favicon.svg`, `assets/social_preview.png`: tab icon and 1280×640 social preview.

External at runtime: html-to-image (jsDelivr) for PNG and PDF export, Google Fonts for the label fonts. When Play is pressed: the approved build from the firmware's repository, and the loops from simple-touch-web's Pages.

## Sources

- json: https://github.com/jonwaterschoot/hvcc-examples-daisy/blob/simple_touch/simple_touch.json
- pd: https://github.com/jonwaterschoot/hvcc-examples-daisy/blob/simple_touch/simple_touch.pd
- pin sheet: https://docs.google.com/spreadsheets/d/1xtg_s1tk8tm-6qNkBLFc6V1L_Mpmu-PCOvv7qEyr9mU/edit?usp=sharing
- Firmware: [TouchBass](https://github.com/Synthux-Academy/TouchBass), [TouchFX](https://github.com/Synthux-Academy/TouchFX), [TouchString](https://github.com/Synthux-Academy/TouchString), [AudreyTouch](https://github.com/Synthux-Academy/AudreyTouch), [TouchVink](https://github.com/jonwaterschoot/TouchVink)
- Touch FX manual (Fabio Bartali): https://bartali.nl/touch-fx-manual.html

## License & Credits

- **Repository code**: Licensed under the [MIT License](LICENSE).
- **Layout engine and manual format**: adapted from Fabio Bartali's Simple Touch Manual Designer (build 40).
- **Firmware faceplates (Touch FX, Touch String)**: Synthux Academy artwork, supplied via Fabio Bartali. Not in this repository until cleared, and excluded from the MIT license.
- **Simple Touch panel drawing (`assets/panel_blank.svg`)**: Excluded from the MIT license. Original drawing created by **Roey Tsemah** (founder of [Synthux Academy](https://synthux.academy)), sourced and adapted via **Fabio Bartali's** [Touch FX manual](https://bartali.nl/touch-fx-manual.html). All rights to the original Simple Touch panel artwork and hardware design remain with Roey Tsemah / Synthux Academy.

## Open items

- Confirm `Switch3` pin_a / pin_b orientation on hardware.
- The simplified drawing's pad shapes come from the old label editor's sketch and are approximate.
