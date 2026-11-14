# A Simple Touch firmware repository

The files a firmware repository carries so that a library, a player or an uploader can show, play and flash the firmware, and the format of `simple-touch-labels.json`.

Only the first two rows are needed for a listing. Each of the others adds one thing. The [guide](https://jonwaterschoot.github.io/simple-touch-labels/guide.html) has the steps for each.

## What the repository carries

| File | Where | What reads it |
|---|---|---|
| `README.md` with a controls table | Root, default branch | People. The library shows it under the manual, and reads labels from it when there is no label file |
| The firmware, a `.bin` | An asset of the latest release | **Upload to device…** |
| `simple-touch-labels.json` | Root, default branch | The control map, the creator's look, and which browser build may be played |
| Faceplate (SVG, PNG, JPG, WebP, GIF or AVIF) | The path the label file names, `img/faceplate.svg` by default | Drawn on the panel |
| Browser builds, `<name>-<hash>.wasm` | The `simple-touch-web` branch, written by `.github/workflows/browser-build.yml` | **Play**, for the one build the label file approves |
| Web app | `docs/`, served by GitHub Pages | Optional. The manual and Play at the creator's own address |

The repository is public, on GitHub or Codeberg. Its entry in the [Synthux community directory](https://github.com/Synthux-Academy/community-instruments) (`projects/<id>.json`: name, author, description, repository) lives in the directory, not in the firmware repository. A label file never repeats what the entry holds about flashing (`firmware.asset_pattern`, `hardware`, `min_bootloader`).

## `simple-touch-labels.json`

JSON, UTF-8, up to 400 KB. The base is Fabio Bartali's `simple-touch-manual/3`. Everything after [Labels](#labels) is optional.

Three rules keep it small:

1. A reader uses the keys it knows and skips the rest. A printed label sheet needs only [Labels](#labels).
2. Text is plain text. Only `firmware.notes` is Markdown. A reader escapes all of it.
3. Paths point into the same repository, relative to its root, without `..`.

[schema/simple-touch-labels.schema.json](schema/simple-touch-labels.schema.json) is the same in JSON Schema (draft 2020-12). To check a file: `npx ajv-cli validate --spec=draft2020 -s schema/simple-touch-labels.schema.json -d simple-touch-labels.json`.

### Labels

The smallest file:

```json
{
  "format": "simple-touch-manual/3",
  "firmware": { "name": "TouchBass", "author": "Synthux Academy" },
  "modifiers": ["P10"],
  "labels": {
    "S31": { "main": "Osc 1 pitch", "main_2": "±1 oct", "m_P10": "Osc 1 wave" },
    "P10": { "main": "Shift" }
  }
}
```

| Key | Value |
|---|---|
| `format` | `"simple-touch-manual/3"` |
| `firmware` | `name` (40 characters), `author` (60), `version` (16), `description` (300), `notes` (Markdown, 8000). Also `repo` (the repository's address, no trailing `/` or `.git`) and `authorUrl` (`https://…`) |
| `labels` | One object per control, by control id |
| `modifiers` | Control ids that give the other controls a second function: pads, knobs or faders. `[]` for none. A file without the key is read as `["P10", "P11"]`, as older files meant |

Control ids:

| Id | Control |
|---|---|
| `S30`–`S35` | Knobs |
| `S36`, `S37` | Left and right fader |
| `P00`–`P11` | Pads. `P10` and `P11` are the two at the top |
| `S09_S10`, `S07_S08` | Left and right switch |
| `IN`, `OUT`, `LED` | The jacks and the Seed's LED |

A label holds:

| Key | Value |
|---|---|
| `main` | Line 1: what the control does (20 characters). `"-"` hides the control |
| `main_2` | Line 2: detail, such as a switch's positions (24). Not shown on `P00`–`P02`, `IN` and `OUT` |
| `m_<modifier>` | What the control does with that modifier (24): `m_P10`, or `m_P10+P11` for a combo |
| `midi` | The control's MIDI (40): `CC 20`, `note 36 ch 10`, `CC 30 ≥ 64`, `CC 21 = 3`. Several are separated by `·` or a comma. Channels count from 1, and no channel means any |

Up to four modifiers and combos count together. Longer text is cut to its length.

### More about modifiers

| Key | Value |
|---|---|
| `combos` | Controls held together as one modifier: `["P10+P11"]`, two or three ids joined by `+`. Its labels use `m_P10+P11`. The controls need not be in `modifiers` |
| `modTypes` | `{"P00": "toggle"}`: the modifier is tapped, not held. Without an entry a modifier is held |

### Modes

For a switch that changes what the other controls do.

```json
"modes": {
  "switch": "S07_S08",
  "list": [
    { "pos": "up", "name": "Seq", "labels": { "S31": { "main": "Tempo" } } },
    { "pos": "down", "name": "Pitch", "labels": { "S31": { "main": "-" } } }
  ]
}
```

- `switch`: `S07_S08` (positions `up`, `centre`, `down`) or `S09_S10` (`left`, `centre`, `right`).
- `list`: one entry per named position. `labels` has the same keys as above and holds only what differs in that mode. `"-"` means nothing in that mode.
- `labels` at the top level stays complete without the modes. It is what a printed panel shows, and all that a reader without modes sees.

A mode picked by a tapped pad is a `toggle` modifier, not a mode.

### Play and the board

Both blocks are specified in [simple-touch-web's README](https://github.com/jonwaterschoot/simple-touch-web#approving-a-build).

| Key | Value |
|---|---|
| `emulator` | The browser build its author approved: `wasm`, `abi`, `sha256`, `embed` (`"allowed"` or `"link-only"` with a `url`), `oled`. The build comes from the firmware's own repository or its owner's Pages |
| `device` | MIDI port name, settings, presets and the live link for a real board |

### Look

How the library and designer draw the manual. Other readers can skip all of it. Positions are in panel units: the drawing is 1080 × 1598.24.

| Key | Value |
|---|---|
| `faceplate` | Path of the faceplate file, up to 8 MB. An SVG is cleaned of scripts and outside links. Older files hold the SVG itself |
| `fpStyle` | Its placement: `area` (`panel` or `top`), `blend`, `opacity`, `scale`, `x`, `y`, `ratio`, `stretch` |
| `fpDesktop` | The desktop layout's own faceplate: `art` (`same`, `own` or `none`), `faceplate` (a path, for `own`), `style` |
| `fpLabels` | Text that is part of the faceplate: `on`, `text` per control id, and per layout `show` (`off`, `with` or `instead`) and `size` |
| `customs` | Extra labels: `id`, `text`, `sub`, `x`, `y`, `style` |
| `offsets` | Moved and turned labels per layout: `{"phone": {"S31": {"x": 10, "y": -170, "r": 90}}, "desktop": {}}`. Keys are a control id, `f:<id>` for its faceplate label, `n:<id>` for its name. `r` is 90, 180 or 270 |
| `oled` | Where the display sits: `rows` (32 or 64) and per layout `x`, `y`, `w` |
| `design`, `font`, `view` | The designer's style settings (`design.v` is 2), the font (`family`, a Google Fonts name) and the theme it was saved in |

### The card: `listing`

Optional. What the library's card for the firmware adds to the directory entry. Each key is optional.

| Key | What it holds |
|---|---|
| `video` | An `https://` link: YouTube (a Short shows in portrait) or a video file (`.mp4`, `.m4v`, `.mov`, `.webm`) |
| `audio` | A sound file in the repository (`media/demo.mp3`; MP3, Ogg, WAV, M4A or FLAC, not stored with Git LFS), or an `https://` link. A link that is not a sound file shows as **Listen ↗** |
| `image` | A picture in the repository for the card (`img/card.png`; PNG, JPG or WebP). Without it the card draws the panel in the file's theme and panel colours |

A YouTube video shows as a still with a play button. The library keeps the still itself, so nothing is asked of YouTube until someone presses play.

## What the library accepts and drops

- **Not a label file:** no `labels` object or no `firmware` object, invalid JSON, or over 400 KB. The library then reads the README. It does not check `format` today.
- **Labels:** dropped for an unknown control id or key. Text is cut to its length.
- **Missing name, author, description, repository:** taken from the directory entry.
- **`emulator`:** dropped unless `embed` is `"allowed"`, `abi` is `simple-touch-web/1`, `sha256` is 64 hex digits and `wasm` is under the same repository's raw files or its owner's Pages. A `link-only` block needs an `https://` `url`.
- **`modes`:** dropped for another switch. A position without a name, or named twice, is left out.
- **Look:** only plain numbers, colours and known words pass. Fonts are Google Fonts families. A faceplate path outside the pattern above is ignored.
- **`device`:** a malformed setting or preset is left out and the rest still work.

The designer writes only the keys in this document. A key it doesn't know is gone after **Save file**.
