# Writing & Documentation Style Guide

Write for makers, musicians, and firmware authors who want immediate clarity. State what something does, how to trigger it, or what went wrong. Stop writing when the facts run out.

## 1. Global Anti-LLM Rules (Apply Everywhere)

- **No Em Dashes or Mid-Sentence Pivot Dashes:** Never use em dashes (`—`), en dashes (`–`), or spaced hyphens (` - `) to tack on explanations, asides, or dramatic summaries. Do not replace an em dash with a semicolon or colon to preserve a bloated sentence. Instead:
  1. End the sentence with a period. Delete the second clause if it is filler, or start a new sentence if it contains a necessary fact.
  2. Use parentheses `()` strictly for brief technical specs, units, or keyboard shortcuts, such as `(128 × 32)` or `(Ctrl+Z)`.
  - **Allowed:** en dashes in ranges (`P00–P09`, `S30–S35`), arrows for mappings (`→`), a colon after a label in lists or section headers (`Labels tab: firmware name and description`), and a lone `—` as an empty table cell. The ban targets dashes in running prose.
- **Banned Vocabulary:** Never use brochure words: *seamless, seamlessly, robust, powerful, comprehensive, streamline, leverage, utilize, delve, crucial, enhance, elevate, out-of-the-box, intuitive, effortlessly, exciting, thrilled, tailored, empowers.* Use plain verbs ("use", not "utilize"; "fix", not "address an issue where").
- **No Dangling "-ing" Justifications:** Never end a factual sentence with a participial phrase explaining why the feature is good (for example: *"...ensuring smooth transfers," "...enabling faster workflows," "...providing full control,"* or *"...making it easy to..."*). Cut the sentence at the comma.
- **No Negative Parallelisms:** Never write *"It's not just X, it's Y"* or *"Rather than doing X, the library does Y."* State what the page does directly.
- **No Throat-Clearing or Wrap-Ups:** Never open a section, dialog, or commit message with a general preamble, and never end with a summary paragraph repeating what was just explained.
- **Concrete Mechanisms Over Metaphors:** Never say data is "wired through," errors "surface" or "bubble up," processes "spin up," or "the drawing becomes the instrument." Name the exact action, format, or state.
- **No Rhetorical Lead-Ins:** Never open with a short question that the next sentence answers (*"Already have a README? Keep it."*). Write the condition: *"If you already have a README, keep it."*
- **No Slogans or Cute Sign-Offs:** Cut taglines (*"From a first line of code to..."*), chatty asides (*"that's normal," "done"*), congratulations (*"well played"*), and filler headings (*"Good to know," "In short"*).
- **Bold Is for Labels and UI Names:** Bold a list label or a control the reader has to find on screen. Never bold people's names or words for emphasis.
- **Spelling:** British in prose (colour, labelled, visualiser, licence as a noun). The MIT License keeps its name.

## 2. Rules by Surface

### A. Page Copy: Buttons, Tooltips, Hints, Notices
- **Length Caps:** Button text max 6 words. Tooltips (`title`) max 15 words. Hints max 60 words. Past that, split the hint into labelled paragraphs or link to `about.html`.
- **No Self-Reference:** Never start a description with *"This button allows you to..."* or *"Here you can..."*. Start with the effect: *"Reads the simple-touch-web branch of the repository above"* or *"Drag to resize the preview."*
- **Actionable Errors:** State `[What failed] + [How to fix it]`. Never apologize.
  - *Bad:* "Oops, something went wrong while loading the drawing. Please try again later."
  - *Good:* "The panel drawing could not be loaded. Open this page from a web server (GitHub Pages or a local server), not as a file."
- **One Name per Thing:** Docs name a button or tab exactly as the page writes it, in bold, with its `…` if it has one. Menu paths use `›` (**Settings › Pages**). `…` on a button means it opens a dialog, `↗` means a new tab, and `·` separates short items.
- **Generated Files Count:** Text the designer writes into other people's repositories (README, `HOW-TO.txt`, `HOW-TO-PAGES.md`, the downloaded manual) follows the same rules.

### B. Roadmap, Notes & Commit Messages
- **Lead with the User Change:** Start every item with what changed for the user, not internal refactoring.
- **No Hype Adjectives:** Use direct verbs: **Added**, **Fixed**, **Changed**, **Removed**.
- **Format:** `[Verb] [Feature/Component]: [What it does now and any constraint].`
  - *Bad:* "Enhanced the designer with a powerful new per-layout system, making it effortless to place the OLED."
  - *Good:* "Added per-layout OLED placement: saved as `oled`, `{rows, phone, desktop}`. Older files apply to both layouts."
- **Dates Are Absolute:** Write `2026-10-28`, never "last week".

### C. READMEs & Code Documentation
- **Zero Setup Fluff:** Start READMEs with a 1-sentence plain description of the tool, followed immediately by prerequisites or commands.
- **One Place per Fact:** The README lists what exists, the file formats and the URL parameters. How-to steps live in `guide.html` and `about.html`. Link to them.
- **No Walls of Text:** A README bullet over 100 words gets sub-bullets, one topic each.
- **Don't Narrate Signatures:** In JS comments, never repeat what the function name and arguments already state. Document only browser quirks, units and ranges, stored formats, side effects, audio-thread constraints, and why a non-obvious workaround exists.
- **Keep Comments True:** When behaviour changes, update or delete the comments and docs that describe the old behaviour.

## 3. What Not to Touch

- **Parser patterns:** The em and en dashes in `community.js` regular expressions, and the comments quoting README samples, match other people's READMEs. They stay.
- **Names other files rely on:** A button text quoted in the docs or read by code (**Build the labels in the Designer**, **Find builds in the repository**, **Use this build**) changes everywhere or not at all.
- **Copied text:** `vendor/simple-touch-web/` is a copy of another repository, so fix it there. Labels and notes in `examples/*.json` come from the firmware repositories.
