export interface AboutContent {
  sectionNumber: string;
  eyebrow: string;
  transition: {
    now: string;
    items: readonly { id: string; label: string; value: string; detail: string }[];
  };
  title: { primary: string; accent: string };
  capabilities: readonly string[];
  intro: string;
  paragraphs: readonly string[];
  signature: { name: string; role: string };
  capabilityGroups: readonly {
    id: string;
    title: string;
    description: string;
    tags: readonly string[];
    caption?: string;
    details?: readonly { title: string; body: string }[];
    practice?: { title: string; body: string };
    evidence?: { label: string; href: string };
  }[];
  outcomes: readonly { id: string; label: string; value: string; description: string }[];
  notes: readonly string[];
  worksLink: { label: string; href: string };
  portrait:
    | { type: 'image'; src: string; alt: string; position?: string }
    | {
      type: 'video';
      src: string;
      poster: string;
      alt: string;
      position?: string;
      hover?: { src: string; position?: string; startAt?: number };
    }
    | null;
  portraitPlaceholder: string;
}

export const aboutContent: AboutContent = {
  sectionNumber: '01',
  eyebrow: '关于我与工作方式',
  transition: {
    now: "NOW · SEP '26",
    items: [
      { id: 'position', label: 'POSITION', value: '新媒体内容运营', detail: '影像创作者' },
      { id: 'focus', label: 'FOCUS', value: '内容策略', detail: '人群分析 · 选题策划' },
      { id: 'production', label: 'PRODUCTION', value: '影像制作', detail: '编导 · 拍摄 · 剪辑 · 调色' },
      { id: 'method', label: 'METHOD', value: 'AI与协作', detail: 'AI应用 · 网站 · 多Agent协作' },
    ],
  },
  title: {
    primary: '能独立制作',
    accent: '也能统筹交付',
  },
  capabilities: ['内容策略', '编导拍摄', '剪辑调色', '运营投放', 'AI与协作'],
  intro:
    '主导剧情短片的编导、制片、拍摄与后期；在商业团队中，负责内容方向、制作推进与交付标准。',
  paragraphs: [
    '商业内容从受众需求和产品卖点出发，结合投放与直播数据调整选题、脚本和表达。',
    '旅拍后期由我从零散素材里组织叙事与节奏，完成剪辑、调色、配乐和人声处理。',
  ],
  signature: {
    name: '杨玉峰',
    role: '新媒体内容运营 × 影像创作者',
  },
  capabilityGroups: [
    {
      id: 'content-strategy',
      title: '内容策划',
      description: '从受众需求与产品卖点出发，确定选题、脚本和平台表达。',
      tags: ['人群分析', '选题策划', '脚本'],
      caption: 'STRATEGY',
      details: [
        { title: '先确定题材', body: '结合饮水安全、使用便利与生活品质等需求，选择有明确人群切入点的选题。' },
        { title: '再组织表达', body: '把产品卖点放进脚本与素材开头，结合投放和直播反馈调整文案信息密度。' },
      ],
      practice: { title: '碧云泉｜内容策划', body: '围绕饮水安全题材制作千川素材，持续复盘素材开头、产品卖点与拍摄方式。' },
      evidence: { label: '查看商业实践', href: '#experience-kuwo' },
    },
    {
      id: 'visual-production',
      title: '编导拍摄',
      description: '从脚本与制片推进到布景和现场拍摄，组织影像制作。',
      tags: ['编导', '制片', '布景', '拍摄'],
      caption: 'DIRECTION',
      details: [
        { title: '从脚本推进到现场', body: '在剧情短片中主导编导、制片与拍摄，并继续完成后期和成片输出。' },
        { title: '用场景表达产品', body: '在哲品茶具项目中负责布景与拍摄，用光影、细节和使用场景呈现产品质感。' },
      ],
      practice: { title: '剧情短片｜全流程制作', body: '负责编导、制片、拍摄、剪辑、调色与最终输出，完整作品已收录在影像区。' },
      evidence: { label: '查看影像作品', href: '#works' },
    },
    {
      id: 'post-production',
      title: '剪辑调色',
      description: '从素材中组织叙事与节奏，完成画面和声音的后期处理。',
      tags: ['剪辑', '调色', '配乐', '人声处理'],
      caption: 'POST / COLOR',
      details: [
        { title: '从素材里找到叙事', body: '筛选零散镜头，重新组织人物、事件与情绪，让内容形成连贯的观看节奏。' },
        { title: '让画面与声音配合', body: '完成达芬奇调色、配乐和人声处理，让色调、音乐与剪辑节奏共同服务于表达。' },
      ],
      practice: { title: '旅拍后期｜800+段素材', body: '完成素材筛选、剪辑、调色、配乐与人声处理；该项目未参与前期拍摄。' },
      evidence: { label: '查看作品集', href: '#works' },
    },
    {
      id: 'operations',
      title: '运营投放',
      description: '把内容发布、投放反馈与直播复盘连起来，持续调整表达。',
      tags: ['平台运营', '千川投放', '直播复盘'],
      caption: 'CONTENT OPS',
      details: [
        { title: '素材制作与投放', body: '制作并投放产品内容，复盘开头、卖点和拍摄方式，持续调整文案与信息密度。' },
        { title: '直播间搭建与复盘', body: '从零搭建碧云泉直播间，负责灯光场布、采集传输和线上物料，并迭代主播话术。' },
      ],
      practice: { title: '碧云泉｜内容与直播', body: '单条素材单月最高投放消耗45万元，投产比1:5；直播间UV价值从0提升至约6元。' },
      evidence: { label: '查看投放实践', href: '#experience-kuwo' },
    },
    {
      id: 'ai-production',
      title: 'AI 内容生产',
      description: '用 AI 完成图像生成与超分处理，并探索视频场景与叙事。',
      tags: ['图像生成', '超分处理', '视频样片'],
      caption: 'AI STUDIO',
      details: [
        { title: '围绕镜头生成影像', body: '独立完成参考图、分镜、画面生成、素材筛选与剪辑，实践剧情、拼贴和运动场景。' },
        { title: '接入日常内容交付', body: '在兴海项目中处理图像生成、画质提升与资料整理，输出PDF资料或HTML展示页面。' },
      ],
      practice: { title: '兴海｜图片类交付', body: '将图像生成、超分处理与资料整理连起来，图片类交付周期由约一周缩短至3天。' },
      evidence: { label: '查看 AI 实践', href: '#ai-video' },
    },
    {
      id: 'web-and-collaboration',
      title: '网站与协作',
      description: '组织网站视觉内容与前端实现，协调团队的制作和交付。',
      tags: ['视觉内容', '前端实现', '团队统筹'],
      caption: 'WEB / TEAM',
      details: [
        { title: '从实景到网站', body: '负责兴海颐华酒店官网的实景拍摄、后期修图、视觉内容组织与前端实现。' },
        { title: '组织团队交付', body: '统筹约6人跨职能团队，使用钉钉管理任务、进度、人效和交付规范。' },
      ],
      practice: { title: '兴海颐华酒店官网｜建设中', body: '已实现随鼠标响应的实景照片交互；整站仍在建设中，当前尚未公开。' },
      evidence: { label: '查看网站项目', href: '#web-projects' },
    },
  ],
  outcomes: [
    {
      id: 'commercial-content',
      label: '碧云泉素材',
      value: '45万元',
      description: '单条素材单月最高投放消耗，投产比 1:5。直播间 UV 价值从 0 提升至约 6 元，BPM 约 6000。',
    },
    {
      id: 'complete-creation',
      label: '剧情短片',
      value: '全流程',
      description: '主导编导、制片、拍摄、剪辑、调色与成片输出。',
    },
    {
      id: 'post-production',
      label: '旅拍后期素材',
      value: '800+',
      description: '完成素材筛选、节奏编排、剪辑、调色、配乐与人声处理。',
    },
  ],
  notes: [
    '碧云泉官方旗舰店任职周期：2022.10—2025.06；饮水安全题材来自人群需求分析。',
    '45 万元为单条素材单月最高投放消耗；UV 价值为单个访客对应的价值。',
    '800+ 为旅拍后期素材段数，不代表拍摄项目数。',
    'Mac 为自主作品，非品牌委托。',
  ],
  worksLink: {
    label: '查看作品',
    href: '#works',
  },
  portrait: {
    type: 'video',
    src: 'about/about-portrait.mp4',
    poster: 'about/about-portrait-poster.webp',
    alt: '杨玉峰个人肖像视频',
    position: 'center',
    hover: {
      src: 'about/about-portrait-hover.mp4',
      position: 'center',
      startAt: 0.25,
    },
  },
  portraitPlaceholder: '个人肖像／工作照待确认',
};
