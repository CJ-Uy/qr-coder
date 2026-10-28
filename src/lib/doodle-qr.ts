import QRCode from "qrcode";
import { drawQrMotif, type Point, type PenStroke } from "./qr-artwork";
import { getQrPreset, type QrPresetId } from "./qr-presets";

export type DoodleTheme = QrPresetId;
export const MAX_DOODLE_BYTES = 384;

// QR level L block counts and total parity codewords, versions 1–40.
// Function patterns use qrcode's public BitMatrix. Raw byte/terminator/art bits
// and Reed–Solomon interleaving are owned here; no encoder-global overrides.
const blocksL = [1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25];
const parityL = [7,10,15,20,26,36,40,48,60,72,80,96,104,120,132,144,168,180,196,224,224,252,270,300,312,336,360,390,420,450,480,510,540,570,570,600,630,660,720,750];
function totalCodewords(v: number) {
  let bits = (16 * v + 128) * v + 64;
  if (v >= 2) { const n = Math.floor(v / 7) + 2; bits -= (25 * n - 10) * n - 55; if (v >= 7) bits -= 36; }
  return Math.floor(bits / 8);
}
const exp = new Uint8Array(512), log = new Uint8Array(256);
for (let i = 0, value = 1; i < 255; i++) { exp[i] = value; log[value] = i; value <<= 1; if (value & 256) value ^= 0x11d; }
for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];
const multiply = (a: number, b: number) => a && b ? exp[log[a] + log[b]] : 0;
const polynomials = new Map<number, number[]>();
function parity(data: Uint8Array, length: number) {
  let polynomial = polynomials.get(length);
  if (!polynomial) {
    polynomial = [1];
    for (let i = 0; i < length; i++) {
      const next = Array<number>(polynomial.length + 1).fill(0);
      polynomial.forEach((value, j) => { next[j] ^= value; next[j + 1] ^= multiply(value, exp[i]); });
      polynomial = next;
    }
    polynomials.set(length, polynomial);
  }
  const result = new Uint8Array(length);
  for (const byte of data) {
    const factor = byte ^ result[0]; result.copyWithin(0, 1); result[length - 1] = 0;
    for (let i = 0; i < length; i++) result[i] ^= multiply(polynomial[i + 1], factor);
  }
  return result;
}
function isMasked(mask: number, r: number, c: number) {
  return [(r+c)%2===0,r%2===0,c%3===0,(r+c)%3===0,(Math.floor(r/2)+Math.floor(c/3))%2===0,(r*c)%2+(r*c)%3===0,((r*c)%2+(r*c)%3)%2===0,((r+c)%2+(r*c)%3)%2===0][mask];
}

