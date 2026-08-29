export interface AboutContent {
  sectionNumber: string;
  eyebrow: string;
  title: { primary: string; accent: string };
  capabilities: readonly string[];
  intro: string;
  paragraphs: readonly string[];
  signature: { name: string; role: string };
  capabilityGroups: readonly { id: string; title: string; description: string }[];
  outcomes: readonly { id: string; label: string; value: string; description: string }[];
  notes: readonly string[];
  worksLink: { label: string; href: string };
  portrait: { src: string; alt: string; position?: string } | null;
  portraitPlaceholder: string;
}

export const aboutContent: AboutContent = {
  sectionNumber: '01',
  eyebrow: '关于我与工作方式',
  title: {
    primary: '内容策划与影像创作',
    accent: 'AI应用与运营实践',
  },
  capabilities: ['人群分析', '编导拍摄', '剪辑调色', 'AI视觉', '千川投放', '多Agent协作', '网站搭建', '效率管理'],
  intro:
    '我从内容运营出发，把人群分析、选题策划、拍摄制作、投放复盘串成一条工作链路；也把 AI、网站和协作工具用在真实生产里，让想法更快落地，同时保持表达、受众与目标清楚。',
  paragraphs: [
    '在 2022.10—2025.06 的碧云泉官方旗舰店工作中，我由人群分析决定以饮水安全为重点题材，再设计千川开头、内容卖点与拍摄方式，并持续优化文案和主播话术。我还从零搭建直播间，负责采购成本、场景灯光、采集传输、线上物料与主播面试；在剧情短片中主导编导、制片、拍摄、剪辑、调色到输出的全流程。',
    'AI 对我来说是创意和生产效率的一部分：我会做生图、融合改图、海报和局部素材替换，也会搭建 VPS、处理 ISP 出口与链式代理、部署 Codex CLI。配合网站搭建、多 Agent 协作和飞书／钉钉多维表格，我关注从创意落地到协作推进的完整过程。',
  ],
  signature: {
    name: '杨玉峰',
    role: '新媒体内容运营 × 影像创作者',
  },
  capabilityGroups: [
    {
      id: 'content-operations',
      title: '内容与运营',
      description: '人群分析、本地IP、小红书、抖音、阿里巴巴、视频号与千川投放。',
    },
    {
      id: 'image-and-graphic',
      title: '影像与平面',
      description: '编导、制片、拍摄、剪辑、调色与输出；闪光灯、Photoshop 和人像修图。',
    },
    {
      id: 'ai-visual-production',
      title: 'AI视觉制作',
      description: '生图、融合改图、海报制作与局部素材替换。',
    },
    {
      id: 'ai-environment',
      title: 'AI环境搭建',
      description: 'VPS 选型、ISP 出口和链式代理、Codex CLI 部署，以及账号和订阅问题处理。',
    },
    {
      id: 'web-and-agents',
      title: '网站与多Agent协作',
      description: 'HTML 前端、域名配置和部署、任务分工。',
    },
    {
      id: 'management-and-efficiency',
      title: '管理与效率',
      description: '飞书／钉钉多维表格、协作流程，以及结果和人效导向。',
    },
  ],
  outcomes: [
    {
      id: 'commercial-content',
      label: '商业内容',
      value: '45万元',
      description: '单条素材单月最高投放消耗；投产比 1:5；直播间从零起步，UV 价值从 0 提升至约 6 元，BPM 约 6000。',
    },
    {
      id: 'complete-creation',
      label: '完整创作',
      value: '全流程',
      description: '剧情短片主导编导、制片、拍摄、剪辑、调色到输出。',
    },
    {
      id: 'post-production',
      label: '后期组织',
      value: '800+',
      description: '从 800+ 素材中梳理内容与节奏，完成剪辑、调色、配乐与人声处理。',
    },
  ],
  notes: [
    '碧云泉官方旗舰店对应周期为 2022.10—2025.06，饮水安全题材由人群需求分析决定。',
    'Mac 是自主作品，不是品牌委托。',
    '投放数据按单条素材单月最高消耗统计；UV 价值指单个访客对应的价值，约 6 元。',
  ],
  worksLink: {
    label: '查看作品',
    href: '#works',
  },
  portrait: null,
  portraitPlaceholder: '个人肖像／工作照待确认',
};
