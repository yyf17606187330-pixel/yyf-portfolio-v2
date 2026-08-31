import type { ProjectCategory } from '../types/portfolio';

export interface ColorGradingWorkItem {
  slug: string;
  title: string;
  category: ProjectCategory;
  categoryLabel: '调色练习';
  roles: readonly string[];
  description: string;
  poster: string;
  previewSrc: string;
  aspectRatio: '16/9';
  durationLabel: string;
}

export interface ColorGradingWorkGroup {
  id: string;
  chapter: '02.02';
  label: string;
  title: string;
  intro: string;
  items: readonly ColorGradingWorkItem[];
}

export const colorGradingWorkGroup: ColorGradingWorkGroup = {
  id: 'color-grading-02-02',
  chapter: '02.02',
  label: '精选影像 · 第二辑',
  title: '调色练习',
  intro: '四支素材围绕不同场景与色彩方向进行调色练习。',
  items: [
    {
      slug: 'grading-skate-workshop',
      title: '滑板工坊',
      category: 'film',
      categoryLabel: '调色练习',
      roles: ['调色'],
      description: '滑板工坊场景，围绕暗调黄绿氛围完成调色练习。',
      poster: 'projects/long-form/grading-skate-workshop/poster-card.webp',
      previewSrc: 'projects/long-form/grading-skate-workshop/preview-h264.mp4',
      aspectRatio: '16/9',
      durationLabel: '00:05',
    },
    {
      slug: 'grading-percussion',
      title: '民族器乐',
      category: 'film',
      categoryLabel: '调色练习',
      roles: ['调色'],
      description: '民族器乐场景，围绕高饱和橙青关系完成调色练习。',
      poster: 'projects/long-form/grading-percussion/poster-card.webp',
      previewSrc: 'projects/long-form/grading-percussion/preview-h264.mp4',
      aspectRatio: '16/9',
      durationLabel: '00:03',
    },
    {
      slug: 'grading-dance',
      title: '民族舞蹈',
      category: 'film',
      categoryLabel: '调色练习',
      roles: ['调色'],
      description: '民族舞蹈场景，围绕暖肤色与高光控制完成调色练习。',
      poster: 'projects/long-form/grading-dance/poster-card.webp',
      previewSrc: 'projects/long-form/grading-dance/preview-h264.mp4',
      aspectRatio: '16/9',
      durationLabel: '00:06',
    },
    {
      slug: 'grading-winter-aerial',
      title: '冬日航拍',
      category: 'film',
      categoryLabel: '调色练习',
      roles: ['调色'],
      description: '冬日航拍场景，围绕冷蓝色调完成收尾调色练习。',
      poster: 'projects/long-form/grading-winter-aerial/poster-card.webp',
      previewSrc: 'projects/long-form/grading-winter-aerial/preview-h264.mp4',
      aspectRatio: '16/9',
      durationLabel: '00:09',
    },
  ],
};
