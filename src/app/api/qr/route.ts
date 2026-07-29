import qrcode from 'qrcode-generator';

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const data = params.get('data') ?? params.get('url');

  if (!data) {
    return new Response('Pass the URL or text as ?data=...', { status: 400 });
  }

  try {
    const qr = qrcode(0, 'Q');
    qr.addData(data);
    qr.make();

    return new Response(qr.createSvgTag({ scalable: true, margin: 8 }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
        'Content-Disposition': 'inline; filename="qr-code.svg"',
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Data is too long to fit in a QR code', { status: 400 });
  }
}
