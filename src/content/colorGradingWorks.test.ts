import { describe, expect, it } from 'vitest';
import { resolveMediaUrl } from '../lib/media';
import { colorGradingWorkGroup } from './colorGradingWorks';

describe('colorGradingWorkGroup', () => {
  it('keeps the approved 02.02 group and four-film order', () => {
    expect(colorGradingWorkGroup).toMatchObject({
      id: 'color-grading-02-02',
      chapter: '02.02',
      label: '精选影像 · 第二辑',
      title: '调色练习',
    });
    expect(colorGradingWorkGroup.items.map((item) => item.slug)).toEqual([
      'grading-skate-workshop',
      'grading-percussion',
      'grading-dance',
      'grading-winter-aerial',
    ]);
    expect(colorGradingWorkGroup.items.map((item) => item.title)).toEqual([
      '滑板工坊',
      '民族器乐',
      '民族舞蹈',
      '冬日航拍',
    ]);
  });

  it('exposes only verified 16:9 preview metadata', () => {
    expect(colorGradingWorkGroup.items.map((item) => item.durationLabel)).toEqual([
      '00:05',
      '00:03',
      '00:06',
      '00:09',
    ]);
    expect(colorGradingWorkGroup.items.map((item) => resolveMediaUrl(item.poster))).toEqual([
      '/media/projects/long-form/grading-skate-workshop/poster-card.webp',
      '/media/projects/long-form/grading-percussion/poster-card.webp',
      '/media/projects/long-form/grading-dance/poster-card.webp',
      '/media/projects/long-form/grading-winter-aerial/poster-card.webp',
    ]);
    expect(colorGradingWorkGroup.items.map((item) => resolveMediaUrl(item.previewSrc))).toEqual([
      '/media/projects/long-form/grading-skate-workshop/preview-h264.mp4',
      '/media/projects/long-form/grading-percussion/preview-h264.mp4',
      '/media/projects/long-form/grading-dance/preview-h264.mp4',
      '/media/projects/long-form/grading-winter-aerial/preview-h264.mp4',
    ]);
    expect(colorGradingWorkGroup.items.every((item) => (
      item.aspectRatio === '16/9'
      && item.category === 'film'
      && item.categoryLabel === '调色练习'
      && item.roles.length === 1
      && item.roles[0] === '调色'
    ))).toBe(true);
  });

  it('does not invent production duties, clients or commercial results', () => {
    const serializedGroup = JSON.stringify(colorGradingWorkGroup);

    expect(serializedGroup).not.toMatch(/拍摄|编导|制片|客户|品牌|投放|销售|万元|投产比/);
  });
});
