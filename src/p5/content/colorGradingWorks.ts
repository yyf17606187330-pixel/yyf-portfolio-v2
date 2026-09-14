import type { ProjectCategory } from '../types/portfolio';

export interface ColorGradingWorkItem {
  slug: string;
  title: string;
  category: ProjectCategory;
  categoryLabel: '调色作品';
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
  title: '调色作品',
  intro: '通过四组不同场景，展示暗调氛围、橙青对比、肤色处理与高光控制。',
  items: [
    {
      slug: 'grading-skate-workshop',
      title: '滑板工坊',
      category: 'film',
      categoryLabel: '调色作品',
      roles: ['调色'],
      description: '以暗调黄绿处理滑板工坊画面，建立空间氛围。',
      poster: 'projects/long-form/grading-skate-workshop/poster-card.webp',
      previewSrc: 'projects/long-form/grading-skate-workshop/preview-h264.mp4',
      aspectRatio: '16/9',
      durationLabel: '00:05',
    },
    {
      slug: 'grading-percussion',
      title: '民族器乐',
      category: 'film',
      categoryLabel: '调色作品',
      roles: ['调色'],
      description: '以高饱和橙青处理民族器乐画面，突出冷暖对比。',
      poster: 'projects/long-form/grading-percussion/poster-card.webp',
      previewSrc: 'projects/long-form/grading-percussion/preview-h264.mp4',
      aspectRatio: '16/9',
      durationLabel: '00:03',
    },
    {
      slug: 'grading-dance',
      title: '民族舞蹈',
      category: 'film',
      categoryLabel: '调色作品',
      roles: ['调色'],
      description: '处理民族舞蹈画面的暖肤色与高光，平衡人物和环境的明暗关系。',
      poster: 'projects/long-form/grading-dance/poster-card.webp',
      previewSrc: 'projects/long-form/grading-dance/preview-h264.mp4',
      aspectRatio: '16/9',
      durationLabel: '00:06',
    },
    {
      slug: 'grading-winter-aerial',
      title: '冬日航拍',
      category: 'film',
      categoryLabel: '调色作品',
      roles: ['调色'],
      description: '用冷蓝色调统一冬日航拍画面的整体观感。',
      poster: 'projects/long-form/grading-winter-aerial/poster-card.webp',
      previewSrc: 'projects/long-form/grading-winter-aerial/preview-h264.mp4',
      aspectRatio: '16/9',
      durationLabel: '00:09',
    },
  ],
};
