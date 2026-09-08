import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { open } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const lfsVersion = 'version https://git-lfs.github.com/spec/v1';

export async function verifyMediaAsset(filePath, assetName, indexPointer = '') {
  const handle = await open(filePath, 'r');
  let header;
  let bytes;
  try {
    bytes = (await handle.stat()).size;
    const buffer = Buffer.alloc(128);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    header = buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }

  if (header.toString('utf8').startsWith(lfsVersion)) {
    throw new Error('LFS pointer is still present; run git lfs pull to restore the media');
  }

  if (extname(assetName).toLowerCase() === '.webp') {
    if (header.toString('ascii', 0, 4) !== 'RIFF' || header.toString('ascii', 8, 12) !== 'WEBP') {
      throw new Error('WebP header is missing or invalid');
    }
    return;
  }

  if (header.toString('ascii', 4, 8) !== 'ftyp') {
    throw new Error('MP4 header is missing or invalid');
  }

  const oid = indexPointer.match(/^oid sha256:([a-f0-9]{64})$/m)?.[1];
  const expectedBytes = indexPointer.match(/^size (\d+)$/m)?.[1];
  if (!indexPointer.startsWith(lfsVersion) || !oid || !expectedBytes) {
    throw new Error('A valid indexed LFS pointer is required for tracked MP4 files');
  }
  if (bytes !== Number(expectedBytes)) {
    throw new Error(`LFS size mismatch: expected ${expectedBytes} bytes, found ${bytes}`);
  }

  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  if (hash.digest('hex') !== oid) {
    throw new Error('LFS SHA-256 mismatch: local video bytes differ from the indexed media');
  }
}

async function main() {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const tracked = execFileSync('git', ['ls-files', '-z', '--', 'public/media'], {
    cwd: repoRoot,
    encoding: 'utf8',
    windowsHide: true,
  }).split('\0').filter((path) => /\.(mp4|webp)$/i.test(path));
  if (tracked.length === 0) throw new Error('No tracked media found; use a complete Git checkout');

  let failures = 0;
  for (const asset of tracked) {
    try {
      const pointer = extname(asset) === '.mp4'
        ? execFileSync('git', ['show', `:${asset}`], {
          cwd: repoRoot,
          encoding: 'utf8',
          maxBuffer: 1024,
          windowsHide: true,
        })
        : '';
      await verifyMediaAsset(join(repoRoot, asset), asset, pointer);
    } catch (error) {
      failures += 1;
      console.error(`${asset}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const videos = tracked.filter((asset) => extname(asset) === '.mp4').length;
  console.log(`Media integrity: ${tracked.length - failures}/${tracked.length} passed (${videos} MP4, ${tracked.length - videos} WebP).`);
  if (failures > 0) {
    console.error('Restore missing LFS files before testing a preview. If an approved video was intentionally replaced, stage its new LFS pointer before checking.');
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
