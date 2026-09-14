# 当前内容与媒体交接清单

核对日期：2026-09-14。事实以 [PROJECT.md](../PROJECT.md) 为准；媒体关联以当前内容数据、实际文件和 Git 跟踪记录为准。本清单记录现有页面及尚未接入的真实项目素材。

当前页面顺序：Hero → 关于我 → 两组共 8 张影像卡 → AI 创作与内容生产（视频与图片）→ 网站与交互 → 商业成果 → 工作经历 → 求职联系。商业卡组归在各自工作经历内。

## 路径与版本管理

- 下文媒体路径均相对于 `public/media/`，例如 `hero/hero-scroll.mp4` 对应 `public/media/hero/hero-scroll.mp4`。文件名大小写必须与数据源完全一致。
- `src/lib/media.ts` 的 `resolveMediaUrl` 默认使用 `/media/`；配置 `VITE_MEDIA_BASE_URL` 后使用经校验的媒体根地址或站内路径。该配置不改变 Git 跟踪状态，也不表示已经部署。
- `public/assets/` 下的 Hero 备用静态图、微信图标和 About 拼贴背景使用直接的 `/assets/...` 地址，不经过媒体根地址配置。
- 本次清点：`public/media/` 包含 80 个网页媒体文件，其中 40 个 MP4 由 Git LFS 管理，40 个 WebP 由普通 Git 管理，另有本目录 README。本轮新增18张AI图片，视频及既有媒体保持。
- `.gitattributes` 对 `public/media/**/*.mp4` 设置 `filter=lfs`；`.gitignore` 默认限制新增媒体，显式放行时间线、拼贴、滑雪及咖啡烘焙AI图片的网页衍生文件。忽略规则不会取消既有文件的跟踪。
- 原始拍摄文件、去重别名及其哈希记录不等于网页运行时资源。`source.fileName` 中的日期也不用于推导任职或拍摄时间。

## Hero 与关于我

Hero 的媒体入口在 `src/App.tsx`，展示与成果文字在 `src/features/hero/Hero.tsx`；关于我由 `src/content/about.ts` 提供数据。

| 区块／标识 | 媒体角色 | 当前路径 | 状态与管理 |
| --- | --- | --- | --- |
| Hero（无项目 slug） | 滚动视频 | `hero/hero-scroll.mp4` | 已接入；Git LFS |
| Hero | 首帧海报 | `hero/hero-poster.webp` | 已接入；普通 Git |
| Hero | 备用静态肖像 | `public/assets/hero/hero-candidate-03.webp` | 已接入；普通 Git；地址为 `/assets/hero/hero-candidate-03.webp` |
| Hero | 联系标识 | `Hero.tsx` 内联邮箱 SVG | 跳转 `#contact`；原微信图标文件保留但不再作为联系入口 |
| About `#about` | 主肖像视频 | `about/about-portrait.mp4` | 已接入；Git LFS；展示框为 2:3 |
| About `#about` | 肖像海报 | `about/about-portrait-poster.webp` | 已接入；普通 Git |
| About `#about` | 鼠标悬停交互视频 | `about/about-portrait-hover.mp4` | 已接入；Git LFS；数据配置从 0.25 秒开始 |
| About `#about` | 技能场景纸张背景 | `public/assets/about/collage-paper-stage.webp` | 已接入；普通 Git；1536×1024，ImageGen 依据用户拼贴视频风格生成的装饰背景，无人物或文字 |

Hero 已确认数字为 7 年内容／电商／直播运营经验、项目年 GMV 800 万+、参与 100+ 拍摄项目、个人 IP 与电商账号从 0 到 1。不得扩写为独立创造全部 GMV 或主导全部拍摄项目。About 的商业数据、旅拍后期素材数见下文口径表。

旧收尾静帧叠化已停用，不属于当前媒体依赖。肖像已经接入；数据中的肖像占位文字仅供缺少肖像时使用。已确认求职邮箱 `yyf17606187330@gmail.com` 和目标城市杭州／广州，由 `jobProfile.ts` 供首屏和页尾引用；不展示未提供的微信二维码。

## 第一组影像：4 张独立作品卡

数据源：`src/features/works/LongFormProjects.tsx` 的 `selectedFilms`。`slug` 与媒体目录不总是同名，不能直接用 slug 拼接文件路径。

四项均已接入以下三个文件，路径模式为 `projects/long-form/<媒体目录>/`：

- 海报：`poster-card.webp`，普通 Git。
- 卡片短预览：`preview-h264.mp4`，Git LFS。
- 正片：`full-hevc.mp4`，Git LFS；当前均未配置 H.264 正片后备文件。

