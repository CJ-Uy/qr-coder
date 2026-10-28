# Coder

A client-side QR code designer with a small SVG API.

The **Illustrated** dot style brings Harbor's 32 faceless presets into the QR
itself. Choose an occasion and preset for parties, food, shops, markets, music,
celebrations, outdoors or community. Symbols keep their proportions and sit
between scanner landmarks; small round data modules replace diagonal hatching.
Click **Shuffle artwork** for a new arrangement carrying the same message.
Download as SVG, PNG, JPEG or WebP. The classic QR styles remain available.

Illustrated mode supports complete links or text through 384 UTF-8 bytes. It
encodes the full payload and a terminator before shaping unused padding, with
three correction codewords reserved per block. Oversized input shows an error;
it is never truncated or silently converted. Choose a classic style for longer
content. Use dark ink on a light background and test with your phone before printing.

Run `pnpm test` to check all 32 presets at three seeds and two sizes (192 decode
cases), complete message recovery, mixed-size block interleaving, correction
reserve, protected markers, quiet zones and symbol proportions. The owned byte
encoder uses `qrcode` for structural patterns; it does not override global byte
writers. `qrcode-generator` remains in use by the standard SVG API.

## API

```text
GET https://qr.cjuy.dev/api/qr?data=https%3A%2F%2Fexample.com
```

`url` is also accepted as an alias for `data`. The response is an SVG image.
Agent instructions are available at `/llms.txt`; the machine-readable API description is at `/openapi.json`.

## Getting Started

Read the documentation at https://opennext.js.org/cloudflare.

## Develop

Run the Next.js development server:

```bash
npm run dev
# or similar package manager command
```

Open [http://localhost:3000](http://localhost:3000).

## Preview

Preview the application locally on the Cloudflare runtime:

```bash
npm run preview
# or similar package manager command
```

## Deploy

The release tooling is pinned to Next.js 16.4.3 and OpenNext Cloudflare 1.20.14.
The previous local combination built successfully but failed the Worker runtime
smoke with a dynamic middleware-manifest require error. A related upstream
report is [OpenNext issue 1258](https://github.com/opennextjs/opennextjs-cloudflare/issues/1258).
Verify the built Worker and `/api/qr` before publishing; compilation alone does
not establish that the runtime works.

The repository uses pnpm's [hoisted dependency layout](https://pnpm.io/10.x/settings#nodelinker)
because the Windows OpenNext trace produced unreadable copied dependency links
with the isolated layout. Install with `pnpm install --frozen-lockfile` before building.

Deploy the application to Cloudflare:

```bash
npm run deploy
# or similar package manager command
```
