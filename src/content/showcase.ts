import type { Project } from '../types/portfolio';

// Local preview only. Large media stays outside version control.
export const waterPurifierProject: Project = {
  slug: 'water-purifier',
  title: '净水器',
  category: 'film',
  year: '',
  client: '',
  roles: ['策划', '编导', '拍摄', '剪辑', '调色', '账号运营'],
  featured: true,
  order: 1,
  aspectRatio: '9/16',
  poster: 'projects/water-purifier/poster.webp',
  previewSrc: 'projects/water-purifier/preview.mp4',
  fullSrc: 'projects/water-purifier/full-hevc.mp4',
  fallbackSrc: 'projects/water-purifier/full-h264.mp4',
};

export const waterPurifierCopy = {
  label: 'COMMERCIAL FILM / 商业短视频',
  description: '从创意到成片，把控每一帧的质感。',
  durationLabel: '01:16',
};
