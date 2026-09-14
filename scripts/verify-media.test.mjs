import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { verifyMediaAsset } from './verify-media.mjs';

const mp4 = Buffer.from('000000186674797069736f6d0000020069736f6d6d703432', 'hex');
const pointerFor = (bytes) => [
  'version https://git-lfs.github.com/spec/v1',
  `oid sha256:${createHash('sha256').update(bytes).digest('hex')}`,
  `size ${bytes.length}`,
  '',
].join('\n');
let fixtureDirectory;

beforeEach(async () => {
  fixtureDirectory = await mkdtemp(join(tmpdir(), 'yyf-media-check-'));
});

afterEach(async () => {
  const target = resolve(fixtureDirectory);
  if (!target.startsWith(resolve(tmpdir()) + sep) || !target.includes('yyf-media-check-')) {
    throw new Error('Invalid temporary fixture directory');
  }
  await rm(target, { recursive: true, force: true });
});

test('accepts an MP4 whose bytes match its indexed LFS pointer', async () => {
  const file = join(fixtureDirectory, 'full.mp4');
  await writeFile(file, mp4);
  await verifyMediaAsset(file, 'full.mp4', pointerFor(mp4));
});

test('rejects an existing MP4 that is still an LFS pointer', async () => {
  const file = join(fixtureDirectory, 'full.mp4');
  await writeFile(file, pointerFor(mp4));
  await assert.rejects(verifyMediaAsset(file, 'full.mp4', pointerFor(mp4)), /LFS pointer/);
});

test('rejects an HTML response saved under a video filename', async () => {
  const file = join(fixtureDirectory, 'full.mp4');
  await writeFile(file, '<html>media unavailable</html>');
  await assert.rejects(verifyMediaAsset(file, 'full.mp4', pointerFor(mp4)), /MP4 header/);
});

test('rejects a truncated MP4 even when its header is intact', async () => {
  const file = join(fixtureDirectory, 'full.mp4');
  await writeFile(file, mp4.subarray(0, 16));
  await assert.rejects(verifyMediaAsset(file, 'full.mp4', pointerFor(mp4)), /LFS size/);
});

test('rejects changed MP4 bytes even when the filename, header and size match', async () => {
  const file = join(fixtureDirectory, 'full.mp4');
  const changed = Buffer.from(mp4);
  changed[changed.length - 1] ^= 1;
  await writeFile(file, changed);
  await assert.rejects(verifyMediaAsset(file, 'full.mp4', pointerFor(mp4)), /LFS SHA-256/);
});

test('requires an indexed LFS pointer for a tracked MP4', async () => {
  const file = join(fixtureDirectory, 'full.mp4');
  await writeFile(file, mp4);
  await assert.rejects(verifyMediaAsset(file, 'full.mp4', ''), /indexed LFS pointer/);
});

test('rejects a missing media file', async () => {
  await assert.rejects(
    verifyMediaAsset(join(fixtureDirectory, 'missing.mp4'), 'missing.mp4', pointerFor(mp4)),
    /ENOENT/,
  );
});

test('accepts a WebP header and rejects a text placeholder', async () => {
  const file = join(fixtureDirectory, 'poster.webp');
  await writeFile(file, Buffer.from('RIFF\x04\x00\x00\x00WEBP'));
  await verifyMediaAsset(file, 'poster.webp');
  await writeFile(file, 'poster pending');
  await assert.rejects(verifyMediaAsset(file, 'poster.webp'), /WebP header/);
});
