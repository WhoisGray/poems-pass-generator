#!/usr/bin/env node
// آیکون PNG ساده (پس‌زمینه‌ی بنفش با قلم پَرِ روشن) بدون وابستگی – فقط zlib.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'extension', 'icons');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function png(size) {
  const bg = [0x25, 0x1f, 0x36];      // پس‌زمینه‌ی تیره
  const feather = [0xc7, 0x92, 0xea]; // بنفش روشن
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // فیلتر None
    for (let x = 0; x < size; x++) {
      // قلم پَر: یک نوار قطری
      const onFeather = Math.abs((x - y)) < size * 0.16 && x > size * 0.18 && x < size * 0.82;
      const c = onFeather ? feather : bg;
      const o = y * (size * 3 + 1) + 1 + x * 3;
      raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2];
    }
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // bit depth 8, color type 2 (RGB)
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const s of [48, 128]) {
  writeFileSync(join(outDir, `icon${s}.png`), png(s));
  console.log(`✓ icon${s}.png`);
}
