# Roadmap

One set of files per firmware repository, read by everything that shows or plays a Simple Touch firmware: Synthux Lab, this library, the designer and the uploader. Official and community firmwares follow the same route; only where they are listed differs.

Background, findings and the reasoning behind each step are in [notes.md](notes.md). Finished items are in the [Archive](#archive) at the end. Updated 2026-11-14.

## Where it stands

- **Library**: Official, Community and DIY wiring tabs. Officials (TouchBass, Touch FX, Touch String, Audrey II Touch, TouchBloop) come from `examples/*.json`, community firmwares from the Synthux directory or any public GitHub or Codeberg repository. README view, creator themes, modes, Play, **Connect to Simple Touch** with the live drawing, **Upload to device…**.
- **Playable**: TouchVink and TouchPlaited, each from its own repository, sha256-pinned. TouchSpore and TouchPlaited over **Connect to Simple Touch** with the live link (TouchPlaited read-only from the page).
- **Web apps**: TouchSpore's, on its own GitHub Pages (exported 2026-11-09, look updated 2026-11-12). TouchPlaited's, as `/play/` on its site, in the site's own theme and built from this repository's `main` on every deploy (2026-11-13).
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

- [x] `"oled": true` in the `emulator` block, an `oled` placement (128 × 32, between S30 and S35) and MIDI per control and mode in its `simple-touch-labels.json`. Pushed 2026-11-13.
- [x] Its site plays it: `/play/` is `player.html` with the site's header and `doc/play.css`, assembled by its `build-site.mjs` from a checkout of this repository. Its README and manual were shortened the same day.
- [x] Play it in the library (`?community=touchplaited`) on desktop and phone: boot film, OLED, LED blinks, MIDI in and out, CPU with all voices and the four FX groups busy.
- [x] Live link: the firmware sends the Live frame, a knobs frame (`7D 54 50 01 06`) and OLED half pages for 10 s after the request `F0 7D 54 50 01 7E F7`. Its label file has a `device` block with `port`, `request`, `live.knobs` and `live.oled`. Checked on hardware 2026-11-13 on simple-touch-web's test bench: levers, pads, knobs, OLED.
- [ ] Page to board, the light way: in **Connect to Simple Touch** a pad or knob on the page sends the control's own `midi` entry (`CC 20`, `note 36 ch 10`) to the board. Page only: no firmware change and no new key. A control without a `midi` entry sends nothing. The full version (`touch`, knob CCs, `hits`) stays TouchSpore's and is not planned for TouchPlaited.
- [x] **Connect to Simple Touch** in the library (`?community=touchplaited`) and on TouchPlaited's `/play/`, checked on hardware 2026-11-13.
- [ ] Guide note, after a firmware update: labels need nothing. **Play** runs the pinned build until the `emulator` block gets the new `wasm` name and `sha256`, by hand from the run summary or with the designer's **Use this build**.

### Runtime (simple-touch-web)

- [x] The build branch's README (written by `publish.mjs`) names the designer's **Find builds in the repository** › **Use this build** next to the run summary. In `v1.3`.
- [x] Sources in a firmware's `thirdparty`, `third_party`, `lib`, `libs`, `vendor` or `external` folder compile without warnings. In `v1.3`. TouchPlaited builds with 10 warnings and passes the smoke test. 8 of the 10 come from a Plaits header its own code includes.
- [ ] OLED frames inside one pass: only a pass's last frame shows. Queue frames the way LEDs are queued if an animation needs it. No firmware needs it yet.
- [ ] Opt-in pin update: after a build that passes the smoke test, the workflow writes the new `wasm` name and `sha256` into the repository's `simple-touch-labels.json` and commits it. Off by default. A commit made with the workflow's own token starts no other workflow, so a Pages deploy that reads the label file needs its own trigger. Test before the push with a local build on the test bench (`?wasm=/<repo>/build-web/<target>.wasm`).
- [ ] README: the live link as two levels. Follow: `request` and the Live frame, with knobs and OLED optional, read-only from the page (TouchPlaited). Control: `touch`, knob CCs and `hits` (TouchSpore), marked advanced.
- [ ] Later: settings persistence through the page (`PersistentStorage` and a journal like TouchPlaited's backed by `localStorage`), as an additive export.

### The shared standard

- [x] [SPEC.md](SPEC.md): the label file in three parts. Labels (`simple-touch-manual/3` with `combos`, `modTypes`, `modes`, `midi`) are all a reader needs. Play and the board (`emulator`, `device`) stay specified in simple-touch-web. Look is for the library and designer. `listing` is reserved. It ends with what the library accepts and drops.
- [x] `schema/simple-touch-labels.schema.json`: strict on labels, modifiers, modes and `emulator`, types only for the look. The five examples, TouchSpore, TouchPlaited and TouchVink pass.
- [x] "What a firmware repo carries": the table at the top of SPEC.md, linked from the about page and guide step 3c.
- [ ] Decide: the label file stays a description that needs no running firmware. Proposed:
  - `modes` stays one switch. A mode picked by a tapped pad (FM BleepBloop's P1, TouchPlaited's Recording) stays a `toggle` modifier, as SPEC.md says now.
  - What the board shows at a given moment is the live link's job. One optional `page` byte in the Live frame (0: none, n: the nth of `modifiers` then `combos`) keeps a layer's labels up after the pads are let go (TouchSpore's 2 s window) and follows a tapped mode. Specified in simple-touch-web's README, with no new key in the label file.
- [ ] Tapped combos: `modTypes` takes only single modifiers. The designer has no control for a combo, and the library drops the key.
- [ ] The library does not check `format`. Decide whether a file with another `format` is refused.
- [ ] The designer drops keys it doesn't know on **Save file**. `listing` needs adding there before anyone writes it by hand.
- [ ] Offer the format and route to Synthux (one example PR, TouchString), once they have answered.

### Library

- [ ] Flash from an exported web app: TouchSpore's Pages, **Upload to device…**, on hardware.
- [ ] `officials.json` (`id, label, repo, example, lab`) in place of the list in `core.js`. Read each official repo's own `simple-touch-labels.json` first, `examples/*.json` as the fallback. No official repository has a label file yet, so this shows nothing new until one does. `EXAMPLES` is read while both pages start, so they have to wait for the file. Do it with the cards, whose Action needs the same list.
- [ ] Cards on the Official and Community tabs: see [Firmware cards](#firmware-cards) below.
- [ ] Lab links (`embed: link-only` with a `url`) for the officials, once Synthux gives deep links and agrees.
- [ ] Firmware switcher in the player: `switchTo(doc)` = stop, set, start, keeping volume, input, lock scroll and full screen. Prev/next in full screen, swipe on a phone, `[` `]` on a keyboard, URL updated with `replaceState`. Preload the next build.
- [ ] Optional bare mode (`player.html?bare`): panel and switcher only, Lab style.
- [x] **Upload to device…** reads the directory entry's `firmware` block when it has one: `asset_pattern` picks the `.bin` when a release has several, and a `min_bootloader` newer than the bundled v6.4 gets a warning.
- [ ] Check that dialog with a real entry. No directory entry has a `firmware` block yet (8 entries, 2026-11-13).

### Firmware cards

A list of every firmware like the [directory's page](https://synthux-academy.github.io/community-instruments/), with more per card: a picture, a video or sound, the release, and Play / Open in Synthux Lab ↗ / Manual / **Upload to device…**. The creator's repository stays the source, so a card is never out of sync for long.

Where each piece comes from:

| Piece | Source |
|---|---|
| Name, author, description, repository | The directory entry (`projects.json`) |
| `firmware` block (asset pattern, hardware, bootloader) | The directory entry. Not copied into the label file. |
| Video, sound, card image | A `listing` block in `simple-touch-labels.json`, filled in on the designer's Firmware tab |
| Release, `.bin`, browser build, labels by the creator | The repository itself |

```json
"listing": {
  "video": "https://www.youtube.com/watch?v=…",
  "audio": "media/demo.mp3",
  "image": "img/card.png"
}
```

The card image, first that exists: `listing.image` (PNG, JPG or WebP at the panel's aspect ratio, under 500 KB), else the panel drawn in the creator's look with its faceplate, else the blank panel with the labels read from the README.

Loading, in three parts:

1. **Snapshot:** a GitHub Action in this repository writes `community-index.json` with what each card shows. It runs daily and by hand, and commits only when something changed. The page loads this one file first, so the list shows at once whatever its length.
2. **Refresh while read:** the page then reads each visible card's `simple-touch-labels.json` from the repository's raw files (not counted against GitHub's API limit) and updates a card that differs from the snapshot.
3. **On open:** the latest release through GitHub's API, as **Upload to device…** does now. One request per opened firmware stays under the 60 an hour allowed without signing in.

A creator's push can't start the Action (their repository would need a token for ours), so the refresh covers changes between snapshots.

- [ ] Test one audio file from `raw.githubusercontent.com` in an `<audio>` element: the type GitHub sends, and a file stored with Git LFS. Settle `listing.audio` after that. A YouTube or SoundCloud link works either way.
- [ ] `listing` in the designer's Firmware tab, in **Save file** and the Repository kit. **Export › Card image** writes `img/card.png` from the preview.
- [ ] The Action and `community-index.json`.
- [ ] The cards: snapshot first, refresh for visible cards, release on open.
- [ ] Guide: the `listing` block in the labels step.

### Officials in the browser (after Synthux answers)

Fork first, branch `web-build`, never relaxing the own-repo rule silently. Order: TouchString, TouchBass, AudreyTouch, Touch FX (its `Application::loop()` needs one pass split out), TouchBloop.

1. Setup/Loop split, hardware build checked.
2. `node ../simple-touch-web/scripts/build.mjs ../<Official>`, fix gaps, smoke test (AudreyTouch's 32 MiB and Touch FX's 8 MiB SDRAM pools).
3. Upstream as separate small PRs: the split; the workflow; the label file.

If Lab turns out to have its own pipeline, offer the split PR alone, since any browser build needs it.

### Guide

- [ ] Screenshots, one per screen. For the browser-build part: the workflow file, a green run on the Actions tab, the test bench, the designer's **Find builds in the repository** › **Use this build**, Save file, commit `simple-touch-labels.json`, Play in the library.
- [ ] Recipes, in place of one long document and of the TouchVink vs TouchPlaited comparison. One short page per feature, each with three parts side by side: the firmware snippet, the README table row, the JSON it becomes.
  - Pad as button, pad as toggle, a combo, fader with pickup, switch as play mode, OLED, MIDI per control, the Follow live link, the browser build.
  - Each recipe is a small firmware or a snippet on the template below, not one firmware with everything.
  - TouchVink (new firmware) and TouchPlaited (existing firmware) stay the two full examples the recipes link to.
- [ ] The route for each way in: code it yourself, Plugdata, or hand it to an LLM, without tying the guide to one model or tool.
- [ ] A minimal libDaisy template for the Simple Touch, as a repository of its own: the base the recipes build on. It reads every control and makes sound, with no layers. Read [SimpleTouchTemplate](https://github.com/chrisades/SimpleTouchTemplate) first, in case it already is that base. Until it exists, step 1b of the guide starts from TouchBass or Touch String.
  - Hardware: every control read (knobs S30–S35, faders S36 and S37, both switches), the user LED, the pressure-sensitive pads as Touch String reads them, audio in and out, and USB MIDI.
  - Repository: the `Setup()` / `Loop()` split, the browser build workflow, a release, a README with a controls table, a `simple-touch-labels.json`. It passes every check in the guide.
  - The polysynth below is the combined example at the end of the recipes, not the base:
    - P03–P09: notes. P10 and P11: root note down and up.
    - Left switch (SW1): scale, minor / major / lydian. Right switch (SW2): octave.
    - S36 (left fader): output volume. S37 (right fader): filter.
    - S30: detune. S31, S32: attack, decay. S33, S34, S35: level of sine, saw and square.
    - P00 held + S30: reverb. P02 held + S35: delay. P01 is free.

## In sync?

What can drift between the repos, and where it stands (2026-11-13):

| Piece | Now | Behind |
|---|---|---|
| simple-touch-web tags | `v1.4` newest, `v1` = `v1.4` | |
| Library `vendor/simple-touch-web/` | same as `v1.4` | |
| TouchPlaited workflow | `@v1` | |
| TouchPlaited approved build | `8acf93d464ec` (v1.2) | built 2026-10-29; a newer build is on its `simple-touch-web` branch |
| TouchPlaited `/play/` | this repository's `main` at its last Pages deploy | a change to `player.html`'s `</head>` or `<body>` tag stops its site build |
| TouchVink workflow | `@v1` | its approved build is from the first `v1`. A push builds with `v1.4` and a new hash; the approved one stays pinned until it is re-approved |
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
- Released simple-touch-web `v1.4` (a `device` block with only `live`). `v1` moved to `v1.4`.
- Added the live link to TouchPlaited: levers, pads, knobs and OLED in **Connect to Simple Touch**, read-only from the page. Checked on hardware on the test bench.
- Fixed a `device` block with only `live`: `parseDevice` dropped a block without settings or presets. The library hides the empty settings box.
- Released simple-touch-web `v1.3` (device source, live link, pad hits, vendored folders without warnings, the build finder in the build branch's README). `v1` moved to `v1.3`.
- Added SPEC.md and `schema/simple-touch-labels.schema.json`: what a firmware repository carries and the label file's format, linked from the about page and the guide.
- Added the directory's `firmware` block to **Upload to device…**: `asset_pattern` narrows the release's `.bin` files, and a `min_bootloader` newer than v6.4 adds a warning. Untested on a real entry: none has the block yet.
- Added the directory's optional `firmware` block to the guide (step 2b): `asset_pattern`, `hardware` and `min_bootloader`, checked against the directory's schema. The directory ignores it for now, and the designer leaves it out.
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

- **TouchVink vs TouchPlaited comparison in notes.md and the about page**: dropped 2026-11-14 for recipes under Guide.
- **Full page to board for TouchPlaited** (`touch`, knob CCs, `hits`): dropped 2026-11-14. The page sends each control's `midi` entry instead, and the full link stays optional in the standard.
- **Front page in two sections**: done as tabs (2026-11-11). What is left is the card content, under Library.
- **Live labels SysEx sent by TouchPlaited first**: TouchSpore went first, with a `request` message and knob traffic on top of the planned bytes. TouchPlaited follows the same spec.
- **Labels for TouchPlaited from `editor.html?community=touchplaited`**: done through the repository kit (2026-10-29). The approved build went in without `"oled": true`, now under Next.
- **About page as the route for each way in**: the about page now describes the project only (2026-11-12), and the route lives in the guide. The open item moved to Guide.
- **In sync, 2026-10-28**: TouchPlaited had no approved build, and its v1.1 build (`00503220fe68`) had no LED blinks. Both settled on 2026-10-29.
