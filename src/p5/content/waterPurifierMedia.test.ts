import { describe, expect, it } from 'vitest';
import { resolveMediaUrl } from '../lib/media';
import { waterPurifierMediaDeck } from './waterPurifierMedia';

const sha256Pattern = /^[0-9A-F]{64}$/;

describe('waterPurifierMediaDeck', () => {
  it('keeps the five supplied source files in the approved display order', () => {
    expect(waterPurifierMediaDeck.map((item) => item.displayOrder)).toEqual([1, 2, 3, 4, 5]);
    expect(waterPurifierMediaDeck.map((item) => item.slug)).toEqual([
      'g7s-multi-temperature',
      'summer-ice-drinks',
      'ice-workshop-demo',
      'modular-ice-system',
      'g7s-cabinet-brew',
    ]);
    expect(waterPurifierMediaDeck.map((item) => item.source.fileName)).toEqual([
      '2025-12-15 161055(1).mov',
      '2025-08-06.mov',
      '2026-03-27 142804(1).mp4',
      '2025-08-18 192622(1).mp4',
      '2025-10-23 154547(1).mp4',
    ]);
  });

  it('describes eight-second silent H.264 previews and matching browser media paths', () => {
    for (const item of waterPurifierMediaDeck) {
      expect(item.preview.endSeconds - item.preview.startSeconds).toBe(8);
      expect(item.preview.asset).toMatchObject({
        durationSeconds: 8,
        width: 1080,
        height: 1920,
        framesPerSecond: 30,
        videoCodec: 'h264',
        videoProfile: 'High',
        pixelFormat: 'yuv420p',
        audioCodec: null,
      });
      expect(resolveMediaUrl(item.preview.asset.path)).toBe(`/media/${item.preview.asset.path}`);
      expect(item.preview.asset.path).toBe(
        `projects/water-purifier/deck/${item.slug}/preview-h264.mp4`,
      );
    }
  });

  it('keeps H.264/AAC full files and WebP posters at the original 9:16 dimensions', () => {
    for (const item of waterPurifierMediaDeck) {
      expect(item.aspectRatio).toBe('9/16');
      expect(item.full).toMatchObject({
        width: 1080,
        height: 1920,
        framesPerSecond: 30,
        videoCodec: 'h264',
        videoProfile: 'High',
        pixelFormat: 'yuv420p',
        audioCodec: 'aac',
      });
      expect(item.poster.asset).toMatchObject({
        width: 1080,
        height: 1920,
        codec: 'webp',
        pixelFormat: 'yuv420p',
      });
      expect(item.full.path).toBe(`projects/water-purifier/deck/${item.slug}/full-h264.mp4`);
      expect(item.poster.asset.path).toBe(
        `projects/water-purifier/deck/${item.slug}/poster-card.webp`,
      );
    }
  });

  it('records sizes and SHA256 values without committing machine-specific source paths', () => {
    for (const item of waterPurifierMediaDeck) {
      expect(item.source.fileName).not.toMatch(/[\\/:]/);
      expect(item.source.bytes).toBeGreaterThan(0);
      expect(item.source.sha256).toMatch(sha256Pattern);

      for (const asset of [item.preview.asset, item.poster.asset, item.full]) {
        expect(asset.path).not.toMatch(/^[\\/]|^[A-Za-z]:/);
        expect(asset.bytes).toBeGreaterThan(0);
        expect(asset.sha256).toMatch(sha256Pattern);
      }
    }
  });
});
