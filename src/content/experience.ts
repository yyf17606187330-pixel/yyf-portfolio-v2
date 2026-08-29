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

export interface ExperienceEntry {
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
  topMetrics?: readonly ExperienceMetric[];
  experiences: readonly ExperienceEntry[];
}

export const experienceContent: ExperienceContent = {
  sectionNumber: '03',
  eyebrow: '工作经历',
  title: {
    primary: '内容运营与影像创作',
    accent: '从策划到交付',
  },
  topMetrics: [
    {
      value: '45万元／1:5',
      label: '碧云泉千川素材',
      context: '单条素材单月最高投放消耗与投产比。',
    },
    {
      value: '80万元／1:7',
      label: '公道杯素材',
      context: '其中一条素材后续半年累计千川消耗与投产比。',
    },
    {
      value: '约1周→3天',
      label: '图片类交付周期',
      context: '兴海集团工作中的交付周期变化，质量与品牌一致性明显提升。',
    },
  ],
  experiences: [
    {
      company: '兴海集团',
      brand: '兴海·颐华、兴海·唯璞',
      division: '商业创新事业部',
      role: '品牌部主管',
      displayPeriod: '2025.11—至今',
      scope: '负责集团及两家酒店品牌的内容与线上传播，覆盖抖音、视频号、小红书、微信公众号；统筹跨职能团队与集团网站、网络及数字化工作环境。',
      summaries: [
        '负责集团及兴海·颐华、兴海·唯璞两家酒店品牌的内容与线上传播，覆盖抖音、视频号、小红书和微信公众号。本人统筹并执行选题、脚本、拍摄、剪辑、调色、包装、发布的完整链路。',
        '统筹约 6 人跨职能团队，成员职能包括美工、策划、公众号运营、拍摄助理和剪辑；用钉钉梳理任务、人效、进度与交付规范，并在内容生产中使用 AI 做创意、素材和生产辅助。同时负责集团网站、网络及数字化工作环境建设。',
      ],
      detailBlocks: [
        {
          kicker: '矩阵传播',
          title: '集团与酒店品牌内容',
          body: '负责集团及兴海·颐华、兴海·唯璞两家酒店品牌在抖音、视频号、小红书与微信公众号的内容及线上传播。',
        },
        {
          kicker: '团队统筹',
          title: '约 6 人跨职能协作',
          body: '统筹约 6 人跨职能团队，协作角色包括美工、策划、公众号运营、拍摄助理与剪辑，使用钉钉梳理任务、人效、进度和交付规范。',
        },
        {
          kicker: '全链路制作',
          title: '从选题到发布的完整执行',
          body: '本人统筹并执行选题、脚本、拍摄、剪辑、调色、包装与发布，覆盖从想法到上线的完整制作链路。',
        },
        {
          kicker: '钉钉与 AI 提效',
          title: '让图片类交付更紧凑',
          body: '在创意、素材和生产环节使用 AI；图片类交付由约一周缩短至 3 天，质量与品牌一致性明显提升。',
        },
        {
          kicker: '数字化环境',
          title: '网站与工作环境建设',
          body: '负责集团网站、网络及数字化工作环境建设，相关 AI、网站与多 Agent 协作能力在此工作中持续形成。',
        },
      ],
      metrics: [
        {
          value: '约6人',
          label: '跨职能团队',
          context: '美工、策划、公众号运营、拍摄助理与剪辑等职能协作。',
        },
        {
          value: '约1周→3天',
          label: '图片类交付周期',
          context: '交付周期缩短，质量与品牌一致性明显提升。',
        },
      ],
      publicNotes: [
        '图片类交付周期由约一周缩短至 3 天，质量与品牌一致性明显提升。',
        'AI 与数字化环境能力服务于内容生产、网站建设和团队协作。',
      ],
    },
    {
      company: '广州哲品家居用品有限公司',
      brand: '公道杯／游侠纯钛外出／露营茶具',
      division: '商业内容项目',
      role: '商业内容编导／全流程影像制作',
      displayPeriod: '2025·短期项目',
      scope: '实际不到一个月；负责布景、拍摄、剪辑、调色、包装、上传和千川投放，不涉及直播。',
      summaries: [
        '在 2025 年的短期项目中，负责从布景、拍摄到后期、上传和千川投放的完整执行，不涉及直播。',
        '公道杯内容围绕办公喝茶痛点展开，通过画质、光影与细节堆叠品牌溢价；游侠纯钛外出／露营茶具则突出纯钛高端材质、可定制配色、颜值、便携与户外场景。',
      ],
      detailBlocks: [
        {
          kicker: '公道杯洞察',
          title: '从办公喝茶痛点切入',
          body: '围绕办公喝茶痛点组织内容，通过画质、光影和细节堆叠，把产品质感与品牌溢价表达出来。',
        },
        {
          kicker: '全流程执行',
          title: '布景、拍摄到千川投放',
          body: '负责布景、拍摄、剪辑、调色、包装、上传和千川投放，完成一条商业内容从制作到发布的完整链路。',
        },
        {
          kicker: '投放结果',
          title: '公道杯素材的后续表现',
          body: '其中一条公道杯素材在后续半年累计千川消耗 80 万元，投产比为 1:7。',
        },
        {
          kicker: '游侠产品表达',
          title: '纯钛材质与户外场景',
          body: '突出纯钛高端材质、可定制配色、颜值、便携和外出／露营场景，建立与公道杯不同的产品表达。',
        },
      ],
      metrics: [
        {
          value: '80万元／1:7',
          label: '公道杯素材投放表现',
          context: '其中一条公道杯素材后续半年累计千川消耗 80 万元，投产比为 1:7。',
        },
      ],
      publicNotes: [
        '项目实际不到一个月，公开时间采用“2025·短期项目”。',
        '80 万元与投产比 1:7 仅对应公道杯单条素材后续半年的千川表现，不延伸到游侠纯钛茶具。',
      ],
    },
    {
      company: '酷我贸易（徐州）有限公司',
      brand: '碧云泉官方旗舰店',
      division: '新媒体内容运营',
      role: '新媒体内容运营／内容负责人',
      displayPeriod: '2022.10—2025.06',
      scope: '从零搭建直播间，并负责围绕净水器产品的内容策划、拍摄、剪辑、投放与复盘。',
      summaries: [
        '负责从零搭建直播间，覆盖采购和成本、灯光器材、软装场布、采集／传输信号、线上电子物料与主播面试。',
        '通过人群分析识别饮水安全、便捷、桌面陈设和品质生活需求，以饮水安全为重点题材，围绕产品优势、痛点开头与千川素材完成策划、拍摄、剪辑、调色、发布投放与复盘，并优化文案信息密度和主播话术。',
      ],
      detailBlocks: [
        {
          kicker: '从零搭建',
          title: '把直播间基础环节跑通',
          body: '负责采购和成本、灯光器材、软装场布、采集／传输信号、线上电子物料与主播面试，从零搭建直播间的工作基础。',
        },
        {
          kicker: '人群洞察',
          title: '从需求决定饮水安全题材',
          body: '通过人群分析识别饮水安全、便捷、桌面陈设和品质生活需求，并据此选择饮水安全作为重点题材。',
        },
        {
          kicker: '内容制作',
          title: '围绕痛点开头与产品优势制作',
          body: '围绕产品优势和痛点开头策划千川素材，完成拍摄、剪辑、调色、发布投放与复盘，并持续优化文案信息密度。',
        },
        {
          kicker: '千川结果',
          title: '把素材放进真实投放链路',
          body: '根据产品表达和人群需求设计千川开头、卖点与拍摄方式，把内容制作与发布投放、数据复盘连在一起。',
        },
        {
          kicker: '直播话术与数据',
          title: '持续优化直播间表达',
          body: '优化主播话术和内容信息密度，结合直播间数据观察和复盘，让直播间从零开始逐步形成稳定的内容与运营节奏。',
        },
      ],
      metrics: [
        {
          value: '45万元／1:5',
          label: '单条素材单月最高投放消耗与投产比',
          context: '碧云泉千川素材；45 万元与投产比 1:5 为同一条素材的同一投放口径。',
        },
        {
          value: '0→约6元／BPM约6000',
          label: '直播间优化数据',
          context: '直播间 UV 价值从 0 提升至约 6 元，BPM 约 6000。',
        },
      ],
      publicNotes: [
        '项目时间按 2022.10—2025.06 展示。',
        '45 万元与投产比 1:5 属同一条千川素材的单条单月最高投放口径；UV 价值从 0 提升至约 6 元，BPM 约 6000。',
      ],
    },
  ],
};
