# 杨玉峰个人作品集 v2 规格

## 产品目标

创建一个独立、可构建的 Vite + React + TypeScript 前端原型，定位为“杨玉峰｜影像导演 × AI 视觉创作者”。首页以作品为第一内容，不采用传统简历式长页面。

## 页面结构与内容

- 开场顺序固定为 `HELLO.` → `YANG YUFENG` → 作品首页，总时长 1.5–1.8 秒。
- 开场可跳过，尊重 `prefers-reduced-motion`，同一 `sessionStorage` 会话只播放一次。
- 首页直接显示 3 个重点项目与 9 个轻量索引项目，共 12 个可配置项目。
- 分类固定为 `FILM / 影像`、`AI VIDEO / AI视频`、`PHOTOGRAPHY / 摄影`、`DESIGN + INTERACTIVE / 设计与交互`，筛选无刷新并显示数量。
- 点击项目打开视口级播放器，不建立项目详情路由。
- 播放器支持关闭、播放/暂停、进度、静音和系统全屏；用户点击项目后尝试有声播放，关闭后恢复滚动位置与键盘焦点。
- 全屏导航层集中展示姓名、定位、四组能力、About、邮箱和微信二维码入口；页面正文不重复成长篇能力章节。
- 能力分组和中文内容必须与用户批准计划一致。
- 未提供的肖像、邮箱、微信二维码和作品媒体使用明确标注的可替换占位状态，不虚构人物、成绩、客户或账号数据。

## 技术约束

- 使用 GSAP 驱动开场、菜单与播放器转场。
- 使用 Lenis 进行平滑滚动，但保留原生滚轮语义。
- 流体效果只迁移旧工程的 shader、指针采样、WebGL 检测和降级思路，不迁移旧演示页面、颜色、标题或玻璃面板。
- 流体颜色、强度、启用区域与降级策略由 `FluidEffectConfig` 配置。
- 流体仅在桌面精细指针、允许动画、WebGL 可用且页面可见时运行；触屏、减少动态或 WebGL 不可用时展示静态 CSS。
- WebGL 模块懒加载，DPR 最大 1.5，页面隐藏时停止渲染。
- 视频不进入 Git，所有媒体路径通过 `VITE_MEDIA_BASE_URL` 解析。
- 首屏只加载封面；预览接近视口再加载。
- 原型使用可替换的中性视觉令牌，不锁定最终配色、字体和真实媒体构图。

## 公共类型

```ts
type ProjectCategory = 'film' | 'ai-video' | 'photography' | 'design-interactive';

interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  year: string;
  client: string;
  roles: string[];
  featured: boolean;
  order: number;
  poster: string;
  previewSrc: string;
  fullSrc: string;
  aspectRatio: `${number}/${number}`;
}

interface SiteProfile {
  name: string;
  latinName: string;
  positioning: string;
  bio: string;
  portrait: string;
  email: string;
  wechatQr: string;
}

interface FluidEffectConfig {
  colors: [string, string, string];
  intensity: number;
  enabledRegions: Array<'intro' | 'hero' | 'menu'>;
  fallback: 'static-gradient' | 'solid';
}
```

## 验收

- `npm run test:run`、`npm run typecheck`、`npm run lint`、`npm run build` 全部通过。
- 1440×900、1280×800 与 390×844 页面无横向溢出，关键控件可见。
- 开场后立即可见姓名、定位、作品和导航入口。
- 键盘可操作筛选、菜单和播放器；Esc 可关闭顶层界面；焦点不会逃出打开的模态层。
- 浏览器控制台无应用错误；缺失素材以设计好的占位状态显示，不触发 404。

