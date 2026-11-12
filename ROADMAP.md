# Roadmap

One set of files per firmware repository, read by everything that shows or plays a Simple Touch firmware: Synthux Lab, this library, the designer and the uploader. Official and community firmwares follow the same route; only where they are listed differs.

Background, findings and the reasoning behind each step are in [notes.md](notes.md). Updated 2026-10-28.

## Where it stands

- **Library**: officials (TouchBass, Touch FX, Touch String, Audrey II Touch, TouchBloop) from `examples/*.json`, community firmwares from the Synthux directory, README view, creator themes, Play.
- **Playable**: TouchVink (from its own repository, sha256-pinned). TouchPlaited builds and passes the smoke test locally (not published yet).
- **Asked Synthux** (Discord, 2026-10-28; Fabio, Roey, Vlad): how Lab is built, whether its code is public, and whether official repos could carry the `.wasm`, `simple-touch-labels.json` and the faceplate.

## Waiting on Synthux

Their answers choose between the tracks below more than any code does. Questions still open:

1. How does Lab run a firmware: the real firmware as WebAssembly, a JS model, or recordings? Is its source public, and under what licence?
2. May the library link to Lab per firmware (a deep link such as `/touchbass` or `?fw=`), or embed it?
3. Would the official repos take small PRs: the `Setup()` / `Loop()` split, a browser-build workflow, a `simple-touch-labels.json`?
4. May the faceplate artwork (Touch FX, Touch String, …) sit in the firmware repos as SVG or PNG, and under what terms?
5. Fabio: is `simple-touch-manual/3` plus the library's extras acceptable as the shared label format, and who keeps the spec?

**Correction to send** with the follow-up: the `.wasm` can't be a release asset. GitHub release downloads send no CORS header, so no other site can load them (tested 2026-10-28, see notes). The build belongs on a branch of the repository (raw files) or on its Pages, as simple-touch-web's workflow already does.

## Now: TouchPlaited as the case study

Bridging an existing, large community firmware (Plaits, OLED, USB/TRS MIDI, QSPI settings, its own web visualizer) to the library by the documented route, and writing down what it took.

- [x] Browser build: `TouchPlaited` branch `browser-build` (85a9ca2). Setup/Loop split, ITCM copy and settings journal left out of the browser build, `-DTEST` for stmlib, the generated pattern header made on the way. 465 KB, boots, plays, 148× real time headless.
- [x] simple-touch-web `v1.1`: build `CC_SOURCES` (`.cc` files), and run make with `SIMPLE_TOUCH_WEB=1` so a Makefile can add browser-only flags. TouchVink builds to the same bytes as before.
- [x] Hardware check: `make clean && make`, flashed, works as before (2026-10-28).
- [x] TouchPlaited `.github/workflows/browser-build.yml` (branches `main`, `browser-build`), pinned to simple-touch-web `v1.1`.
- [ ] Check the first run: the run summary and the test bench link, and that the generated `patterns_gen.h` step finds `python` on the runner.
- [ ] Labels in the designer, the way any community member would: `editor.html?community=touchplaited`, check what the README extractor found, then labels, modes, MIDI (from `visualizer/src/core/controls-meta.ts` `CCS`), faceplate, notes. Repository kit → `simple-touch-labels.json` in the repo root.
- [ ] Approve the build: paste the `emulator` block (with `"oled": true`) in the designer's Browser build field, push.
- [ ] Play it in the library (`?community=touchplaited`) on desktop and phone: boot film, OLED, LED blinks, MIDI in/out, CPU with all voices and the four FX groups busy.
- [ ] Write the comparison (TouchVink vs TouchPlaited: what changed, how long, what broke) into notes.md, then into the about page as a "bridging an existing firmware" section.

## Runtime (simple-touch-web)

