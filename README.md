# Coder

A client-side QR code designer with a small SVG API.

Choose **Goofy Doodles** in Dot Pattern, enter your text or URL, and click
**Randomize doodles** for a new cast of large cats, ghosts, fish, and blob
monsters carrying the same message. Download the preview
as SVG, PNG, JPEG, or WebP. Short messages give the doodles more room; use dark ink
on a light background and test with your phone before printing.

Doodle mode supports up to 32 UTF-8 bytes. It shapes unused QR padding around the
artwork and uses a bounded amount of error correction. This is experimental;
scanner behavior can vary. The standard QR styles support longer content.

Run `npm test` with Node.js 22.18+ to check message recovery, the correction budget,
corner markers, and quiet zone. Raw-padding support is tied to the pinned
`qrcode-generator` 1.5.2 byte writer and must be reviewed before upgrading it.

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

Deploy the application to Cloudflare:

```bash
npm run deploy
# or similar package manager command
```
