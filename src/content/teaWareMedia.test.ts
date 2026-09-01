import { describe, expect, it } from 'vitest';
import { resolveMediaUrl } from '../lib/media';
import { teaWareMediaDeck } from './teaWareMedia';

const sha256Pattern = /^[0-9A-F]{64}$/;
const md5Pattern = /^[0-9a-f]{32}$/;

describe('teaWareMediaDeck', () => {
  it('keeps only three distinct cards while tracing all five supplied source files', () => {
    expect(teaWareMediaDeck.map((item) => item.displayOrder)).toEqual([1, 2, 3]);
    expect(teaWareMediaDeck.map((item) => item.slug)).toEqual([
      'portable-tea-box',
      'titanium-tea-pour',
      'titanium-set-breakdown',
    ]);

    const allSourceFiles = teaWareMediaDeck.flatMap((item) => [
      item.source.fileName,
      ...item.source.aliases.map((alias) => alias.fileName),
    ]);

    expect(allSourceFiles).toEqual([
      '2dd5adf34d21d7084354d521f2d9f32a_raw.mp4',
      '12.14阿峰合一4.MOV',
      '9c005ee7754f78289b96a06ac19f1681_raw.mp4',
      '12.14阿峰合一2.MOV',
      '12.14阿峰合一3.MOV',
    ]);
    expect(new Set(allSourceFiles).size).toBe(5);
  });

  it('records exact-stream duplicate aliases against their canonical MP4 source', () => {
    const portable = teaWareMediaDeck[0].source;
    const pouring = teaWareMediaDeck[1].source;
    const breakdown = teaWareMediaDeck[2].source;

    expect(portable.aliases[0]).toMatchObject({
      fileName: '12.14阿峰合一4.MOV',
      duplicateOf: portable.fileName,
      videoStreamMd5: portable.videoStreamMd5,
      audioStreamMd5: portable.audioStreamMd5,
    });
    expect(pouring.aliases[0]).toMatchObject({
      fileName: '12.14阿峰合一2.MOV',
      duplicateOf: pouring.fileName,
      videoStreamMd5: pouring.videoStreamMd5,
      audioStreamMd5: pouring.audioStreamMd5,
    });
    expect(breakdown.aliases).toEqual([]);
  });

  it('describes eight-second silent H.264 previews at the native vertical dimensions', () => {
    for (const item of teaWareMediaDeck) {
      expect(item.preview.endSeconds - item.preview.startSeconds).toBeCloseTo(8, 6);
      expect(item.aspectRatio).toBe('9/16');
      expect(item.frameTreatment.mode).toBe('none');
      expect(item.preview.asset).toMatchObject({
        durationSeconds: 8,
        width: 1080,
        height: 1920,
        framesPerSecond: 30,
        videoCodec: 'h264',
        videoProfile: 'High',
        pixelFormat: 'yuv420p',
        colorSpace: 'bt709',
        faststart: true,
        audioCodec: null,
        audioSampleRate: null,
        audioChannels: null,
      });
      expect(resolveMediaUrl(item.preview.asset.path)).toBe(`/media/${item.preview.asset.path}`);
      expect(item.preview.asset.path).toBe(
        `projects/tea-ware/deck/${item.slug}/preview-h264.mp4`,
      );
    }
  });

  it('keeps H.264/AAC full files and WebP posters under the tea-ware media root', () => {
    for (const item of teaWareMediaDeck) {
      expect(item.full).toMatchObject({
        width: 1080,
        height: 1920,
        framesPerSecond: 30,
        videoCodec: 'h264',
        videoProfile: 'High',
        pixelFormat: 'yuv420p',
        colorSpace: 'bt709',
        faststart: true,
        audioCodec: 'aac',
        audioSampleRate: 48000,
        audioChannels: 2,
      });
      expect(item.poster.asset).toMatchObject({
        width: 1080,
        height: 1920,
        codec: 'webp',
        pixelFormat: 'yuv420p',
      });
      expect(item.full.path).toBe(`projects/tea-ware/deck/${item.slug}/full-h264.mp4`);
      expect(item.poster.asset.path).toBe(
        `projects/tea-ware/deck/${item.slug}/poster-card.webp`,
      );
    }
  });

  it('records hashes and byte counts without machine-specific source paths', () => {
    for (const item of teaWareMediaDeck) {
      expect(item.source.fileName).not.toMatch(/[\\/:]/);
      expect(item.source.bytes).toBeGreaterThan(0);
      expect(item.source.sha256).toMatch(sha256Pattern);
      expect(item.source.videoStreamMd5).toMatch(md5Pattern);
      expect(item.source.audioStreamMd5).toMatch(md5Pattern);

      for (const alias of item.source.aliases) {
        expect(alias.fileName).not.toMatch(/[\\/:]/);
        expect(alias.bytes).toBeGreaterThan(0);
        expect(alias.sha256).toMatch(sha256Pattern);
        expect(alias.videoStreamMd5).toMatch(md5Pattern);
        expect(alias.audioStreamMd5).toMatch(md5Pattern);
      }

      for (const asset of [item.preview.asset, item.poster.asset, item.full]) {
        expect(asset.path).not.toMatch(/^[\\/]|^[A-Za-z]:/);
        expect(asset.bytes).toBeGreaterThan(0);
        expect(asset.sha256).toMatch(sha256Pattern);
      }
    }
  });
});
