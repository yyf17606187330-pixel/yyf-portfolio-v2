import { describe, expect, it } from 'vitest';
import { categories } from './categories';
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

  it('provides twelve projects with exactly three featured items', () => {
    expect(projects).toHaveLength(12);
    expect(projects.filter((project) => project.featured)).toHaveLength(3);
  });

  it('uses unique slugs and orders for stable rendering', () => {
    expect(new Set(projects.map((project) => project.slug)).size).toBe(projects.length);
    expect(new Set(projects.map((project) => project.order)).size).toBe(projects.length);
  });
});
