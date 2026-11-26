// The World in One Day — 26 November 2026 (Node 22, standard library only).
// The entry is one image: entry.png, a newspaper front page composed from the day's
// real headlines (see frontpage.html, the page it was rendered from). This program
// checks the image and hands it in by copying it to /output/entry.png, exactly the
// bytes the judge sees. The gate takes a whole PNG or JPEG of at most 1 MiB and
// 1024 by 1024 pixels.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { closeSync, copyFileSync, mkdirSync, openSync, readSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const src = join(here, 'entry.png');

const info = statSync(src);
if (info.size > 1024 * 1024) {
  throw new Error(`entry.png is ${info.size} bytes, over the 1 MiB gate cap`);
}

// The gate also caps the image at 1024 by 1024 pixels. A PNG stores its width
// and height in the IHDR chunk: bytes 16-19 are the width, 20-23 the height,
// both big-endian. Refuse anything larger instead of handing in a bad image.
const head = Buffer.alloc(24);
const fd = openSync(src, 'r');
readSync(fd, head, 0, 24, 0);
closeSync(fd);
const width = head.readUInt32BE(16);
const height = head.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 gate cap`);
}

mkdirSync(out, { recursive: true });
copyFileSync(src, join(out, 'entry.png'));