| 顺序 | 真实 slug | 名称 | 媒体目录 | 展示比例／页面时长 | 已确认职责或边界 |
| --- | --- | --- | --- | --- | --- |
| 1 | `travel-vlog` | 旅拍 Vlog | `travel` | 2:1／04:20 | 800+ 段素材的筛选、剪辑、调色、配乐与人声处理；未参与拍摄 |
| 2 | `narrative-film` | 剧情短片 | `narrative` | 16:9／03:24 | 主导编导、制片、拍摄、剪辑、调色与输出 |
| 3 | `dark-room` | MacBook 短片 | `dark-room` | 16:9／00:22 | 2026年自主作品，非品牌委托；额外职责未确认 |
| 4 | `film-2025-06-15` | 棋局短片 | `film-2025-06-15` | 16:9／01:23 | 2025年室内人物与棋局短片；额外职责未确认 |

表中时长是页面数据标签，不是本轮重新测得的解码时长。保留现有 HEVC 正片和独立 H.264 预览，不将预览冒充正片，也不新增转码。

## 第二组影像：4 张调色作品卡

数据源：`src/content/colorGradingWorks.ts` 的 `colorGradingWorkGroup`，组 ID 为 `color-grading-02-02`。`LongFormProjects.tsx` 将其接入第二组，正片字段保留为空。

四项均已接入 `projects/long-form/<slug>/poster-card.webp` 和 `projects/long-form/<slug>/preview-h264.mp4`；前者为普通 Git，后者为 Git LFS。均为 16:9，职责仅为调色。

| 顺序 | 真实 slug | 名称 | 页面预览时长 | 正片状态 |
| --- | --- | --- | --- | --- |
| 1 | `grading-skate-workshop` | 滑板工坊 | 00:05 | 未配置；无正片播放入口 |
| 2 | `grading-percussion` | 民族器乐 | 00:03 | 未配置；无正片播放入口 |
| 3 | `grading-dance` | 民族舞蹈 | 00:06 | 未配置；无正片播放入口 |
| 4 | `grading-winter-aerial` | 冬日航拍 | 00:09 | 未配置；无正片播放入口 |

这些短预览不代表已经接入四支完整制作项目；不据此添加拍摄、编导、客户或商业结果。

## AI 创作与内容生产

数据源：`src/content/aiVideoCapability.ts`。AI 项目使用 `id` 字段；有媒体时由 `AiVideoCapabilitySection.tsx` 生成播放器 slug `ai-video-preview-<id>`。源数组顺序为时间线、拼贴、运动 TVC，页面将带 `featured` 的运动场景样片优先展示。

| 内容 ID | 项目与完成范围 | 当前媒体路径 | 接入状态／管理 |
| --- | --- | --- | --- |
| `ai-video-landscape` | 时间线：剧情阶段样片；当前已接入片段约 32.879 秒 | `ai-video/landscape-poster.webp`；`ai-video/landscape-preview-h264.mp4`；`ai-video/landscape-full-h264.mp4` | 海报为普通 Git，两个 MP4 为 Git LFS；16:9；播放器 slug 为 `ai-video-preview-ai-video-landscape` |
| `ai-video-portrait` | 复古拼贴影像：约 25.8 秒竖屏视觉实验 | `ai-video/collage-poster.webp`；`ai-video/collage-preview-h264.mp4`；`ai-video/collage-full-h264.mp4` | 已接入；9:16；海报为普通 Git，两个 MP4 为 Git LFS；播放器 slug 为 `ai-video-preview-ai-video-portrait` |
| `ai-video-sports-tvc` | 产品 TVC：规划滑雪、骑行、攀岩及产品主镜头，目前仅完成约 30.1 秒滑雪场景样片 | `ai-video/ski-poster.webp`；`ai-video/ski-preview-h264.mp4`；`ai-video/ski-full-h264.mp4` | 已接入；1472:632，约 2.33:1；海报为普通 Git，两个 MP4 为 Git LFS；播放器 slug 为 `ai-video-preview-ai-video-sports-tvc` |

时间线媒体只能关联时间线项目，不能复用给滑雪或拼贴。三项实践不等于三支完整商业广告；`fullSrc` 表示播放器展示文件，不改变“阶段样片”的作品状态。

拼贴原片为用户提供的 `a0662df4ef5a2493f2a37bf994c6192e_raw.mp4`（1080×1920，HEVC／AAC，25.813 秒），保留原片，新增同尺寸 H.264 网页播放副本；短预览为第 6 秒起的 6 秒片段，540×960，海报取第 8 秒。滑雪原片为 `暴风雪滑雪极限运动.mp4`（1472×632，H.264／AAC，30.083 秒），播放器文件仅无损重封装以支持渐进加载；短预览为第 16 秒起的 6 秒片段，1104×474，海报取第 19 秒。两项均保持原生画幅，预览与正片不互相替代。

