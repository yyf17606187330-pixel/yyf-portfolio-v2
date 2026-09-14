import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { aiVideoCapabilityItems } from './aiVideoCapability';

describe('aiVideoCapabilityItems', () => {
  it('preserves the verified native format of each of the three works', () => {
    expect(aiVideoCapabilityItems.map((item) => [item.id, item.aspectRatio])).toEqual([
      ['ai-video-landscape', '16/9'],
      ['ai-video-portrait', '9/16'],
      ['ai-video-sports-tvc', '1472/632'],
    ]);
  });

  it('keeps each real work attached to its own poster, preview and player files', () => {
    const prefixes = ['landscape', 'collage', 'ski'];
    for (const [index, item] of aiVideoCapabilityItems.entries()) {
      expect(item.poster).toBe('ai-video/' + prefixes[index] + '-poster.webp');
      expect(item.previewSrc).toBe('ai-video/' + prefixes[index] + '-preview-h264.mp4');
      expect(item.fullSrc).toBe('ai-video/' + prefixes[index] + '-full-h264.mp4');
    }
    expect(aiVideoCapabilityItems.map((item) => item.title)).toEqual([
      '时间线｜AI 剧情样片', '复古拼贴影像', '产品 TVC｜运动场景样片',
    ]);
  });

  it('references existing distinct poster, preview and full-player media', () => {
    for (const item of aiVideoCapabilityItems) {
      expect(item.previewSrc).not.toBe(item.fullSrc);
      for (const path of [item.poster, item.previewSrc, item.fullSrc]) {
        expect(path).not.toBeNull();
        expect(existsSync(resolve(process.cwd(), 'public/media', path!))).toBe(true);
      }
    }
  });
});
