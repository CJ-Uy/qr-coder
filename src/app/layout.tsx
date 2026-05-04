import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QR/FORGE — Brutalist QR Code Generator',
  description: 'Generate QR codes with custom styles, colors, and logos. No redirects, no tracking, fully client-side.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
