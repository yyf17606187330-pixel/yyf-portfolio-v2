import type { FluidEffectConfig, SiteProfile } from '../types/portfolio';

export const contactDetails = {
  domesticEmail: '待用户单独确认公开邮箱',
  internationalEmail: '待用户单独确认公开邮箱',
  phone: '待用户单独确认公开电话',
  wechat: '待用户单独确认公开微信号',
} as const;

export const profile: SiteProfile = {
  name: '杨玉峰',
  latinName: 'YANG YUFENG',
  positioning: '新媒体内容运营 × 影像创作者',
  bio: '我以新媒体运营为核心，独立完成选题策划、脚本编导、拍摄剪辑、发布投放与数据复盘。既懂内容怎么做，也懂内容为什么有效；AI 则是我提升创意和生产效率的一部分。',
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
