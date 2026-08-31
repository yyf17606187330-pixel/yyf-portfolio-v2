import type { Project } from '../types/portfolio';

// Local preview only. Large media stays outside version control.
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
  label: 'COMMERCIAL FILM / 商业短视频',
  description: '从人群分析决定题材，再把内容制作、投放复盘与直播优化连成一条闭环。',
  durationLabel: '01:16',
  contentTitle: '商业内容闭环',
  contentSummary: '人群分析 · 制作 · 投放复盘',
  statusLabel: '已完成商业投放',
  process: [
    {
      stage: '项目背景',
      title: '从零搭起直播间骨架',
      body: '项目起步时直播间尚未形成稳定的运营基础。我从场布、采购和成本控制入手，完成灯光器材、软装布局、采集传输信号及线上物料准备，并参与主播面试，让直播和内容生产具备可持续执行的基础。',
    },
    {
      stage: '人群与题材',
      title: '用人群分析确定饮水安全题材',
      body: '围绕饮水安全、饮水便捷、桌面陈设与品质生活需求拆分目标人群，并将饮水安全确立为重点题材；再根据产品优势设计痛点开头、内容卖点与拍摄方式。',
    },
    {
      stage: '制作与投放',
      title: '把制作、投放与复盘连成闭环',
      body: '围绕千川素材完成策划、编导、拍摄、剪辑、调色、发布投放与数据复盘，并持续压缩文案信息密度、优化主播话术。单条素材单月最高投放消耗 45 万元，投产比 1:5。',
    },
    {
      stage: '职责复盘',
      title: '从内容结果反推直播表达',
      body: '在持续迭代素材和直播表达后，直播间 UV 价值从 0 提升至约 6 元，BPM 约 6000。项目中我负责内容链路与账号运营，并承担直播间基础搭建和协作推进。',
    },
  ],
};
