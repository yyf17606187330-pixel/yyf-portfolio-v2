export interface ExperienceDetailBlock {
  kicker: string;
  title: string;
  body: string;
}

export interface ExperienceMetric {
  value: string;
  label: string;
  context: string;
}

export type ExperienceId = 'xinghai' | 'zhepin' | 'kuwo';

export interface ExperienceEntry {
  id: ExperienceId;
  company: string;
  brand: string;
  division: string;
  role: string;
  displayPeriod: string;
  scope: string;
  summaries: readonly string[];
  detailBlocks: readonly ExperienceDetailBlock[];
  metrics: readonly ExperienceMetric[];
  publicNotes: readonly string[];
}

export interface ExperienceContent {
  sectionNumber: string;
  eyebrow: string;
  title: { primary: string; accent: string };
  intro: string;
  topMetrics?: readonly ExperienceMetric[];
  experiences: readonly ExperienceEntry[];
}

export const experienceContent: ExperienceContent = {
  sectionNumber: '03',
  eyebrow: '工作经历',
  title: {
    primary: '工作经历',
    accent: '内容、影像与团队协作',
  },
  intro: '在酒店、家居与净水器业务中，我负责品牌内容、影像制作、投放运营与团队协作。',
  topMetrics: [
    {
      value: '45万元／1:5',
      label: '碧云泉｜素材投放',
      context: '单条素材单月最高投放消耗与投产比。',
    },
    {
      value: '80万元／1:7',
      label: '哲品｜公道杯素材',
      context: '其中一条素材后续半年累计千川消耗与投产比。',
    },
    {
      value: '约1周→3天',
      label: '兴海集团｜图片交付',
      context: '图片类交付周期由约一周缩短至三天。',
    },
  ],
  experiences: [
    {
      id: 'xinghai',
      company: '兴海集团',
      brand: '兴海·颐华、兴海·唯璞',
      division: '商业创新事业部',
      role: '品牌部主管',
      displayPeriod: '2025.11—至今',
      scope: '集团及两家酒店的品牌内容、多平台传播、团队统筹与数字化工作环境建设。',
      summaries: [
        '负责兴海集团及兴海·颐华、兴海·唯璞两家酒店的内容传播，统筹并执行从选题到发布的制作工作。',
        '协调约 6 人跨职能团队的任务与交付，同时负责集团网站、网络和数字化工作环境建设。',
      ],
      detailBlocks: [
        {
          kicker: '品牌传播',
          title: '集团与两家酒店',
          body: '为抖音、视频号、小红书和微信公众号制作并发布集团与酒店品牌内容。',
        },
        {
          kicker: '团队统筹',
          title: '约 6 人跨职能协作',
          body: '协作角色包括美工、策划、公众号运营、拍摄助理与剪辑；用钉钉管理任务、人效、进度和交付规范。',
        },
        {
          kicker: '内容制作',
          title: '从选题到发布',
          body: '统筹并执行选题、脚本、拍摄、剪辑、调色、包装和发布。',
        },
        {
          kicker: '数字化环境',
          title: '网站与工作环境',
          body: '建设集团网站、网络与数字化工作环境，支持内容发布和团队协作。',
        },
      ],
      metrics: [
        {
          value: '约6人',
          label: '跨职能团队',
          context: '统筹任务分配、制作进度与交付规范。',
        },
        {
          value: '约1周→3天',
          label: '图片类交付周期',
          context: '兴海集团图片类交付由约一周缩短至 3 天。',
        },
      ],
      publicNotes: [
        '约一周至 3 天的数据对应图片类交付。',
        '网站与数字化工作环境服务于内容发布和团队协作。',
      ],
    },
    {
      id: 'zhepin',
      company: '广州哲品家居用品有限公司',
      brand: '公道杯／游侠纯钛外出与露营茶具',
      division: '商业内容项目',
      role: '商业内容编导／全流程影像制作',
      displayPeriod: '2025.07—2025.11',
      scope: '负责茶具影像制作、上传和千川投放，不涉及直播。',
      summaries: [
        '负责公道杯与游侠纯钛茶具的商业内容，从布景、拍摄、后期到上传和千川投放。',
        '公道杯从办公喝茶痛点切入，用光影与细节呈现产品质感；游侠纯钛茶具突出材质、配色、便携性与露营场景。',
      ],
      detailBlocks: [
        {
          kicker: '公道杯',
          title: '办公喝茶痛点',
          body: '围绕办公喝茶需求设计内容，用光影、画质和细节呈现产品质感与品牌价值。',
        },
        {
          kicker: '制作与投放',
          title: '从布景到千川投放',
          body: '负责布景、拍摄、剪辑、调色、包装、上传和千川投放。',
        },
        {
          kicker: '投放结果',
          title: '单条素材后续表现',
          body: '其中一条公道杯素材在后续半年累计千川消耗 80 万元，投产比为 1:7。',
        },
        {
          kicker: '游侠纯钛',
          title: '材质与户外场景',
          body: '以纯钛材质、可定制配色、外观和便携性为重点，展示外出与露营场景。',
        },
      ],
      metrics: [
        {
          value: '80万元／1:7',
          label: '公道杯素材投放表现',
          context: '其中一条公道杯素材，统计其后续半年的累计千川消耗与投产比。',
        },
      ],
      publicNotes: [
        '任职周期：2025.07—2025.11。',
        '80 万元／1:7 仅对应其中一条公道杯素材后续半年的千川表现。',
      ],
    },
    {
      id: 'kuwo',
      company: '酷我贸易（徐州）有限公司',
      brand: '碧云泉官方旗舰店',
      division: '新媒体内容运营',
      role: '新媒体内容运营／内容负责人',
      displayPeriod: '2022.10—2025.06',
      scope: '碧云泉净水器的内容制作、千川投放与直播间从零搭建。',
      summaries: [
        '从零搭建直播间，负责采购与成本、灯光器材、软装场布、信号采集与传输、线上物料及主播面试。',
        '根据人群需求选择饮水安全题材，围绕产品卖点制作千川素材；结合投放与直播数据，持续调整文案和主播话术。',
      ],
      detailBlocks: [
        {
          kicker: '从零搭建',
          title: '直播间从零搭建',
          body: '负责采购与成本、灯光器材、软装场布、采集与传输信号、线上物料及主播面试。',
        },
        {
          kicker: '人群洞察',
          title: '从人群需求确定题材',
          body: '分析饮水安全、饮水便捷、桌面陈设与品质生活需求，选择饮水安全作为重点题材。',
        },
        {
          kicker: '内容制作',
          title: '痛点开头与产品卖点',
          body: '策划并制作千川素材，完成拍摄、剪辑、调色、发布与投放，调整文案信息密度。',
        },
        {
          kicker: '投放复盘',
          title: '用投放反馈调整内容',
          body: '结合人群需求与投放数据，复盘素材开头、产品卖点和拍摄方式。',
        },
        {
          kicker: '直播优化',
          title: '主播话术与信息密度',
          body: '结合直播间数据调整主播话术与内容表达，持续复盘运营表现。',
        },
      ],
      metrics: [
        {
          value: '45万元／1:5',
          label: '碧云泉素材投放',
          context: '单条素材单月最高投放消耗与投产比，均来自同一条素材。',
        },
        {
          value: '0→约6元／BPM约6000',
          label: '直播间优化数据',
          context: '直播间 UV 价值从 0 提升至约 6 元，BPM 约 6000。',
        },
      ],
      publicNotes: [
        '任职周期：2022.10—2025.06。',
        '45 万元为单条素材单月最高投放消耗，对应投产比 1:5；UV 与 BPM 为直播间指标。',
      ],
    },
  ],
};
