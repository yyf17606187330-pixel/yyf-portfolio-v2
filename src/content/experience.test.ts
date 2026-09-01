import { describe, expect, it } from 'vitest';
import { aboutContent } from './about';
import { experienceContent } from './experience';

describe('experience content', () => {
  it('provides a long-form structure that can be trimmed later', () => {
    expect(experienceContent.sectionNumber).toBe('03');
    expect(experienceContent.experiences).toHaveLength(3);
    expect(experienceContent.experiences.map((experience) => experience.id)).toEqual([
      'xinghai',
      'zhepin',
      'kuwo',
    ]);
    expect(experienceContent.topMetrics).toBeDefined();

    for (const experience of experienceContent.experiences) {
      expect(experience.company).toBeTruthy();
      expect(experience.role).toBeTruthy();
      expect(experience.displayPeriod).toBeTruthy();
      expect(experience.scope).toBeTruthy();
      expect(experience.summaries.length).toBeGreaterThanOrEqual(2);
      expect(experience.detailBlocks.length).toBeGreaterThanOrEqual(3);
      expect(experience.detailBlocks.length).toBeLessThanOrEqual(6);
      expect(experience.metrics.length).toBeGreaterThan(0);

      for (const block of experience.detailBlocks) {
        expect(block.kicker).toBeTruthy();
        expect(block.title).toBeTruthy();
        expect(block.body).toBeTruthy();
      }
    }
  });

  it('keeps confirmed facts and paired metrics in their own entries', () => {
    const [xinghai, zepin, biyunquan] = experienceContent.experiences;

    expect(xinghai.company).toBe('兴海集团');
    expect(xinghai.displayPeriod).toBe('2025.11—至今');
    expect(xinghai.metrics.some((metric) => metric.value === '约6人')).toBe(true);

    expect(zepin.company).toBe('广州哲品家居用品有限公司');
    expect(zepin.displayPeriod).toBe('2025 · 短期项目');
    expect(zepin.metrics.some((metric) => metric.value.includes('80万元') && metric.value.includes('1:7'))).toBe(true);
    expect(zepin.publicNotes.join('')).not.toMatch(/四个月|2025\.07|2025\.11/);

    expect(biyunquan.brand).toBe('碧云泉官方旗舰店');
    expect(biyunquan.displayPeriod).toBe('2022.10—2025.06');
    expect(biyunquan.metrics.some((metric) => metric.value.includes('45万元') && metric.value.includes('1:5'))).toBe(true);
    expect(biyunquan.metrics.some((metric) => metric.value.includes('约6元') && metric.value.includes('BPM约6000'))).toBe(true);
    expect(biyunquan.summaries.join('')).not.toMatch(/8\s*个月/);
  });

  it('keeps About facts aligned with the long-form source', () => {
    const aboutText = [...aboutContent.paragraphs, ...aboutContent.notes, ...aboutContent.outcomes.map((outcome) => outcome.description)].join('');

    expect(aboutText).toContain('2022.10—2025.06');
    expect(aboutText).toContain('碧云泉官方旗舰店');
    expect(aboutText).toContain('0 提升至约 6 元');
    expect(aboutText).toContain('BPM 约 6000');
    expect(aboutText).not.toMatch(/8\s*个月/);
  });
});
