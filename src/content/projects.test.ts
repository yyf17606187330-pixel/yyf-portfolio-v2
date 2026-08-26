import { describe, expect, it } from 'vitest';
import { capabilities, categories } from './categories';
import { contactDetails, profile } from './profile';
import { projects } from './projects';

describe('portfolio content', () => {
  it('keeps the approved category labels exact', () => {
    expect(categories).toEqual([
      { id: 'film', label: 'FILM / 影像' },
      { id: 'ai-video', label: 'AI VIDEO / AI视频' },
      { id: 'photography', label: 'PHOTOGRAPHY / 摄影' },
      { id: 'design-interactive', label: 'DESIGN + INTERACTIVE / 设计与交互' },
    ]);
  });

  it('keeps the confirmed positioning and capability baseline exact', () => {
    expect(profile.positioning).toBe('新媒体内容运营 × 影像创作者');
    expect(profile.bio).toBe(
      '我以新媒体运营为核心，独立完成选题策划、脚本编导、拍摄剪辑、发布投放与数据复盘。既懂内容怎么做，也懂内容为什么有效；AI 则是我提升创意和生产效率的一部分。',
    );
    expect(capabilities).toEqual([
      { id: 'content-operations', label: '新媒体内容与账号运营' },
      { id: 'commercial-video', label: '商业视频与编导拍剪' },
      { id: 'ai-assisted-visuals', label: 'AI 辅助创作与视觉实验' },
    ]);
    expect(contactDetails).toEqual({
      domesticEmail: '待用户单独确认公开邮箱',
      internationalEmail: '待用户单独确认公开邮箱',
      phone: '待用户单独确认公开电话',
      wechat: '待用户单独确认公开微信号',
    });
    expect(profile.email).toBe('待补充邮箱');
  });

  it('provides twelve projects with exactly three featured items', () => {
    expect(projects).toHaveLength(12);
    expect(projects.filter((project) => project.featured)).toHaveLength(3);
  });

  it('uses unique slugs and orders for stable rendering', () => {
    expect(new Set(projects.map((project) => project.slug)).size).toBe(projects.length);
    expect(new Set(projects.map((project) => project.order)).size).toBe(projects.length);
  });

  it('keeps unverified project facts and media explicitly marked as placeholders', () => {
    expect(projects.every((project) => project.title.startsWith('待补充'))).toBe(true);
    expect(projects.every((project) => project.year === '待补充年份')).toBe(true);
    expect(projects.every((project) => project.client === '待补充客户')).toBe(true);
    expect(projects.every((project) => project.roles.every((role) => role === '待补充职责'))).toBe(true);
    expect(projects.every((project) => !project.poster && !project.previewSrc && !project.fullSrc)).toBe(true);
  });
});
