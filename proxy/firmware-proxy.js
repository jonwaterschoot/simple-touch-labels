/* Cloudflare Worker for Upload to device: GET ?url=<release download URL> returns the .bin with a CORS header.
   GitHub and Codeberg release downloads send none, so a page on another site can't read them.
   It only serves .bin files from release download paths, up to the size of the Daisy's QSPI flash. */
const ALLOWED_URL = /^https:\/\/(github\.com|codeberg\.org)\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\/releases\/download\/[^/?#]+\/[^/?#]+\.bin$/i;
const ALLOWED_ORIGIN = /^(https:\/\/[a-z0-9-]+\.(github\.io|codeberg\.page)|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/i;
const MAX_BYTES = 8 * 1024 * 1024;

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGIN.test(origin)) return new Response('Origin not allowed', { status: 403 });
    const cors = { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' };
    const fail = (text, status) => new Response(text, { status, headers: cors });
    if (request.method !== 'GET') return fail('Use GET', 405);

    const url = new URL(request.url).searchParams.get('url') || '';
    if (!ALLOWED_URL.test(url) || url.includes('..')) return fail('Not a release .bin URL', 400);

    // a tag's files rarely change and the page checks GitHub's digest, so a day in Cloudflare's cache is safe
    const upstream = await fetch(url, { redirect: 'follow', cf: { cacheEverything: true, cacheTtl: 86400 } });
    if (!upstream.ok) return fail('Upstream ' + upstream.status, 502);
    if (+upstream.headers.get('Content-Length') > MAX_BYTES) return fail('File too large', 413);
    const body = await upstream.arrayBuffer();
    if (body.byteLength > MAX_BYTES) return fail('File too large', 413);
    return new Response(body, { headers: { ...cors, 'Content-Type': 'application/octet-stream', 'Cache-Control': 'public, max-age=3600' } });
  },
};