`aiProductionContent.delivery` 记录兴海集团的图片制作与资料交付：图像生成 API、AI 超分、PDF 项目资料及 HTML 展示页面。约一周缩短至 3 天只对应图片类交付，不能扩为视频、PDF 或网站整体交付周期。该实践仍为独立文字案例，不与下方咖啡烘焙案例的工时混用。GPT 操作 Blender 属于未来方向。

### 咖啡与烘焙 AI 产品视觉

数据源：`src/content/aiImageCase.ts`；组件 `AiImageCase.tsx`，锚点 `#ai-image`。用户提供19个PNG，其中尾号119与120的文件SHA-256相同，去重为18张。原文件保留，网页副本位于 `ai-image/subtitles/`，各项 `sourceFile` 记录来源文件名。

- 17张方图保留1254×1254，套餐插画保留2172×724；WebP质量88，总约1.71 MiB。无裁切、无调色、无重新生成。
- 精选6张为暖色单品海报3张、日光场景2张、柠檬饮与巴斯克组合1张；其余12张原生折叠展开，全部按需加载，点击可在新标签页看大图。
- 工时为用户对此组作品的自述：以往拍摄加修图最快2天且需多人配合，现在一人一上午出图。没有原始实拍对照、统一人时统计或收益数据，不把不同成品当作前后对照，不计算通用提效倍数。
- SUBTITLES为图片中已有标识；未确认委托关系，不扩写为品牌客户或已投放广告。

## 网站与交互

数据源：`src/content/websiteProject.ts`；当前章节锚点为 `#web-projects`，没有项目 slug、媒体路径或公开网站链接。

| 项目 | 已确认工作与进度 | 作品集接入状态 |
| --- | --- | --- |
| 兴海颐华酒店官网 | 实景拍摄、后期修图、视觉设计、内容组织与前端实现；随鼠标响应的实景照片交互已实现；已投入约半个月，整站建设中、暂未公开 | 当前为文字介绍，展示素材和公开地址尚未接入；无后端交付声明 |

“照片交互已实现”是酒店项目进度，不表示当前作品集区块内已有可操作的酒店演示。

## 工作经历与商业卡组

经历数据源：`src/content/experience.ts`。归属关系由 `src/App.tsx` 接线：

| 经历 ID | 公司／品牌 | 任职周期 | 当前项目归属 |
| --- | --- | --- | --- |
| `xinghai` | 兴海集团；兴海·颐华、兴海·唯璞 | 2025.11—至今 | AI 图片交付实践与酒店网站另在对应章节介绍；此经历下没有商业视频卡组 |
| `zhepin` | 广州哲品家居用品有限公司；公道杯／游侠纯钛茶具 | 2025.07—2025.11 | `tea-ware` 商业卡组，共 3 张 |
| `kuwo` | 酷我贸易（徐州）有限公司；碧云泉官方旗舰店 | 2022.10—2025.06 | `water-purifier` 商业卡组，共 6 张 |

### 净水器：主卡加 5 条补充素材

项目与结果文字来自 `src/content/showcase.ts`，补充素材元数据来自 `src/content/waterPurifierMedia.ts`。由 `ProjectMediaDeck.tsx` 将主项目放在第一张，再依次接入补充素材。

| 卡片 | 数据中的 slug | 实际文件／路径模式 | 格式与状态 |
| --- | --- | --- | --- |
| 主卡 | `water-purifier` | `projects/water-purifier/poster.webp`；`preview.mp4`；`full-hevc.mp4`；`full-h264.mp4`，均位于同一目录 | 海报、预览、HEVC 正片及已有 H.264 后备正片均已接入；页面标注 01:16 |
| 补充 1 | `g7s-multi-temperature` | `projects/water-purifier/deck/g7s-multi-temperature/{poster-card.webp,preview-h264.mp4,full-h264.mp4}` | 已接入；预览 8 秒，正片元数据约 79.620 秒 |
| 补充 2 | `summer-ice-drinks` | `projects/water-purifier/deck/summer-ice-drinks/{poster-card.webp,preview-h264.mp4,full-h264.mp4}` | 已接入；预览 8 秒，正片元数据约 62.136 秒 |
| 补充 3 | `ice-workshop-demo` | `projects/water-purifier/deck/ice-workshop-demo/{poster-card.webp,preview-h264.mp4,full-h264.mp4}` | 已接入；预览 8 秒，正片元数据约 76.373 秒 |
| 补充 4 | `modular-ice-system` | `projects/water-purifier/deck/modular-ice-system/{poster-card.webp,preview-h264.mp4,full-h264.mp4}` | 已接入；预览 8 秒，正片元数据约 48.414 秒 |
| 补充 5 | `g7s-cabinet-brew` | `projects/water-purifier/deck/g7s-cabinet-brew/{poster-card.webp,preview-h264.mp4,full-h264.mp4}` | 已接入；预览 8 秒，正片元数据约 29.433 秒 |

