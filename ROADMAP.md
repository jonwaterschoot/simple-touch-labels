# Roadmap

One set of files per firmware repository, read by everything that shows or plays a Simple Touch firmware: Synthux Lab, this library, the designer and the uploader. Official and community firmwares follow the same route; only where they are listed differs.

Background, findings and the reasoning behind each step are in [notes.md](notes.md). Updated 2026-10-28.

## Where it stands

- **Library**: officials (TouchBass, Touch FX, Touch String, Audrey II Touch) from `examples/*.json`, community firmwares from the Synthux directory, README view, creator themes, Play.
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
- [ ] Move `v1` to `v1.1` (the actions convention: `v1` = newest 1.x), so firmwares on `@v1` get it; existing builds keep their hashes. Needs a force-push of the tag, so done by hand. TouchPlaited can then go back to `@v1`.
- [ ] LED (and OLED) changes inside one main-loop pass: record them with their virtual time and let the page play them back, as the boot film does. Without it, blinks made with `Delay()` inside a pass don't show. Check first whether TouchPlaited's blinks actually vanish in the browser.
- [ ] Vendored code (`thirdparty/`, `lib/`) compiled without `-Wall`, so a firmware's own warnings stand out.
- [ ] Later: settings persistence through the page (`PersistentStorage` and a journal like TouchPlaited's backed by `localStorage`), as an additive export.

## The shared standard

- [ ] Write the spec for `simple-touch-labels.json`: the `simple-touch-manual/3` fields, the library's extras (`emulator`, `midi`, creator look, faceplate path), what the library accepts and drops. A JSON Schema next to it, like the directory's `schema/`.
- [ ] One page, "what a firmware repo carries": README, `simple-touch-labels.json`, faceplate (`img/faceplate.svg` or `.png`), `.bin` in releases, `.wasm` on the `simple-touch-web` branch, the two workflows.
- [ ] Modes: decide how a firmware whose labels change with a switch position (TouchPlaited's SW2: Seq / Arp-Mel / Pitch) is described. Modifiers as tapped mode switches work today; see whether a `mode` per modifier (switch position instead of pad) is worth adding.
- [ ] Offer the format and route to Synthux (one example PR, TouchString), once they've answered.

## Library

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

## Done when

- The front page lists every official firmware (Play or Open in Lab) with the community list below.
- The full-screen player switches between TouchVink, TouchPlaited and at least one official without a reload.
- At least one official's browser build lives in Synthux's own repository, played from there with a pinned sha256.
- The label format has a written spec that Lab, the library and the uploader can all read.
