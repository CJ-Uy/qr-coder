import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import qrcode from 'qrcode-generator';
import { createDoodleQr } from './doodle-qr.ts';

const require = createRequire(import.meta.url);
const sharp = createRequire(import.meta.resolve('next/package.json'))('sharp');
const options = { seed: 1, size: 360, foreground: '#0a0a0a', background: '#ffffff' };

test('randomization produces large creatures without the old stick figures', () => {
  assert.equal(require('qrcode-generator/package.json').version, '1.5.2');
  const first = createDoodleQr('67', options);
  assert.equal(first, createDoodleQr('67', options));
  assert.notEqual(first, createDoodleQr('67', { ...options, seed: 2 }));
  assert.ok((first.match(/data-doodle=/g)?.length ?? 0) >= 6);
  assert.doesNotMatch(first, /data-doodle="person"|r="0.42" fill="#0a0a0a"/);
});

function parity(data, length) {
  const exp = new Uint8Array(512), log = new Uint8Array(256);
  for (let i = 0, value = 1; i < 255; i++) {
    exp[i] = value; log[value] = i;
    value <<= 1;
    if (value & 256) value ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) exp[i] = exp[i-255];
  const multiply = (a,b) => a && b ? exp[log[a]+log[b]] : 0;
  let polynomial = [1];
  for (let i = 0; i < length; i++) {
    const next = Array(polynomial.length+1).fill(0);
    polynomial.forEach((value,j) => { next[j] ^= value; next[j+1] ^= multiply(value,exp[i]); });
    polynomial = next;
  }
  const result = new Uint8Array(length);
  for (const byte of data) {
    const factor = byte ^ result[0];
    result.copyWithin(0,1); result[length-1] = 0;
    for (let i = 0; i < length; i++) result[i] ^= multiply(polynomial[i+1],factor);
  }
  return result;
}

test('rasterized QR payloads survive custom padding and art stays inside the correction budget', async () => {
  const previousEncoding = qrcode.stringToBytes;
  for (const [text,size] of [['67',200],['hello world',360],['https://google.com',200],['https://google.com',360],['你好 👋',800],['a secret with thirty two letters',800]]) {
    for (const seed of [1,7,42]) {
      const svg = createDoodleQr(text, { ...options, size, seed });
      const version = Number(svg.match(/data-art-version="(\d+)"/)[1]);
      const count = version*4+17;
      const [dataWords,ecWords] = {3:[55,15],4:[80,20],5:[108,26]}[version];
      const cell = size/(count+8);
      const {data,info} = await sharp(Buffer.from(svg)).removeAlpha().raw().toBuffer({resolveWithObject:true});
      const pixel = (x,y) => data[(Math.floor(y)*info.width+Math.floor(x))*info.channels];
      const dark = (row,col) => pixel((col+4.5)*cell,(row+4.5)*cell) < 128;
      let format = 0;
      for (let i = 0; i < 15; i++) if (dark(i<6?i:i<8?i+1:count-15+i,8)) format |= 1<<i;
      const formatData = (format^0x5412)>>10;
      assert.equal(formatData>>3,1,'wrong correction level in the format bits');
      const mask = formatData&7;
      assert.equal(mask,Number(svg.match(/data-art-mask="(\d+)"/)[1]));
      const isMasked = (r,c) => [!((r+c)%2),!(r%2),!(c%3),!((r+c)%3),
        !((Math.floor(r/2)+Math.floor(c/3))%2),!((r*c)%2+(r*c)%3),
        !(((r*c)%2+(r*c)%3)%2),!(((r+c)%2+(r*c)%3)%2)][mask];
      const fixed = (r,c) => r===6||c===6||(r<9&&c<9)||(r<9&&c>=count-8)||
        (r>=count-8&&c<9)||(Math.abs(r-count+7)<=2&&Math.abs(c-count+7)<=2);
      const bits = [];
      let upward = true;
      for (let c = count-1; c > 0; c-=2) {
        if (c===6) c--;
        for (let i = 0; i < count; i++) {
          const r = upward?count-1-i:i;
          for (let j = 0; j < 2; j++) if (!fixed(r,c-j)) bits.push(Number(dark(r,c-j)!==isMasked(r,c-j)));
        }
        upward = !upward;
      }
      const number = (start,length) => bits.slice(start,start+length).reduce((value,bit)=>(value<<1)|bit,0);
      const encoded = [...new TextEncoder().encode(text)];
      assert.equal(number(0,4),4,'byte mode was lost');
      assert.equal(number(4,8),encoded.length,'padding leaked into the message length');
      assert.deepEqual(encoded.map((_,i)=>number(12+i*8,8)),encoded,'message was changed');
      assert.equal(number(12+encoded.length*8,4),0,'missing terminator before artwork padding');
      const words = Array.from({length:dataWords+ecWords},(_,i)=>number(i*8,8));
      const expected = parity(words.slice(0,dataWords),ecWords);
      const errors = expected.reduce((total,byte,i)=>total+Number(byte!==words[dataWords+i]),0);
      assert.ok(errors<=Math.floor(ecWords/2)-3,`art uses ${errors} correction words, version ${version}, seed ${seed}`);
      const border = Math.floor(cell*4);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (x<border||y<border||x>=size-border||y>=size-border) assert.equal(pixel(x,y),255);
        }
      }
      for (let x = Math.ceil(4*cell); x < Math.floor(11*cell); x++) assert.ok(pixel(x,4.5*cell)<32,'finder has a light seam');
      assert.equal(qrcode.stringToBytes,previousEncoding);
    }
  }
});

test('empty, oversized, and unsafe color input is rejected', () => {
  assert.throws(()=>createDoodleQr('   ',options),/short secret/);
  assert.throws(()=>createDoodleQr('hello',{...options,foreground:'#000000" onload="alert(1)'}),/hex colors/);
  assert.throws(()=>createDoodleQr('hello',{...options,background:'red'}),/hex colors/);
  assert.throws(()=>createDoodleQr('x'.repeat(33),options),/too long/);
  assert.throws(()=>createDoodleQr('👋'.repeat(9),options),/too long/);
});
