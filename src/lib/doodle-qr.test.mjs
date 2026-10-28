import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import QRCode from 'qrcode';
import { loadQrSource, raster, decode } from './qr-test-helpers.mjs';
const require = createRequire(import.meta.url);
const EC = require('qrcode/lib/core/error-correction-code');
const level = require('qrcode/lib/core/error-correction-level').L;
const ReedSolomon = require('qrcode/lib/core/reed-solomon-encoder');
const { createDoodleQr, MAX_DOODLE_BYTES } = loadQrSource('./doodle-qr.ts');
const { qrPresets } = loadQrSource('./qr-presets.ts');
const options = { seed: 1, size: 960, foreground: '#111111', background: '#ffffff' };
const link = 'https://harbor.cjuy.dev/events/demo-night-shift';

test('all presets put distinctive art inside a square QR and shuffle deterministically', () => {
  assert.equal(qrPresets.length, 32);
  assert.equal(new Set(qrPresets.map(p => p.id)).size, 32);
  assert.equal(new Set(qrPresets.map(p => p.category)).size, 8);
  const results = qrPresets.map(p => createDoodleQr(link, { ...options, theme: p.id }));
  assert.equal(new Set(results).size, 32);
  assert.equal(results[0], createDoodleQr(link, { ...options, theme: qrPresets[0].id }));
  assert.notEqual(results[0], createDoodleQr(link, { ...options, theme: qrPresets[0].id, seed: 7 }));
  for (const svg of results) {
    assert.equal((svg.match(/data-doodle=/g) ?? []).length, 4);
    assert.doesNotMatch(svg, /translate\(0 500\)/);
  }
});

test('symbols keep their proportions in wide and tall slots', () => {
  const { drawQrMotif } = loadQrSource('./qr-artwork.ts');
  for (const motif of new Set(qrPresets.flatMap(preset => [...preset.motifs]))) {
    const wide = drawQrMotif(0, 0, 40, 10, motif, () => 0.5, '#111111');
    const tall = drawQrMotif(0, 0, 10, 40, motif, () => 0.5, '#111111');
    const extent = art => {
      const points = art.strokes.flatMap(stroke => stroke.points);
      return [Math.max(...points.map(p => p[0])) - Math.min(...points.map(p => p[0])), Math.max(...points.map(p => p[1])) - Math.min(...points.map(p => p[1]))];
    };
    assert.deepEqual(extent(wide).map(n => n.toFixed(6)), extent(tall).map(n => n.toFixed(6)), motif);
  }
});

test('each preset and shuffle decodes the complete real event URL at phone and export sizes', async () => {
  for (const preset of qrPresets) for (const seed of [1,7,42]) {
    const svg = createDoodleQr(link, { ...options, theme: preset.id, seed });
    for (const width of [360,960]) assert.equal(await decode(svg,width),link,`${preset.id}/${seed}/${width}`);
  }
});

test('short, multi-block, mixed-length-block and 16-bit-count payloads retain bytes and correction reserve', async () => {
  for (const text of ['67','hello world','https://h.ph/e/a',link,'x'.repeat(100),'🎉 Manila café / '.repeat(7),'x'.repeat(240),'x'.repeat(MAX_DOODLE_BYTES)]) {
    const svg = createDoodleQr(text,options), version = Number(svg.match(/data-art-version="(\d+)"/)[1]);
    const mask = Number(svg.match(/data-art-mask="(\d+)"/)[1]), count = version*4+17;
    const base = QRCode.create([{data:text,mode:'byte'}],{version,errorCorrectionLevel:'L',maskPattern:mask});
    const {data,info} = await raster(svg,960), cell=960/(count+8);
    const pixel=(x,y)=>data[(Math.floor(y)*info.width+Math.floor(x))*info.channels];
    const dark=(r,c)=>pixel((c+4.5)*cell,(r+4.5)*cell)<128;
    for(let r=0;r<count;r++)for(let c=0;c<count;c++)if(base.modules.isReserved(r,c))assert.equal(dark(r,c),!!base.modules.get(r,c),`protected pattern ${version}/${r}/${c}`);
    const bits=[]; let up=true;
    for(let c=count-1;c>0;c-=2){if(c===6)c--;for(let i=0;i<count;i++){const r=up?count-1-i:i;for(let j=0;j<2;j++)if(!base.modules.isReserved(r,c-j)){const k=c-j;const masks=[(r+k)%2===0,r%2===0,k%3===0,(r+k)%3===0,(Math.floor(r/2)+Math.floor(k/3))%2===0,(r*k)%2+(r*k)%3===0,((r*k)%2+(r*k)%3)%2===0,((r+k)%2+(r*k)%3)%2===0];bits.push(Number(dark(r,k)!==masks[mask]));}}up=!up;}
    const words=Array.from({length:Math.floor(bits.length/8)},(_,i)=>bits.slice(i*8,i*8+8).reduce((n,b)=>(n<<1)|b,0));
    const blocks=EC.getBlocksCount(version,level),ec=EC.getTotalCodewordsCount(version,level)/blocks,totalData=words.length-ec*blocks;
    const small=blocks-words.length%blocks,shortLength=Math.floor(totalData/blocks);
    const sizes=Array.from({length:blocks},(_,b)=>shortLength+Number(b>=small));
    const parts=sizes.map(()=>[]);let cursor=0;
    for(let i=0;i<Math.max(...sizes);i++)for(let b=0;b<blocks;b++)if(i<sizes[b])parts[b].push(words[cursor++]);
    const raw=parts.flat(), number=(start,length)=>Array.from({length},(_,i)=>(raw[Math.floor((start+i)/8)]>>(7-(start+i)%8))&1).reduce((n,b)=>(n<<1)|b,0);
    const bytes=[...new TextEncoder().encode(text)], countBits=version<10?8:16,header=4+countBits;
    assert.equal(number(0,4),4);assert.equal(number(4,countBits),bytes.length);
    assert.deepEqual(bytes.map((_,i)=>number(header+i*8,8)),bytes);
    assert.equal(number(header+bytes.length*8,4),0,'terminator must precede all art');
    for(let b=0;b<blocks;b++){
      const expected=new ReedSolomon(ec).encode(new Uint8Array(parts[b]));
      const errors=expected.reduce((n,byte,i)=>n+Number(byte!==words[totalData+i*blocks+b]),0);
      assert.ok(errors<=Math.floor(ec/2)-3,`block ${b} exceeds art budget: ${errors}`);
    }
    const border=Math.floor(cell*4);
    for(let y=0;y<960;y++)for(let x=0;x<960;x++)if(x<border||y<border||x>=960-border||y>=960-border)assert.equal(pixel(x,y),255,'quiet zone');
    assert.equal(await decode(svg,960),text,`version ${version} complete payload`);
  }
});

test('invalid, overlong and low-contrast art input fails rather than silently changing payload', () => {
  for(const text of ['   ','x'.repeat(MAX_DOODLE_BYTES+1)])assert.throws(()=>createDoodleQr(text,options));
  for(const patch of [{foreground:'#000000" onload="x'},{foreground:'#cccccc'},{background:'#000000'},{size:0},{theme:'missing'}])assert.throws(()=>createDoodleQr(link,{...options,...patch}));
});