- [x] Released as `v1.1`, with a README note on `CC_SOURCES` and `ifdef SIMPLE_TOUCH_WEB`. ABI stays `simple-touch-web/1`.
- [x] `v1.2`: LED changes inside one main-loop pass are queued with the pass's clock and shown when the audio gets there (TouchPlaited's blinks showed only in the boot film). Board only: no page or ABI change. Test bench: right-click hold, QWERTY / AZERTY. Smoke test: pad combos (`2+11`). LED and right-click checked in the browser, test bench and library (2026-10-28).
- [x] `v1` moved to `v1.2` (2026-10-28, by hand: the permission check blocks tag force-pushes). TouchPlaited back on `@v1`. With each new 1.x, move it the same way: `git tag -f -a v1 -m v1 "v1.N^{}" && git push -f origin v1`.
- [ ] OLED frames inside one pass: only a pass's last frame shows. Fine so far; queue frames the same way if an animation needs it.
- [ ] Vendored code (`thirdparty/`, `lib/`) compiled without `-Wall`, so a firmware's own warnings stand out.
- [ ] Later: settings persistence through the page (`PersistentStorage` and a journal like TouchPlaited's backed by `localStorage`), as an additive export.

## In sync?

What can drift between the repos, and where it stands (2026-10-28):

| Piece | Now | Behind |
|---|---|---|
| simple-touch-web tags | `v1.2` newest, `v1` = `v1.2` | |
| TouchPlaited workflow | `@v1` | |
| TouchVink workflow | `@v1` | its approved build is from the first `v1`. The next push builds with `v1.2` (LED queue in the board), so expect a new hash; the approved one stays pinned and on the branch until it is re-approved |
| Library `vendor/simple-touch-web/` | same as `web/` at `v1.2` | |
| TouchPlaited approved build | none yet; newest is `8acf93d464ec` (v1.2) | `00503220fe68` (v1.1) has no LED blinks |
| Web apps exported before 2026-11-09 | their own copy of `core.js` | a label file saved since then shows there without ALL CAPS, turns, `fpDesktop` or `fpLabels`, draws a `-` box for a hidden control, and has no `design.fonts` or extra label `style`, until the web app is exported again. They also have no **Upload to device…** and only the **Pad labels** toggle in full screen until then, and pads with a CC in the MIDI column light when a firmware repeats that CC |

## The shared standard

- [ ] Write the spec for `simple-touch-labels.json`: the `simple-touch-manual/3` fields, the library's extras (`emulator`, `midi`, creator look, faceplate path), what the library accepts and drops. A JSON Schema next to it, like the directory's `schema/`.
- [ ] One page, "what a firmware repo carries": README, `simple-touch-labels.json`, faceplate (`img/faceplate.svg` or `.png`), `.bin` in releases, `.wasm` on the `simple-touch-web` branch, the two workflows.
- [x] Added A README for any firmware to `guide.html` (2026-11-09): the minimum a firmware README carries and a template with a control table, for authors whether or not they use this site.
- [x] Fixed the README reader for manuals in a second file (2026-11-09): a link also counts as the manual when the words before it say so, as in TouchCreek's root README.
- [x] Import per mode: a README heading that names a switch position (`### Seq (SW2 Up)`) starts a mode section; the import fills from one mode, with a button per mode in the designer and the library (2026-10-28).
- [x] Modes in the format (2026-10-29): `modes` next to `labels`, one switch, a name per position, each mode keeping only the labels that differ from the print set. Designer (Mode row, Modes section, fill from the README), library and web app (Mode row; labels follow the lever while playing), downloaded manual (a button and a printed page per mode).
- [ ] Live labels from hardware: one small shared SysEx (`F0 7D 53 54 01 <SW1> <SW2> <pads lo> <pads hi> [page] F7`), sent by the firmware (TouchPlaited first, next to its telemetry) and so by its browser build too; the library reads it from Web MIDI input. Spec in simple-touch-web's README.
- [ ] Modes not tied to a switch (a tapped pad such as FM BleepBloop's P1, TouchPlaited's Recording): tapped modifiers cover them as columns today; see whether `modes` should take a pad, or a `page` from the firmware.
- [x] Held-together modifiers (2026-11-09): `combos` next to `modifiers` (`"P10+P11"`, up to three controls), labels as `m_P10+P11`. A combo shares the four modifier colours. Designer, drawing, legend, control table, README reader and Play.
- [x] OLED place and shape (2026-11-09): `oled` in the label file (`{x, y, w, rows}`), moved and resized in the designer. The box follows the display's real rows, so a 128 × 32 is 4:1. A firmware's label file needs saving again and pushing to carry a placement; web apps exported earlier keep the old 2:1 box until they are exported again.
- [x] Full screen in Connect to Simple Touch (2026-11-09), with Settings in place of Sound.
- [x] More per layout (2026-11-09), in Phone and Desktop columns under Style: `oled` now `{rows, phone, desktop}` (an older `{x, y, w, rows}` goes for both), and `design.names` for where the control names go, their size and position. Names on the drawing are dragged as `offsets` key `n:<id>`. Still shared by both layouts: line sizes, padding, corner radius, gap, font and effect.
- [x] Style per layout, second round (2026-11-09): `design.caps` is now `{phone, desktop}` (an older `true` goes for both) and moved from the toolbar to Style. Colours take alpha, stored as `#rrggbbaa` (not `rgba()`: `resolveVars` can't nest its brackets in a `var()` fallback). Quarter turns per label and layout, `r` in `offsets`. `fpDesktop` for a desktop faceplate of its own, `fpLabels` for text on the faceplate.
- [x] Added hiding a control (2026-11-09): `-` in Line 1 leaves it out of the main view, with its reference name and its name on the drawing. Saved as `"main":"-"`.
- [x] Added fonts per part (2026-11-09): `design.fonts` for Line 1, Line 2, control names and faceplate labels, each `{family, url, weight}`.
- [x] Added a style per extra label (2026-11-09): `style` on the label, with font, sizes, colours and outline.
- [x] Changed the full screen **Pad labels** toggle (2026-11-09): one button steps through **All labels**, **No pad labels**, **Faceplate** and **No labels**. **Faceplate** needs `fpLabels` in the file and ignores that layout's `show: off`.
- [x] Fixed pads flashing together for 10 s after **▶ Play** (2026-11-09): a firmware's CC out lights its control only when the value changes. The MIDI column now reads `CC 21 = 3` as that one value.
- [ ] Combos in Play follow what is held. A firmware that keeps its layer open after you let go (TouchSpore's 2 s window) needs the `page` above to keep the labels up. Tapped combos have no editor control yet.
- [ ] Offer the format and route to Synthux (one example PR, TouchString), once they've answered.

## Library

- [x] Added **Upload to device…** (2026-11-09): library and web app. Pulls the latest release's `.bin`, warns when the firmware needs the Daisy bootloader, checks the Daisy's mode and writes over WebUSB. No field in the label file: the `.bin` says where it runs.
- [x] Deployed `proxy/` and set `FIRMWARE_PROXY` in `flash.js` (2026-11-09).
- [ ] Test case for the web app exporter: export TouchSpore with **Upload to device…**, host it on its own GitHub Pages and flash from there. No web app has been exported and run on a firmware yet.
- [x] Flashed internal firmwares from the dialog on hardware (2026-11-09): TouchFX and TouchSpore.
- [x] Installed the Daisy bootloader from the dialog on hardware (2026-11-09).
- [x] Flashed firmwares that need the Daisy bootloader from the dialog on hardware (2026-11-09).
- [ ] `officials.json` (`id, label, repo, example, lab`) instead of the list in `core.js` (line 297). Read each official repo's own `simple-touch-labels.json` first, `examples/*.json` as the fallback.
- [ ] Front page in two sections: Official, then Community. Each card: name, platform, and Play / Open in Synthux Lab ↗ / Manual.
- [ ] Lab links (`embed: link-only` with a `url`) for the officials, once Synthux gives deep links and agrees.
- [ ] Firmware switcher in the player: `switchTo(doc)` = stop, set, start, keeping volume, input, lock scroll and full screen. Prev/next in full screen, swipe on a phone, `[` `]` on a keyboard, URL updated with `replaceState`. Preload the next build.
- [ ] Optional bare mode (`player.html?bare`): panel and switcher only, Lab style.

## Officials in the browser (after Synthux answers)

Fork first, branch `web-build`, never relaxing the own-repo rule silently. Order: TouchString, TouchBass, AudreyTouch, Touch FX (its `Application::loop()` needs one pass split out).

1. Setup/Loop split, hardware build checked.
2. `node ../simple-touch-web/scripts/build.mjs ../<Official>`, fix gaps, smoke test (AudreyTouch's 32 MiB and Touch FX's 8 MiB SDRAM pools).
3. Upstream as separate small PRs: the split; the workflow; the label file.

If Lab turns out to have its own pipeline, offer the split PR alone, since any browser build needs it.

## Guide: zero to hero

- [ ] About page: the route for each way in. Code it yourself, Plugdata, or hand it to an LLM, without tying the guide to one model or tool.
- [ ] Use TouchVink (new firmware) and TouchPlaited (existing firmware) as the two worked examples.
- [ ] A minimal libDaisy template for the Simple Touch to clone, as a repository of its own. Until it exists, step 1b of the guide starts from TouchBass or Touch String.
  - Hardware: every control read (knobs S30–S35, faders S36 and S37, both switches), the user LED, the pressure-sensitive pads as Touch String reads them, audio in and out, and USB MIDI.
  - Repository: the `Setup()` / `Loop()` split, the browser build workflow, a release, a README with a controls table, and a `simple-touch-labels.json`. It passes every check in the guide.
  - The example: a small polysynth on DaisySP.
    - P03–P09: notes. P10 and P11: root note down and up.
    - Left switch (SW1): scale, minor / major / lydian. Right switch (SW2): octave.
    - S36 (left fader): output volume. S37 (right fader): filter.
    - S30: detune. S31, S32, S33: attack, decay, release. S34, S35 and one more: level of sine, saw and square.
    - P00 held + S30: reverb. P02 held + S35: delay. P01 is free.
  - Open: the levels need a third control. S30–S35 are six knobs and the spec asks for seven (detune, A, D, R and three levels), with S36 already the volume.
- [x] Added detailed steps to the guide (2026-11-12): each step has an **In detail** section, folded, with commands and examples filled in from the repository at the top, or from TouchSpore while none is typed. Set up lists Git, the Daisy Toolchain, Python and VS Code per system, with a chat assistant for help.
- [x] `guide.html` (2026-10-29): step by step with checks, from "I have a repository" or "from scratch", libDaisy or Plugdata: repository, release, the directory pull request early (the review runs while you work), labels, repository kit, browser build, own page, after the merge.
- [ ] Screenshots in the guide, one per screen; the browser-build part: the workflow file, a green run on the Actions tab, the test bench, the designer's **Find builds in the repository** › **Use this build** (added 2026-10-29: no more copying the block from the run summary), Save file, commit `simple-touch-labels.json`, Play in the library.
- [ ] The build branch's README (written by `build-firmware.yml`) still points only at the run summary; mention the designer's build finder in the next simple-touch-web release.

## Done when

- The front page lists every official firmware (Play or Open in Lab) with the community list below.
- The full-screen player switches between TouchVink, TouchPlaited and at least one official without a reload.
- At least one official's browser build lives in Synthux's own repository, played from there with a pinned sha256.
- The label format has a written spec that Lab, the library and the uploader can all read.
