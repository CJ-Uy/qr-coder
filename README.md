# Coder

A client-side QR code designer with a small SVG API.

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