上述花括号表示同一目录下的三个真实文件，不是待创建的槽位。所有 WebP 由普通 Git 管理，所有 MP4 由 Git LFS 管理。补充卡片的播放器 slug 为 `water-purifier-<补充素材 slug>`；主卡仍为 `water-purifier`。展示比例均为 9:16。补充素材现有网页视频为 H.264，原始来源的 HEVC／H.264 信息仅用于溯源。

### 茶具：3 条素材，只挂载一次

数据源：`src/content/teaWareMedia.ts` 与 `src/content/teaWareShowcase.ts`。主项目 `tea-ware` 直接引用 `teaWareMediaDeck[0]`，补充列表使用其余两项，不再重复加入第一条。

三项实际路径模式为 `projects/tea-ware/deck/<媒体 slug>/{poster-card.webp,preview-h264.mp4,full-h264.mp4}`。海报为普通 Git，两个 MP4 为 Git LFS；均已接入，9:16；预览均为 8 秒无音轨 H.264，正片为已有 H.264／AAC 网页衍生文件。

| 顺序 | 媒体 slug | 播放器 slug | 正片元数据时长 |
| --- | --- | --- | --- |
| 1／主卡 | `portable-tea-box` | `tea-ware` | 32.042 秒 |
| 2 | `titanium-tea-pour` | `tea-ware-titanium-tea-pour` | 18.946 秒 |
| 3 | `titanium-set-breakdown` | `tea-ware-titanium-set-breakdown` | 31.670 秒 |

`source.aliases` 记录原始素材的去重关系，别名不增加卡片数，也不新增网页路径。用户确认80万元成果来自未公开的公道杯千川素材；页面选择现有哲品影片为同项目制作示例，并明确展示片与该条投放素材不同，不绑定80万元成果到任一现有播放器slug。

## 已确认数字与归属

| 事实 | 数据源 | 必须保留的口径 |
| --- | --- | --- |
| 碧云泉 45 万元／1:5 | `about.ts`、`experience.ts`、`showcase.ts` | 单条素材单月最高投放消耗及同一条素材对应投产比；不是销售额、利润或累计消耗，也不是所有净水器素材的共同结果 |
| 碧云泉 UV 0→约 6 元、BPM 约 6000 | `about.ts`、`experience.ts`、`showcase.ts` | 直播间指标，与单条素材消耗分开表述 |
| 公道杯 80 万元／1:7 | `experience.ts`、`teaWareShowcase.ts` | 其中一条素材后续半年累计千川消耗与投产比；不扩展至游侠纯钛茶具或所有素材，半年结果不改写任职日期 |
| 兴海集团约一周→3 天 | `experience.ts`、`aiVideoCapability.ts` | 仅图片类交付周期；约 6 人为跨职能团队规模 |
| 旅拍 800+ | `about.ts`、`LongFormProjects.tsx` | 后期筛选与组织的素材段数，不是拍摄数量或拍摄项目数 |
| AI 约 30.1 秒／约 32.879 秒／约 25.8 秒 | `aiVideoCapability.ts`、`PROJECT.md` | 依次为滑雪场景样片、时间线剧情片段和复古拼贴作品；不互换媒体或完成范围 |
| 酒店约半个月 | `websiteProject.ts` | 已投入时间；核心照片交互已实现，整站仍在建设中 |

## 后续接续与检查

酒店展示素材与公开地址按用户要求暂缓。邮箱与求职城市已接入；2022年以前经历不展开。视频预览起止秒数等待用户提供，本轮不改视频；调色组当前仅配置短预览，不为填满清单创建正片、占位图片或虚构项目。

素材以后接入时，先确认所属项目、完成范围、媒体角色与实际画幅，再更新对应数据源和本清单；不要仅按文件名、邻近卡片或标题推断归属。已有作品媒体与本次新素材的原片均保持。

在集成工作树使用以下检查：

```sh
git ls-files public/media public/assets
git lfs ls-files
npm run check:media
npm run test:run -- src/content/contentConsistency.test.ts
```

`check:media` 检查 Git 已跟踪 MP4／WebP 的真实文件头，并核对 MP4 的 LFS 大小和 SHA-256。内容一致性测试检查商业项目与经历的关联、导出内容 ID，以及预览／正片路径角色。两者都不等同于浏览器解码、实际播放、音画同步或视觉验收，实际验收状态见本机 `.agent-state/STATUS.md`。
