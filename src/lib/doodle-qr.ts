import qrcode from 'qrcode-generator';

type Point = [number, number];
type PenStroke = { points: Point[]; width: number; filled: boolean };

export function createDoodleQr(data: string, options: {
  seed: number;
  size: number;
  foreground: string;
  background: string;
}) {
  const { size, foreground, background } = options;
  if (!data.trim()) throw new Error('Enter a short secret to doodle.');
  if (![foreground, background].every(color => /^#[\da-f]{6}$/i.test(color))) {
    throw new Error('Use six-digit hex colors, like #0a0a0a.');
  }
  const message = new TextEncoder().encode(data);
  if (message.length > 32) throw new Error('That secret is too long for big doodles. Try a few words or a short URL.');
  const version = message.length <= 12 ? 3 : message.length <= 22 ? 4 : 5;
  const [dataWords, parityWords] = version === 3 ? [55, 15] : version === 4 ? [80, 20] : [108, 26];
  const count = version * 4 + 17;
  const reserved = (row: number, col: number) =>
    row === 6 || col === 6 || (row < 9 && col < 9) ||
    (row < 9 && col >= count - 8) || (row >= count - 8 && col < 9) ||
    (Math.abs(row - (count - 7)) <= 2 && Math.abs(col - (count - 7)) <= 2);
  const positions: Point[] = [];
  let upwards = true;
  for (let col = count - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let i = 0; i < count; i++) {
      const row = upwards ? count - 1 - i : i;
      for (let offset = 0; offset < 2; offset++) {
        if (!reserved(row, col - offset)) positions.push([row, col - offset]);
      }
    }
    upwards = !upwards;
  }
  if (Math.floor(positions.length / 8) !== dataWords + parityWords) throw new Error('Could not lay out this QR code.');

  let seed = Math.imul(options.seed >>> 0, 0x9e3779b1) >>> 0;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const strokes: PenStroke[] = [];
  const drawings: string[] = [];
  const creature = (left: number, top: number, width: number, height: number, kind: number) => {
    const narrow = width < height * 0.7;
    if (narrow) kind = 0;
    const angle = (random() - 0.5) * 0.12;
    const transform = ([x, y]: Point): Point => [
      left + width * (0.5 + (x - 0.5) * Math.cos(angle) - (y - 0.5) * Math.sin(angle)),
      top + height * (0.5 + (x - 0.5) * Math.sin(angle) + (y - 0.5) * Math.cos(angle)),
    ];
    const pen = (points: Point[], filled = false) => {
      const transformed = points.map(transform);
      const weight = filled ? 0 : 0.6;
      strokes.push({ points: transformed, width: weight, filled });
      drawings.push(`<path d="M${transformed.map(point => point.join(' ')).join(' L')}" fill="${filled ? foreground : 'none'}" stroke="${foreground}" stroke-width="${weight}"/>`);
    };
    const oval = (x: number, y: number, rx: number, ry: number, filled = false) => {
      const points: Point[] = Array.from({ length: 33 }, (_, i) => {
        const a = i * Math.PI / 16;
        return [x + Math.cos(a) * rx, y + Math.sin(a) * ry];
      });
      pen(points, filled);
    };
    const eye = (x: number, y: number, rx: number, ry: number) => {
      oval(x, y, rx, ry);
      oval(x + (random() - 0.5) * rx, y + (random() - 0.5) * ry, rx * 0.32, ry * 0.32, true);
    };
    drawings.push(`<g data-doodle="${['ghost', 'cat', 'blob', 'fish', 'frog'][kind]}">`);
    if (kind === 0) {
      pen([[0.15,0.9],[0.15,0.35],[0.2,0.2],[0.3,0.1],[0.5,0.07],[0.7,0.1],[0.82,0.23],[0.85,0.38],[0.85,0.9],[0.72,0.8],[0.59,0.9],[0.48,0.8],[0.34,0.9],[0.23,0.8],[0.15,0.9]]);
      if (narrow) {
        eye(0.5,0.38,0.22,0.13);
        pen([[0.32,0.67],[0.48,0.72],[0.65,0.66]]);
      } else {
        eye(0.35,0.4,0.12,0.13); eye(0.65,0.4,0.1,0.11);
        oval(0.52,0.65,0.1,0.09);
      }
    } else if (kind === 1) {
      pen([[0.12,0.75],[0.1,0.35],[0.15,0.08],[0.36,0.26],[0.63,0.26],[0.86,0.08],[0.9,0.35],[0.88,0.75],[0.7,0.88],[0.3,0.88],[0.12,0.75]]);
      eye(0.33,0.5,0.13,0.14); eye(0.65,0.5,0.11,0.12);
      pen([[0.4,0.7],[0.5,0.76],[0.6,0.7]]);
      pen([[0.23,0.61],[0.04,0.55]]); pen([[0.23,0.68],[0.04,0.73]]);
      pen([[0.77,0.61],[0.96,0.55]]); pen([[0.77,0.68],[0.96,0.73]]);
    } else if (kind === 2) {
      pen([[0.2,0.82],[0.09,0.68],[0.16,0.52],[0.1,0.4],[0.25,0.29],[0.2,0.16],[0.4,0.13],[0.5,0.05],[0.65,0.16],[0.85,0.13],[0.85,0.32],[0.94,0.4],[0.84,0.58],[0.9,0.73],[0.7,0.81],[0.6,0.91],[0.4,0.82],[0.3,0.9],[0.2,0.82]]);
      eye(0.34,0.42,0.14,0.15); eye(0.67,0.43,0.1,0.11);
      pen([[0.32,0.64],[0.42,0.7],[0.57,0.72],[0.7,0.62]]);
    } else if (kind === 3) {
      oval(0.44,0.52,0.31,0.3);
      pen([[0.73,0.5],[0.92,0.24],[0.93,0.77],[0.73,0.56]]);
      pen([[0.4,0.25],[0.54,0.12],[0.61,0.3]]);
      pen([[0.38,0.78],[0.52,0.94],[0.58,0.78]]);
      eye(0.29,0.45,0.12,0.14);
      pen([[0.18,0.61],[0.25,0.67],[0.33,0.6]]);
    } else {
      pen([[0.1,0.8],[0.08,0.5],[0.2,0.38],[0.17,0.18],[0.3,0.11],[0.4,0.3],[0.6,0.3],[0.7,0.11],[0.85,0.18],[0.8,0.38],[0.91,0.5],[0.9,0.8],[0.7,0.9],[0.3,0.9],[0.1,0.8]]);
      eye(0.29,0.27,0.1,0.13); eye(0.72,0.27,0.1,0.13);
      pen([[0.25,0.65],[0.4,0.77],[0.62,0.77],[0.77,0.64]]);
    }
    drawings.push('</g>');
  };
  creature(9,0,count-17,5.8,random() < 0.5 ? 1 : 4);
  creature(0,9,5.8,count-17,random() < 0.5 ? 0 : 2);
  const rows = version === 5 ? 2 : 1;
  const cellWidth = (count - 9) / 2;
  const cellHeight = (count - 18) / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < 2; x++) creature(9+x*cellWidth,9+y*cellHeight,cellWidth,cellHeight,Math.floor(random()*5));
  }
  creature(9,count-9,count-18,8.8,random() < 0.5 ? 1 : 3);
  creature(count-4,count-9,3.8,8.8,0);

  const painted = (x: number, y: number) => strokes.some(({ points, width, filled }) => {
    if (filled) {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [a,b] = points[i], [c,d] = points[j];
        if ((b > y) !== (d > y) && x < (c-a)*(y-b)/(d-b)+a) inside = !inside;
      }
      if (inside) return true;
    }
    for (let i = 1; i < points.length; i++) {
      const [ax,ay] = points[i-1], [bx,by] = points[i];
      const dx = bx-ax, dy = by-ay;
      const t = Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy || 1)));
      if (Math.hypot(x-ax-t*dx,y-ay-t*dy) <= width/2) return true;
    }
    return false;
  });
  const art = Array.from({ length: count }, (_, row) => Array.from({ length: count }, (_, col) => painted(col+0.5,row+0.5)));
  const maskBit = (mask: number, row: number, col: number) => [
    (row+col)%2===0,row%2===0,col%3===0,(row+col)%3===0,
    (Math.floor(row/2)+Math.floor(col/3))%2===0,
    (row*col)%2+(row*col)%3===0,
    ((row*col)%2+(row*col)%3)%2===0,
    ((row+col)%2+(row*col)%3)%2===0,
  ][mask];
  let best: { matrix: boolean[][]; mask: number; score: number } | undefined;
  for (let mask = 0; mask < 8; mask++) {
    // Scanners stop at the terminator; the following padding can encode the drawing.
    const bytes = Array<number>(dataWords-2).fill(0);
    message.forEach((byte, i) => { bytes[i] = byte; });
    for (let bit = 16+message.length*8; bit < dataWords*8-4; bit++) {
      const [row,col] = positions[bit];
      if (art[row][col] !== maskBit(mask,row,col)) bytes[Math.floor((bit-12)/8)] |= 1 << (7-(bit-12)%8);
    }
    // shortcut: raw padding relies on qrcode-generator 1.5.2; use an explicit raw-bit encoder before upgrading it.
    let writing = false;
    const padded = new Proxy(bytes, {
      get(target, key, receiver) {
        if (key === 'length') return writing ? target.length : message.length;
        if (key === '0') writing = true;
        const value = Reflect.get(target,key,receiver);
        if (key === String(target.length-1)) writing = false;
        return value;
      },
    });
    const qr = qrcode(version,'L');
    const previousEncoding = qrcode.stringToBytes;
    try {
      qrcode.stringToBytes = () => padded;
      qr.addData(data); qr.make();
    } finally {
      qrcode.stringToBytes = previousEncoding;
    }
    const matrix = Array.from({ length: count }, (_, row) => Array.from({ length: count }, (_, col) => qr.isDark(row,col)));
    let format = 0;
    for (let i = 0; i < 15; i++) {
      const row = i < 6 ? i : i < 8 ? i+1 : count-15+i;
      if (matrix[row][8]) format |= 1 << i;
    }
    const oldMask = ((format ^ 0x5412) >> 10) & 7;
    for (const [row,col] of positions) {
      if (maskBit(oldMask,row,col) !== maskBit(mask,row,col)) matrix[row][col] = !matrix[row][col];
    }
    const formatData = 8 | mask;
    let remainder = formatData << 10;
    for (let i = 14; i >= 10; i--) if (remainder & (1 << i)) remainder ^= 0x537 << (i-10);
    format = ((formatData << 10) | remainder) ^ 0x5412;
    for (let i = 0; i < 15; i++) {
      const row = i < 6 ? i : i < 8 ? i+1 : count-15+i;
      const col = i < 8 ? count-i-1 : i === 8 ? 7 : 14-i;
      matrix[row][8] = matrix[8][col] = !!(format & (1 << i));
    }
    const parity = Array.from({ length: parityWords }, (_, index) => {
      const cells = positions.slice((dataWords+index)*8,(dataWords+index+1)*8);
      const score = cells.reduce((sum,[r,c]) => sum+(matrix[r][c]===art[r][c] ? 0 : matrix[r][c] ? 1 : 2),0);
      return { cells, score };
    }).sort((a,b) => b.score-a.score);
    // Keep three codewords of correction capacity for rasterization and scanning.
    for (const { cells, score } of parity.slice(0,Math.floor(parityWords/2)-3)) {
      if (score) cells.forEach(([r,c]) => { matrix[r][c] = art[r][c]; });
    }
    const score = positions.reduce((sum,[r,c]) => sum+(matrix[r][c]===art[r][c] ? 0 : matrix[r][c] ? 1 : 2),0);
    if (!best || score < best.score) best = { matrix, mask, score };
  }
  const { matrix, mask } = best!;
  const repairs: string[] = [];
  const patterns: string[] = [];
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (reserved(row,col)) {
        patterns.push(`<rect x="${col}" y="${row}" width="1" height="1" fill="${matrix[row][col] ? foreground : background}"/>`);
      } else if (matrix[row][col] && !art[row][col]) {
        repairs.push(`<path d="M${col+0.2} ${row+0.68} L${col+0.8} ${row+0.32}" fill="none" stroke="${foreground}" stroke-width="0.55"/>`);
      } else {
        const radius = !matrix[row][col] && art[row][col] ? 0.42 : 0.22;
        repairs.push(`<circle cx="${col+0.5}" cy="${row+0.5}" r="${radius}" fill="${matrix[row][col] ? foreground : background}"/>`);
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${count+8} ${count+8}" data-art-version="${version}" data-art-mask="${mask}">
<rect width="100%" height="100%" fill="${background}"/>
<clipPath id="doodle-bounds"><rect x="0" y="0" width="${count}" height="${count}"/></clipPath>
<g transform="translate(4 4)" clip-path="url(#doodle-bounds)" stroke-linecap="round" stroke-linejoin="round">
${drawings.join('')}${repairs.join('')}
<g shape-rendering="crispEdges">${patterns.join('')}</g>
</g></svg>`;
}