export function createDoodleQr(data: string, options: { seed: number; size: number; foreground: string; background: string; theme?: DoodleTheme }) {
  const { size, foreground, background } = options;
  if (!Number.isInteger(size) || size < 200 || size > 4096) throw new Error("Use a QR size from 200 to 4096 pixels.");
  if (!data.trim()) throw new Error("Enter a link or message to draw into the QR.");
  if (![foreground, background].every(color => /^#[\da-f]{6}$/i.test(color))) throw new Error("Use six-digit hex colors.");
  const luminance = (color: string) => [1,3,5].map(i => parseInt(color.slice(i,i+2),16)/255).map(c => c<=0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[0.2126,0.7152,0.0722][i],0);
  if (luminance(background) <= luminance(foreground) || (luminance(background)+0.05)/(luminance(foreground)+0.05)<7) throw new Error("Use dark ink on a light background with strong contrast.");
  const message = new TextEncoder().encode(data);
  if (message.length > MAX_DOODLE_BYTES) throw new Error(`This link is too long for clear QR artwork. Use a complete shorter link (${MAX_DOODLE_BYTES} UTF-8 bytes maximum), or choose a standard QR.`);
  const preset = getQrPreset(options.theme ?? "party");
  const desired = message.length<=12 ? 55 : message.length<=22 ? 80 : message.length<=32 ? 108 : Math.ceil(message.length*2.4+12);
  // Full URLs need enough padding area to keep the art and scanner landmarks
  // distinct across presets; the smaller single-block layouts remain for text.
  let version = message.length > 32 ? 7 : 3;
  while (version<40 && totalCodewords(version)-parityL[version-1]<desired) version++;
  const count = version*4+17, dataWords = totalCodewords(version)-parityL[version-1];
  const blockCount = blocksL[version-1], parityWords = parityL[version-1]/blockCount;
  const template = QRCode.create([{ data: message, mode: "byte" }], { version, errorCorrectionLevel: "L", maskPattern: 0 });
  const reserved = (r: number,c: number) => !!template.modules.reservedBit[r*count+c];
  const positions: Point[] = [];
  let upwards = true;
  for (let col=count-1;col>0;col-=2) {
    if (col===6) col--;
    for (let i=0;i<count;i++) { const row=upwards?count-1-i:i; for (let j=0;j<2;j++) if (!reserved(row,col-j)) positions.push([row,col-j]); }
    upwards=!upwards;
  }
  if (Math.floor(positions.length/8)!==totalCodewords(version)) throw new Error("Could not lay out this QR code.");
  // Match the standard's short and long data blocks before placing art padding.
  const shortBlocks=blockCount-dataWords%blockCount;
  const lengths=Array.from({length:blockCount},(_,b)=>Math.floor(dataWords/blockCount)+Number(b>=shortBlocks));
  const offsets=lengths.map((_,b)=>lengths.slice(0,b).reduce((sum,n)=>sum+n,0));
  const rawToInterleaved=Array<number>(dataWords);
  let word=0;
  for(let i=0;i<Math.max(...lengths);i++) for(let b=0;b<blockCount;b++) if(i<lengths[b]) rawToInterleaved[offsets[b]+i]=word++;
  let seed=Math.imul(options.seed>>>0,0x9e3779b1)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const strokes:PenStroke[]=[],drawings:string[]=[];
  let motifIndex=Math.floor(random()*preset.motifs.length);
  const symbol=(left:number,top:number,width:number,height:number)=>{
    const motif=preset.motifs[motifIndex++%preset.motifs.length];
    const art=drawQrMotif(left,top,width,height,motif,random,foreground);strokes.push(...art.strokes);drawings.push(...art.drawings);
  };
  // Compose complete symbols between alignment patterns. The old edge strips
  // stretched objects and let the protected squares cut through their faces.
  const bands: [number,number][]=[];
  let start=9;
  for(let c=9;c<count-9;c++){
    const blocked=Array.from({length:count-18},(_,i)=>reserved(i+9,c)).some(Boolean);
    if(blocked){if(c-start>=5)bands.push([start,c]);start=c+1;}
  }
  if(count-9-start>=5)bands.push([start,count-9]);
  let chosen=bands.length>1?[bands[0],bands[bands.length-1]]:bands;
  if(chosen.length===1&&chosen[0][1]-chosen[0][0]>=16){
    const[a,b]=chosen[0],middle=(a+b)/2;
    chosen=[[a,middle-0.7],[middle+0.7,b]];
  }
  for(const[x0,x1]of chosen)for(const[y0,y1]of chosen)symbol(x0+0.6,y0+0.6,x1-x0-1.2,y1-y0-1.2);
  // Visit only a stroke's occupied cells, rather than testing every module
  // against every path segment. This keeps preset switching responsive.
  const art=Array.from({length:count},()=>Array<boolean>(count).fill(false));
  const visit=(minX:number,minY:number,maxX:number,maxY:number,hit:(x:number,y:number)=>boolean)=>{
    for(let r=Math.max(0,Math.ceil(minY-0.5));r<=Math.min(count-1,Math.floor(maxY-0.5));r++)for(let c=Math.max(0,Math.ceil(minX-0.5));c<=Math.min(count-1,Math.floor(maxX-0.5));c++)if(!art[r][c]&&hit(c+0.5,r+0.5))art[r][c]=true;
  };
  for(const{points,width,filled}of strokes){
    if(filled){
      visit(Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1])),(x,y)=>{
        let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const[a,b]=points[i],[c,d]=points[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;}return inside;
      });
    }
    const radius=width/2;
    for(let i=1;i<points.length;i++){
      const[ax,ay]=points[i-1],[bx,by]=points[i],dx=bx-ax,dy=by-ay;
      visit(Math.min(ax,bx)-radius,Math.min(ay,by)-radius,Math.max(ax,bx)+radius,Math.max(ay,by)+radius,(x,y)=>{
        const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-ax-t*dx,y-ay-t*dy)<=radius;
      });
    }
  }
  let best:{matrix:boolean[][];mask:number;score:number}|undefined;
  for(let mask=0;mask<8;mask++){
    const raw=new Uint8Array(dataWords);
    const put=(start:number,value:number,length:number)=>{for(let bit=0;bit<length;bit++)if(value&(1<<(length-bit-1)))raw[Math.floor((start+bit)/8)]|=1<<(7-(start+bit)%8);};
    const countBits=version<10?8:16,header=4+countBits;
    put(0,4,4);put(4,message.length,countBits);message.forEach((byte,i)=>put(header+i*8,byte,8));
    // A genuine four-bit terminator follows the COMPLETE payload.
    for(let bit=header+message.length*8+4;bit<dataWords*8;bit++){const[r,c]=positions[rawToInterleaved[Math.floor(bit/8)]*8+bit%8];if(art[r][c]!==isMasked(mask,r,c))put(bit,1,1);}
    const encoded=new Uint8Array(totalCodewords(version));
    raw.forEach((byte,i)=>{encoded[rawToInterleaved[i]]=byte;});
    for(let b=0;b<blockCount;b++)parity(raw.slice(offsets[b],offsets[b]+lengths[b]),parityWords).forEach((byte,i)=>{encoded[dataWords+i*blockCount+b]=byte;});
    const matrix=Array.from({length:count},(_,r)=>Array.from({length:count},(_,c)=>!!template.modules.get(r,c)));
    positions.forEach(([r,c],bit)=>{matrix[r][c]=!!(encoded[Math.floor(bit/8)]&(1<<(7-bit%8)))!==isMasked(mask,r,c);});
    const formatData=8|mask;let remainder=formatData<<10;
    for(let i=14;i>=10;i--)if(remainder&(1<<i))remainder^=0x537<<(i-10);
    const format=((formatData<<10)|remainder)^0x5412;
    for(let i=0;i<15;i++){const r=i<6?i:i<8?i+1:count-15+i,c=i<8?count-i-1:i===8?7:14-i;matrix[r][8]=matrix[8][c]=!!(format&(1<<i));}
    // Reserve three correction codewords IN EACH block for scanning noise.
    for(let b=0;b<blockCount;b++){
      const candidates=Array.from({length:parityWords},(_,i)=>{const index=dataWords+i*blockCount+b,cells=positions.slice(index*8,index*8+8);const score=cells.reduce((sum,[r,c])=>sum+(matrix[r][c]===art[r][c]?0:matrix[r][c]?1:2),0);return{cells,score};}).sort((a,b)=>b.score-a.score);
      for(const{cells,score}of candidates.slice(0,Math.max(0,Math.floor(parityWords/2)-3)))if(score)cells.forEach(([r,c])=>{matrix[r][c]=art[r][c];});
    }
    const score=positions.reduce((sum,[r,c])=>sum+(matrix[r][c]===art[r][c]?0:matrix[r][c]?1:2),0);
    if(!best||score<best.score)best={matrix,mask,score};
  }
  const{matrix,mask}=best!,repairs:string[]=[],patterns:string[]=[];
  for(let r=0;r<count;r++)for(let c=0;c<count;c++){
    if(reserved(r,c))patterns.push(`<rect x="${c}" y="${r}" width="1" height="1" fill="${matrix[r][c]?foreground:background}"/>`);
    else if(matrix[r][c])repairs.push(`<circle cx="${c+0.5}" cy="${r+0.5}" r="${art[r][c]?0.28:0.33}" fill="${foreground}"/>`);
    else if(!matrix[r][c])repairs.push(`<circle cx="${c+0.5}" cy="${r+0.5}" r="${art[r][c]?0.47:0.24}" fill="${background}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${count+8} ${count+8}" data-art-version="${version}" data-art-mask="${mask}" data-art-blocks="${blockCount}"><rect width="100%" height="100%" fill="${background}"/><clipPath id="doodle-bounds"><rect width="${count}" height="${count}"/></clipPath><g transform="translate(4 4)" clip-path="url(#doodle-bounds)" stroke-linecap="round" stroke-linejoin="round">${drawings.join("")}${repairs.join("")}<g shape-rendering="crispEdges">${patterns.join("")}</g></g></svg>`;
}
