# Roadmap

One set of files per firmware repository, read by everything that shows or plays a Simple Touch firmware: Synthux Lab, this library, the designer and the uploader. Official and community firmwares follow the same route; only where they are listed differs.

Background, findings and the reasoning behind each step are in [notes.md](notes.md). Finished items are in the [Archive](#archive) at the end. Updated 2026-11-13.

## Where it stands

- **Library**: Official, Community and DIY wiring tabs. Officials (TouchBass, Touch FX, Touch String, Audrey II Touch, TouchBloop) come from `examples/*.json`, community firmwares from the Synthux directory or any public GitHub or Codeberg repository. README view, creator themes, modes, Play, **Connect to Simple Touch** with the live drawing, **Upload to device…**.
- **Playable**: TouchVink and TouchPlaited, each from its own repository, sha256-pinned. TouchSpore over **Connect to Simple Touch** with the live link.
- **Web apps**: TouchSpore's, on its own GitHub Pages (exported 2026-11-09, look updated 2026-11-12).
- **Designer**: modes, combos, per-layout style, fonts per part, OLED placement, **Open repository…**, README files in **Open file…**.
- **Guide**: step by step with a repository check and an **In detail** section per step. The about page describes the project in three parts.
- **Synthux**: asked on Discord (2026-10-28; Fabio, Roey, Vlad). No answer yet.

## Waiting on Synthux

Their answers choose between the tracks below more than any code does. Questions still open:

1. How does Lab run a firmware: the real firmware as WebAssembly, a JS model, or recordings? Is its source public, and under what licence?
2. May the library link to Lab per firmware (a deep link such as `/touchbass` or `?fw=`), or embed it?
3. Would the official repos take small PRs: the `Setup()` / `Loop()` split, a browser-build workflow, a `simple-touch-labels.json`?
4. May the faceplate artwork (Touch FX, Touch String, …) sit in the firmware repos as SVG or PNG, and under what terms?
5. Fabio: is `simple-touch-manual/3` plus the library's extras acceptable as the shared label format, and who keeps the spec?

**Correction to send** with the follow-up: the `.wasm` can't be a release asset. GitHub release downloads send no CORS header, so no other site can load them (tested 2026-10-28, see notes). The build belongs on a branch of the repository (raw files) or on its Pages, as simple-touch-web's workflow already does.

While waiting, the DevTools check in notes.md (Synthux Lab) needs no answer from them.

## Next

### TouchPlaited: finish the case study

Labels, faceplate and an approved build (`8acf93d464ec`, v1.2) are in its repository since 2026-10-29.

- [ ] Add `"oled": true` to the `emulator` block in its `simple-touch-labels.json`, push.
- [ ] Play it in the library (`?community=touchplaited`) on desktop and phone: boot film, OLED, LED blinks, MIDI in and out, CPU with all voices and the four FX groups busy.
- [ ] Live link: send the Live SysEx next to its telemetry and add a `device` block with `live`, as TouchSpore does.
- [ ] Write the comparison (TouchVink vs TouchPlaited: what changed, how long, what broke) into notes.md, then into the about page as a "bridging an existing firmware" section.

### Runtime (simple-touch-web)

- [ ] Release `v1.3`: `main` is 13 commits past `v1.2` (device source, live link, pad hits). Then move `v1`: `git tag -f -a v1 -m v1 "v1.3^{}" && git push -f origin v1` (by hand: the permission check blocks tag force-pushes).
- [ ] With that release, the build branch's README (written by `build-firmware.yml`) mentions the designer's **Find builds in the repository** next to the run summary.
- [ ] OLED frames inside one pass: only a pass's last frame shows. Queue frames the way LEDs are queued if an animation needs it.
- [ ] Compile vendored code (`thirdparty/`, `lib/`) without `-Wall`, so a firmware's own warnings stand out.
- [ ] Later: settings persistence through the page (`PersistentStorage` and a journal like TouchPlaited's backed by `localStorage`), as an additive export.

### The shared standard

- [ ] Write the spec for `simple-touch-labels.json`: the `simple-touch-manual/3` fields, the library's extras (`emulator`, `device`, `modes`, `combos`, `oled`, `design`, `midi`, creator look, faceplate path), and what the library accepts and drops. A JSON Schema next to it, like the directory's `schema/`.
- [ ] One page, "what a firmware repo carries": README, `simple-touch-labels.json`, faceplate (`img/faceplate.svg` or `.png`), `.bin` in releases, `.wasm` on the `simple-touch-web` branch, the two workflows.
- [ ] Modes not tied to a switch (a tapped pad such as FM BleepBloop's P1, TouchPlaited's Recording): tapped modifiers cover them as columns today. Decide whether `modes` takes a pad, or a `page` from the firmware's Live SysEx.
- [ ] Combos in Play follow what is held. A firmware that keeps its layer open after you let go (TouchSpore's 2 s window) needs that `page` to keep the labels up. Tapped combos have no editor control yet.
- [ ] Offer the format and route to Synthux (one example PR, TouchString), once they have answered.

### Library

- [ ] Flash from an exported web app: TouchSpore's Pages, **Upload to device…**, on hardware.
- [ ] `officials.json` (`id, label, repo, example, lab`) in place of the list in `core.js`. Read each official repo's own `simple-touch-labels.json` first, `examples/*.json` as the fallback.
- [ ] Cards on the Official and Community tabs: name, platform, and Play / Open in Synthux Lab ↗ / Manual.
- [ ] Lab links (`embed: link-only` with a `url`) for the officials, once Synthux gives deep links and agrees.
- [ ] Firmware switcher in the player: `switchTo(doc)` = stop, set, start, keeping volume, input, lock scroll and full screen. Prev/next in full screen, swipe on a phone, `[` `]` on a keyboard, URL updated with `replaceState`. Preload the next build.
- [ ] Optional bare mode (`player.html?bare`): panel and switcher only, Lab style.

### Officials in the browser (after Synthux answers)

Fork first, branch `web-build`, never relaxing the own-repo rule silently. Order: TouchString, TouchBass, AudreyTouch, Touch FX (its `Application::loop()` needs one pass split out), TouchBloop.

1. Setup/Loop split, hardware build checked.
2. `node ../simple-touch-web/scripts/build.mjs ../<Official>`, fix gaps, smoke test (AudreyTouch's 32 MiB and Touch FX's 8 MiB SDRAM pools).
3. Upstream as separate small PRs: the split; the workflow; the label file.

If Lab turns out to have its own pipeline, offer the split PR alone, since any browser build needs it.

### Guide

- [ ] Screenshots, one per screen. For the browser-build part: the workflow file, a green run on the Actions tab, the test bench, the designer's **Find builds in the repository** › **Use this build**, Save file, commit `simple-touch-labels.json`, Play in the library.
- [ ] TouchVink (new firmware) and TouchPlaited (existing firmware) as the two worked examples.
- [ ] The route for each way in: code it yourself, Plugdata, or hand it to an LLM, without tying the guide to one model or tool.
- [ ] A minimal libDaisy template for the Simple Touch, as a repository of its own. Until it exists, step 1b of the guide starts from TouchBass or Touch String.
  - Hardware: every control read (knobs S30–S35, faders S36 and S37, both switches), the user LED, the pressure-sensitive pads as Touch String reads them, audio in and out, and USB MIDI.
  - Repository: the `Setup()` / `Loop()` split, the browser build workflow, a release, a README with a controls table, a `simple-touch-labels.json`. It passes every check in the guide.
  - The example: a small polysynth on DaisySP.
    - P03–P09: notes. P10 and P11: root note down and up.
    - Left switch (SW1): scale, minor / major / lydian. Right switch (SW2): octave.
    - S36 (left fader): output volume. S37 (right fader): filter.
    - S30: detune. S31, S32, S33: attack, decay, release. S34, S35 and one more: level of sine, saw and square.
    - P00 held + S30: reverb. P02 held + S35: delay. P01 is free.
  - Open: the levels need a third control. S30–S35 are six knobs and the spec asks for seven (detune, A, D, R and three levels), with S36 already the volume.

## In sync?

What can drift between the repos, and where it stands (2026-11-13):

| Piece | Now | Behind |
|---|---|---|
| simple-touch-web tags | `v1.2` newest, `v1` = `v1.2` | `main` has 13 untagged commits (device source, live link, pad hits) |
| Library `vendor/simple-touch-web/` | same as simple-touch-web `main` | ahead of any tag until `v1.3` |
| TouchPlaited workflow | `@v1` | |
| TouchPlaited approved build | `8acf93d464ec` (v1.2) | `emulator` block lacks `"oled": true` |
| TouchVink workflow | `@v1` | its approved build is from the first `v1`. A push builds with `v1.2` and a new hash; the approved one stays pinned until it is re-approved |
| TouchSpore web app | exported 2026-11-12 | |
| Web apps exported before 2026-11-09 | their own copy of `core.js` | a label file saved since then shows there without ALL CAPS, turns, `fpDesktop`, `fpLabels`, `design.fonts` or label `style`, and draws a `-` box for a hidden control. No **Upload to device…** and only the **Pad labels** toggle in full screen. Export again to fix |

## Done when

- The library lists every official firmware (Play or Open in Lab) with the community list next to it.
- The full-screen player switches between TouchVink, TouchPlaited and at least one official without a reload.
- At least one official's browser build lives in Synthux's own repository, played from there with a pinned sha256.
- The label format has a written spec that Lab, the library and the uploader can all read.

## Archive

Finished items, newest first, and plans that changed.

### Done

**2026-11-13**
- Fixed the guide's Plugdata set up: it no longer asks for VS Code. It lists Plugdata and the compiler toolchain it installs, says hvcc translates a patch to C++ for the Daisy, and names what the compile needs (patch, abstractions in its folder, the `simple_touch.json` board file).

**2026-11-12**
- Added detailed steps to the guide: each step has an **In detail** section, folded, with commands and examples filled in from the repository at the top, or from TouchSpore while none is typed. Set up lists Git, the Daisy Toolchain, Python and VS Code per system.
- Added **Check** to the guide's repository field. The guide says when and where to open the directory pull request.
- Added **Open repository…** to the designer: any public GitHub or Codeberg repository, listed in the community directory or not. README files in **Open file…** fill in labels and modes.
- Changed the about page: the project only, in three parts. The route lives in the guide.
- Changed the page look and the designer's header (File, Export and Publish rows).

**2026-11-11**
- Added TouchBloop to the official firmware.
- Changed the library toolbar: Official, Community and DIY wiring tabs.

**2026-11-09**
- Added **Upload to device…** in the library and web app: pulls the latest release's `.bin`, warns when it needs the Daisy bootloader, checks the Daisy's mode and writes over WebUSB. Deployed `proxy/` and set `FIRMWARE_PROXY` in `flash.js`. Checked on hardware: TouchFX and TouchSpore (internal), the Daisy bootloader install, and firmwares that need the bootloader.
- Exported TouchSpore's web app to its `docs/` and GitHub Pages: manual, Play and USB upload.
- Added the live link to **Connect to Simple Touch** (simple-touch-web, 2026-11-08/09): a `device` block with `live`, the Live SysEx `F0 7D 53 54 01 …`, knobs both ways, pad hits on the drawing. TouchSpore sends it. Spec in simple-touch-web's README.
- Added held-together modifiers: `combos` next to `modifiers` (`"P10+P11"`, up to three controls), labels as `m_P10+P11`, sharing the four modifier colours.
- Added OLED place and shape, then per layout: `oled` is `{rows, phone, desktop}` (an older `{x, y, w, rows}` goes for both). The box follows the display's real rows, so a 128 × 32 is 4:1.
- Added per-layout style under Style: `design.names`, `design.caps` as `{phone, desktop}`, quarter turns (`r` in `offsets`), `fpDesktop`, `fpLabels`. Colours take alpha as `#rrggbbaa` (`resolveVars` can't nest `rgba()` brackets in a `var()` fallback).
- Added hiding a control (`"main":"-"`), fonts per part (`design.fonts`) and a style per extra label.
- Added full screen in **Connect to Simple Touch**, with Settings in place of Sound.
- Changed the full screen **Pad labels** toggle into one button: **All labels**, **No pad labels**, **Faceplate**, **No labels**.
- Fixed pads flashing together for 10 s after **▶ Play**: a CC out lights its control only when the value changes.
- Added A README for any firmware to the guide. Fixed the README reader for manuals in a second file.

**2026-10-29**
- Added `guide.html`: from "I have a repository" or "from scratch", libDaisy or Plugdata, through the directory pull request, labels, repository kit, browser build and own page.
- Added **Find builds in the repository** › **Use this build** to the designer, in place of copying the block from the run summary.
- Added modes to the format: `modes` next to `labels`, one switch, a name per position. Designer, library, web app and downloaded manual.
- TouchPlaited: labels, faceplate and the approved build committed to its repository.

**2026-10-28**
- Added import per mode: a README heading that names a switch position (`### Seq (SW2 Up)`) starts a mode section.
- TouchPlaited browser build on branch `browser-build` (85a9ca2): Setup/Loop split, ITCM copy and settings journal left out, `-DTEST` for stmlib. 465 KB, 148× real time headless. Hardware build checked after the split. Workflow `browser-build.yml` on `@v1`, first runs green.
- simple-touch-web `v1.1` (`CC_SOURCES`, `SIMPLE_TOUCH_WEB=1` for make) and `v1.2` (LED changes queued per pass, so TouchPlaited's blinks show while playing; right-click hold; QWERTY / AZERTY). `v1` moved to `v1.2`.

### Changed plans

- **Front page in two sections**: done as tabs (2026-11-11). What is left is the card content, under Library.
- **Live labels SysEx sent by TouchPlaited first**: TouchSpore went first, with a `request` message and knob traffic on top of the planned bytes. TouchPlaited follows the same spec.
- **Labels for TouchPlaited from `editor.html?community=touchplaited`**: done through the repository kit (2026-10-29). The approved build went in without `"oled": true`, now under Next.
- **About page as the route for each way in**: the about page now describes the project only (2026-11-12), and the route lives in the guide. The open item moved to Guide.
- **In sync, 2026-10-28**: TouchPlaited had no approved build, and its v1.1 build (`00503220fe68`) had no LED blinks. Both settled on 2026-10-29.
