import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import sharp from "sharp";
import jsQR from "jsqr";

const require = createRequire(import.meta.url), cache = new Map();
export function loadQrSource(path) {
  const url = new URL(path, import.meta.url);
  if (cache.has(url.href)) return cache.get(url.href);
  const { outputText } = ts.transpileModule(readFileSync(url, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  const exports = {};
  cache.set(url.href, exports);
  runInNewContext(outputText, { exports, URL, TextEncoder, Uint8Array, require: name => name.startsWith("./") ? loadQrSource(new URL(name + ".ts", url).href) : require(name) });
  return exports;
}
export async function raster(svg, width) {
  return sharp(Buffer.from(svg)).resize({ width }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}
export async function decode(svg, width) {
  const { data, info } = await raster(svg, width);
  return jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data;
}
