# simple-touch-web runtime

The browser half of [simple-touch-web](https://github.com/jonwaterschoot/simple-touch-web) (`web/`), copied unchanged from tag `v1` (commit 7be8d8f). It plays firmware built with ABI `simple-touch-web/1`. `play.js` loads it when a firmware's label file has an approved `emulator` block.

- `simple-touch.js`: loads a build, checks its sha256, and talks Simple Touch to it
- `simple-touch-processor.js`: the AudioWorklet that runs the build
- `oled.js`: draws the virtual OLED

To update, copy `web/` from a newer simple-touch-web tag with the same ABI. A new ABI needs a new folder and a change to `EMULATOR_ABI` in `core.js`.

MIT, as simple-touch-web.
