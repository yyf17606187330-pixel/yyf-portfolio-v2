import type { ProjectCategory } from '../types/portfolio';

export interface Category {
  id: ProjectCategory;
  label: string;
}

export interface Capability {
  id: 'content-operations' | 'commercial-video' | 'ai-assisted-visuals';
  label: string;
}

export const categories: Category[] = [
  { id: 'film', label: 'FILM / 影像' },
  { id: 'ai-video', label: 'AI VIDEO / AI视频' },
  { id: 'photography', label: 'PHOTOGRAPHY / 摄影' },
  { id: 'design-interactive', label: 'DESIGN + INTERACTIVE / 设计与交互' },
];

export const capabilities: Capability[] = [
  { id: 'content-operations', label: '新媒体内容与账号运营' },
  { id: 'commercial-video', label: '商业视频与编导拍剪' },
  { id: 'ai-assisted-visuals', label: 'AI 辅助创作与视觉实验' },
];

export function getCategoryLabel(category: ProjectCategory): string {
  return categories.find((candidate) => candidate.id === category)?.label ?? category;
}
