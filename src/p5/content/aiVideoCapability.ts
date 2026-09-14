export type AiVideoOrientation = 'landscape' | 'portrait';

export interface AiVideoCapabilityItem {
  id: string;
  label: string;
  title: string;
  description: string;
  orientation: AiVideoOrientation;
  aspectRatio: `${number}/${number}` | null;
  poster: string | null;
  previewSrc: string | null;
  fullSrc: string | null;
  featured?: boolean;
  result?: { value: string; label: string };
}

export const aiProductionContent = {
  title: 'AI 创作与内容生产',
  intro: '把脚本与分镜做成可剪辑的画面。独立完成参考图、分镜、画面生成、素材筛选与剪辑，持续调整生成结果，让镜头服务于原本的构想。',
  delivery: {
    label: '工作实践 · 兴海集团',
    title: '图片制作与资料交付',
    description: '将图像生成、画质处理和资料整理接入日常制作，减少部分素材搜索、补拍与后期工作，再将图片整理为 PDF 项目资料或 HTML 展示页面。',
    result: '约 1 周 → 3 天',
    resultLabel: '图片类交付周期',
  },
} as const;

export const aiVideoCapabilityItems: readonly AiVideoCapabilityItem[] = [
  {
    id: 'ai-video-landscape',
    label: 'AI 叙事 · 阶段样片',
    title: '时间线｜AI 剧情样片',
    description: '围绕人物与时间变化生成画面、组织镜头，当前展示已完成的剧情片段。',
    orientation: 'landscape',
    aspectRatio: '16/9',
    poster: 'ai-video/landscape-poster.webp',
    previewSrc: 'ai-video/landscape-preview-h264.mp4',
    fullSrc: 'ai-video/landscape-full-h264.mp4',
  },
  {
    id: 'ai-video-portrait',
    label: 'AI 影像 · 复古拼贴',
    title: '复古拼贴影像',
    description: '以人物剪影、撕纸边缘与纸张层叠组织画面，完成一段复古拼贴影像。',
    orientation: 'portrait',
    aspectRatio: '9/16',
    poster: 'ai-video/collage-poster.webp',
    previewSrc: 'ai-video/collage-preview-h264.mp4',
    fullSrc: 'ai-video/collage-full-h264.mp4',
  },
  {
    id: 'ai-video-sports-tvc',
    label: '自主创作 · TVC 概念样片',
    title: '产品 TVC｜运动场景样片',
    description: '为产品 TVC 设计滑雪、骑行、攀岩与产品主镜头，已完成约 30 秒滑雪场景样片。脚本、参考图、分镜、生成与剪辑均由我独立完成。',
    orientation: 'landscape',
    aspectRatio: '1472/632',
    poster: 'ai-video/ski-poster.webp',
    previewSrc: 'ai-video/ski-preview-h264.mp4',
    fullSrc: 'ai-video/ski-full-h264.mp4',
    featured: true,
    result: { value: '30 秒', label: '已完成的滑雪场景样片' },
  },
];
