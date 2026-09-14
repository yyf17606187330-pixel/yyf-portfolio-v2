import type { Project } from '../types/portfolio';

// Approved web derivatives are tracked; MP4 files are restored through Git LFS.
export const waterPurifierProject: Project = {
  slug: 'water-purifier',
  title: '净水器',
  category: 'film',
  year: '2022.10—2025.06',
  client: '碧云泉官方旗舰店',
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
  label: '商业短视频',
  description: '从零搭建碧云泉直播间，围绕饮水需求制作短视频，并负责投放、账号运营与数据复盘。',
  durationLabel: '01:16',
  statusLabel: '已完成商业投放',
  results: [
    {
      title: '素材投放',
      body: '单条素材单月最高投放消耗 45 万元，投产比 1:5。',
    },
    {
      title: '直播间运营',
      body: '直播间 UV 价值从 0 提升至约 6 元，BPM 约 6000。',
    },
  ],
  process: [
    {
      stage: '直播搭建',
      title: '搭建可以开播的直播间',
      body: '负责场布、采购与成本控制，配置灯光器材、软装、采集传输信号和线上物料，并参与主播面试。',
    },
    {
      stage: '人群与题材',
      title: '以饮水安全切入产品卖点',
      body: '围绕饮水安全、便捷、桌面陈设和品质生活拆分人群，将饮水安全作为重点题材，再据产品优势设计痛点开头、内容卖点和拍摄方式。',
    },
    {
      stage: '制作与发布',
      title: '制作并投放千川素材',
      body: '负责策划、编导、拍摄、剪辑、调色与发布投放，持续复盘千川素材数据。',
    },
    {
      stage: '表达优化',
      title: '根据数据调整文案与主播话术',
      body: '根据投放反馈优化文案信息密度、调整主播话术，持续迭代素材和直播表达。',
    },
  ],
};
