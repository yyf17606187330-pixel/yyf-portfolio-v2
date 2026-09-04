export type AiVideoOrientation = 'landscape' | 'portrait';

export interface AiVideoCapabilityItem {
  id: string;
  label: string;
  title: string;
  description: string;
  orientation: AiVideoOrientation;
  aspectRatio: '16/9' | '9/16' | null;
  poster: string | null;
  previewSrc: string | null;
  fullSrc: string | null;
}

export const aiVideoCapabilityItems: readonly AiVideoCapabilityItem[] = [
  {
    id: 'ai-video-landscape',
    label: 'AI VIDEO / LANDSCAPE',
    title: '横版 AI 视频',
    description: '横版 AI 作品，作为独立于工作经历的能力展示。',
    orientation: 'landscape',
    aspectRatio: '16/9',
    poster: 'ai-video/landscape-poster.webp',
    previewSrc: 'ai-video/landscape-preview-h264.mp4',
    fullSrc: 'ai-video/landscape-full-h264.mp4',
  },
  {
    id: 'ai-video-portrait',
    label: 'AI VIDEO / PORTRAIT',
    title: '竖版复古拼贴',
    description: '竖版复古拼贴作品，作为独立于工作经历的能力展示。',
    orientation: 'portrait',
    aspectRatio: '9/16',
    poster: null,
    previewSrc: null,
    fullSrc: null,
  },
  {
    id: 'ai-video-reserved-03',
    label: 'AI VIDEO / RESERVED 03',
    title: '待接入 AI 作品 03',
    description: '预留给下一支真实 AI 作品，不混入其他项目素材。',
    orientation: 'landscape',
    aspectRatio: null,
    poster: null,
    previewSrc: null,
    fullSrc: null,
  },
  {
    id: 'ai-video-reserved-04',
    label: 'AI VIDEO / RESERVED 04',
    title: '待接入 AI 作品 04',
    description: '预留给下一支真实 AI 作品，不混入其他项目素材。',
    orientation: 'portrait',
    aspectRatio: null,
    poster: null,
    previewSrc: null,
    fullSrc: null,
  },
];
