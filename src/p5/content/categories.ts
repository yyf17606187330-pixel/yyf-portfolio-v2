import type { ProjectCategory } from '../types/portfolio';

export interface Category {
  id: ProjectCategory;
  label: string;
}

export const categories: Category[] = [
  { id: 'film', label: 'FILM / 影像' },
  { id: 'ai-video', label: 'AI VIDEO / AI视频' },
  { id: 'photography', label: 'PHOTOGRAPHY / 摄影' },
  { id: 'design-interactive', label: 'DESIGN + INTERACTIVE / 设计与交互' },
];

export function getCategoryLabel(category: ProjectCategory): string {
  return categories.find((candidate) => candidate.id === category)?.label ?? category;
}
