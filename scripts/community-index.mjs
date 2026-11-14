// Writes community-index.json: what the library's firmware cards show for each
// Simple Touch entry in the Synthux community directory. Run by
// .github/workflows/community-index.yml, or by hand: node scripts/community-index.mjs
//
// Everything read here is other people's text. Strings are cut to a length and
// the page escapes them again. No date goes into the file, so it only changes
// when a firmware does.
//
// GITHUB_TOKEN (optional) lifts GitHub's API limit of 60 requests an hour.

import { readFile, writeFile } from 'node:fs/promises';

const DIRECTORY = 'https://synthux-academy.github.io/community-instruments/projects.json';
const LABEL_FILE = 'simple-touch-labels.json';
const OUT = new URL('../community-index.json', import.meta.url);
const REPO_RE = /^https:\/\/(github\.com|codeberg\.org)\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/;
const MAX_FILE = 400000;

const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const https = (v) => (typeof v === 'string' && /^https:\/\/[^\s"'<>]+$/.test(v) ? v.slice(0, 300) : '');
// A file in the repository: no scheme, no leading slash, no "..".
const repoPath = (v, ext) => (typeof v === 'string' && v.length <= 200 && /^[\w.-]+(\/[\w.-]+)*$/.test(v) && !v.split('/').includes('..') && ext.test(v) ? v : '');

const rawUrl = (r, path) => (r.host === 'github.com'
  ? `https://raw.githubusercontent.com/${r.owner}/${r.name}/HEAD/${path}`
  : `https://codeberg.org/api/v1/repos/${r.owner}/${r.name}/raw/${path}`);

async function text(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const t = await res.text();
    return t.length > MAX_FILE ? null : t;
  } catch { return null; }
}

async function latestRelease(r) {
  const api = r.host === 'github.com'
    ? `https://api.github.com/repos/${r.owner}/${r.name}/releases/latest`
    : `https://codeberg.org/api/v1/repos/${r.owner}/${r.name}/releases/latest`;
  const headers = { accept: 'application/json', 'user-agent': 'simple-touch-labels-index' };
  if (r.host === 'github.com' && process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(api, { headers });
    if (res.status === 404) return null;                 // no release
    if (!res.ok) throw new Error(`${api}: ${res.status}`);
    const d = await res.json();
    const bins = (Array.isArray(d.assets) ? d.assets : []).filter((a) => /\.bin$/i.test(a?.name || ''));
    return { tag: str(d.tag_name, 40), date: str(d.published_at, 10), bins: bins.length };
  } catch (e) {
    console.warn(String(e.message || e));
    return undefined;                                    // unknown: keep what the last snapshot had
  }
}

// The build plays in the library only from the firmware's own repository (emulatorOf, core.js).
function ownBuild(wasm, r) {
  if (typeof wasm !== 'string') return false;
  const o = r.owner.toLowerCase();
  const u = wasm.toLowerCase();
  return r.host === 'github.com'
    ? u.startsWith(`https://raw.githubusercontent.com/${o}/${r.name.toLowerCase()}/`) || u.startsWith(`https://${o}.github.io/`)
    : u.startsWith(`https://codeberg.org/${o}/${r.name.toLowerCase()}/`) || u.startsWith(`https://${o}.codeberg.page/`);
}

function fromLabelFile(d, r) {
  if (!d || typeof d !== 'object' || !d.labels || !d.firmware) return null;
  const e = d.emulator && typeof d.emulator === 'object' ? d.emulator : {};
  const l = d.listing && typeof d.listing === 'object' ? d.listing : {};
  const listing = {
    video: https(l.video),
    audio: https(l.audio) || repoPath(l.audio, /\.(mp3|ogg|oga|wav|m4a|flac)$/i),
    image: repoPath(l.image, /\.(png|jpe?g|webp)$/i),
  };
  for (const k of Object.keys(listing)) if (!listing[k]) delete listing[k];
  return {
    version: str(d.firmware.version, 24),
    play: e.embed === 'allowed' && e.abi === 'simple-touch-web/1' && ownBuild(e.wasm, r) && /^[0-9a-f]{64}$/.test(e.sha256 || ''),
    page: e.embed === 'link-only' ? https(e.url) : '',
    live: !!(d.device && typeof d.device === 'object' && d.device.live),
    oled: e.oled === true || !!d.oled,
    look: !!(d.design || d.theme || d.faceplate || d.faceplateFile),
    modes: Array.isArray(d.modes?.list) ? d.modes.list.length : 0,
    listing,
  };
}

async function card(p, old) {
  const m = p.repo.match(REPO_RE);
  const r = { host: m[1], owner: m[2], name: m[3] };
  const out = {
    id: p.id,
    name: str(p.name, 80),
    author: str(p.author?.name, 80),
    authorUrl: https(p.author?.url),
    description: str(p.description, 200),
    repo: p.repo,
    labels: 'none',
  };

  const file = await text(rawUrl(r, LABEL_FILE));
  let fromFile = null;
  if (file) { try { fromFile = fromLabelFile(JSON.parse(file), r); } catch { /* not JSON */ } }
  if (fromFile) {
    Object.assign(out, fromFile, { labels: 'file' });
    for (const k of ['version', 'page']) if (!out[k]) delete out[k];
    for (const k of ['play', 'live', 'oled', 'look', 'modes']) if (!out[k]) delete out[k];
    if (!Object.keys(out.listing).length) delete out.listing;
  } else {
    for (const n of ['README.md', 'readme.md', 'Readme.md']) {
      if (await text(rawUrl(r, n))) { out.labels = 'readme'; break; }
    }
  }

  const rel = await latestRelease(r);
  if (rel) out.release = rel;
  else if (rel === undefined && old?.release) out.release = old.release;
  return out;
}

const directory = await (await fetch(DIRECTORY)).json();
const entries = (Array.isArray(directory.projects) ? directory.projects : [])
  .filter((p) => p && p.platform === 'touch' && typeof p.id === 'string' && typeof p.name === 'string' && REPO_RE.test(p.repo || ''))
  .sort((a, b) => a.id.localeCompare(b.id));

let before = { firmware: [] };
try { before = JSON.parse(await readFile(OUT, 'utf8')); } catch { /* first run */ }
const oldOf = (id) => (Array.isArray(before.firmware) ? before.firmware.find((c) => c.id === id) : null);

const firmware = [];
for (const p of entries) firmware.push(await card(p, oldOf(p.id)));

await writeFile(OUT, JSON.stringify({ format: 'simple-touch-index/1', firmware }, null, 2) + '\n');
console.log(`${firmware.length} firmware: ${firmware.map((c) => `${c.id} (${c.labels})`).join(', ')}`);
