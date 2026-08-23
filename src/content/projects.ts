import type { Project } from '../types/portfolio';

const placeholderProject = (
  slug: string,
  title: string,
  category: Project['category'],
  order: number,
  featured: boolean,
  aspectRatio: Project['aspectRatio'],
): Project => ({
  slug,
  title,
  category,
  year: '待补充年份',
  client: '待补充客户',
  roles: ['待补充职责'],
  featured,
  order,
  poster: '',
  previewSrc: '',
  fullSrc: '',
  aspectRatio,
});

export const projects: Project[] = [
  placeholderProject('film-01', '待补充影像项目 01', 'film', 1, true, '16/9'),
  placeholderProject('ai-video-01', '待补充 AI 视频项目 01', 'ai-video', 2, true, '16/9'),
  placeholderProject('photography-01', '待补充摄影项目 01', 'photography', 3, true, '4/5'),
  placeholderProject('film-02', '待补充影像项目 02', 'film', 4, false, '16/9'),
  placeholderProject('ai-video-02', '待补充 AI 视频项目 02', 'ai-video', 5, false, '16/9'),
  placeholderProject('photography-02', '待补充摄影项目 02', 'photography', 6, false, '4/5'),
  placeholderProject('design-interactive-01', '待补充设计与交互项目 01', 'design-interactive', 7, false, '1/1'),
  placeholderProject('film-03', '待补充影像项目 03', 'film', 8, false, '16/9'),
  placeholderProject('ai-video-03', '待补充 AI 视频项目 03', 'ai-video', 9, false, '9/16'),
  placeholderProject('photography-03', '待补充摄影项目 03', 'photography', 10, false, '3/2'),
  placeholderProject('design-interactive-02', '待补充设计与交互项目 02', 'design-interactive', 11, false, '1/1'),
  placeholderProject('design-interactive-03', '待补充设计与交互项目 03', 'design-interactive', 12, false, '16/9'),
];
