import type { FluidEffectConfig, SiteProfile } from '../types/portfolio';

export const profile: SiteProfile = {
  name: '杨玉峰',
  latinName: 'YANG YUFENG',
  positioning: '影像导演 × AI 视觉创作者',
  bio: '待补充个人简介',
  portrait: '',
  email: '待补充邮箱',
  wechatQr: '',
};

export const fluidEffectConfig: FluidEffectConfig = {
  colors: ['#D7D4CC', '#8D8B84', '#34332F'],
  intensity: 0.45,
  enabledRegions: ['intro', 'hero', 'menu'],
  fallback: 'static-gradient',
};
