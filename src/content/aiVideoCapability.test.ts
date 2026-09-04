import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { aiVideoCapabilityItems } from './aiVideoCapability';

describe('aiVideoCapabilityItems', () => {
  it('keeps the independent AI video group to four reserved slots', () => {
    expect(aiVideoCapabilityItems).toHaveLength(4);
    expect(aiVideoCapabilityItems.slice(0, 2).map((item) => item.orientation)).toEqual([
      'landscape',
      'portrait',
    ]);
    expect(aiVideoCapabilityItems.slice(0, 2).map((item) => item.aspectRatio)).toEqual(['16/9', '9/16']);
    expect(aiVideoCapabilityItems.slice(2).every((item) => item.aspectRatio === null)).toBe(true);
  });

  it('keeps the supplied landscape preview and explicit empty reserved media slots', () => {
    expect(aiVideoCapabilityItems[0].previewSrc).toBe('ai-video/landscape-preview-h264.mp4');
    expect(aiVideoCapabilityItems[0].fullSrc).toBe('ai-video/landscape-full-h264.mp4');
    expect(aiVideoCapabilityItems[0].poster).toBe('ai-video/landscape-poster.webp');
    expect(aiVideoCapabilityItems.slice(1).every((item) => (
      item.poster === null && item.previewSrc === null && item.fullSrc === null
    )))
      .toBe(true);
    expect(aiVideoCapabilityItems.map((item) => item.title)).toEqual([
      '横版 AI 视频',
      '竖版复古拼贴',
      '待接入 AI 作品 03',
      '待接入 AI 作品 04',
    ]);
  });

  it('references checked-in poster, preview, and full-player media', () => {
    const landscape = aiVideoCapabilityItems[0];
    const mediaPaths = [landscape.poster, landscape.previewSrc, landscape.fullSrc];

    expect(landscape.previewSrc).not.toBe(landscape.fullSrc);
    for (const mediaPath of mediaPaths) {
      expect(mediaPath).not.toBeNull();
      expect(existsSync(resolve(process.cwd(), 'public/media', mediaPath!))).toBe(true);
    }
  });
});
