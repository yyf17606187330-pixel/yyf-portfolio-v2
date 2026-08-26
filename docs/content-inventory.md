# 作品素材交接清单

这份清单只定义当前 12 个占位项目的文件槽位，不代表真实项目名、客户或成绩。实际交付时，保留已定的 `slug` 并替换内容字段。

## 内容基线｜2026-08-26

### 个人定位

- 定位：新媒体内容运营 × 影像创作者
- 简介：我以新媒体运营为核心，独立完成选题策划、脚本编导、拍摄剪辑、发布投放与数据复盘。既懂内容怎么做，也懂内容为什么有效；AI 则是我提升创意和生产效率的一部分。
- 短句：懂运营，也能把内容从脚本拍到成片。
- 可选强调句（暂不强制放入首页）：从内容策略到最终成片，我把新媒体运营、编导拍摄、后期制作与投放复盘放在同一条链路里。不是只把视频做出来，而是让每一条内容都有明确的表达、受众和传播目标。

### 能力分类基线

以下是面向个人能力表达的编辑分类，和现有作品的媒体类型筛选保持分离：

1. 新媒体内容与账号运营
2. 商业视频与编导拍剪
3. AI 辅助创作与视觉实验

现有 `film`、`ai-video`、`photography`、`design-interactive` 分类暂时保留，用于兼容当前作品索引；能力分类不替代作品媒体类型。

### 联系方式基线

- 国内业务邮箱：待用户单独确认公开
- 国外业务邮箱：待用户单独确认公开
- 手机号：待用户单独确认公开
- 微信号：待用户单独确认公开
- 微信二维码：暂不提供，继续保留占位

当前 `SiteProfile` 只有单一 `email` 字段，`profile.email` 和 `contactDetails` 均保留占位。用户已提供过联系方式，但本次跨设备交接不把电话、邮箱或微信号写入公开分支；主控 Agent 后续接入共享联系方式展示时，应先取得单独公开确认，也不要把两个地址拼成一个 `mailto` 值。

### 试点作品内容包

建议先使用 Featured 槽位 `film-01` 作为试点。它目前只是一个占位槽位，不代表已经确认的真实项目。

每个试点项目只需要一份短内容包，不强行写成长案例：

| 字段 | 需要确认的内容 | 当前状态 |
| --- | --- | --- |
| `title` | 对外可用的真实项目名 | 待用户提供 |
| `category` | 对应媒体类型；可同时关联能力分类 | 槽位为 `film`，能力分类待确认 |
| `year` | 项目年份或可公开的时间范围 | 待用户提供 |
| `background` | 1–2 句项目背景、内容目标和受众；只写可核对事实 | 数据结构待接入，内容待提供 |
| `roles` | 本人实际负责的选题、脚本、拍摄、剪辑、发布、投放或复盘环节 | 当前仍为占位 |
| `representativeVideos` | 3 条代表视频：标题／本人负责环节／公开播放地址或媒体路径／授权状态 | 数据结构待接入，素材待提供 |
| `poster` | 与首帧构图一致的封面图 | 待提供 |
| `previewSrc` | 5–8 秒、无声、可循环预览 | 待提供 |
| `fullSrc` | 保留声音的完整展示片 | 待提供 |
| `aspectRatio` | 实际展示比例 | 槽位暂定 `16/9`，待素材确认 |
| `publicProof` | 可公开的作品链接、授权说明或其他证明 | 待用户确认 |

### 试点缺口与替换顺序

1. 确认 `film-01` 对应的真实项目名、年份和是否允许公开。
2. 提供项目背景概括，并确认本人实际职责；不从简历自动推导客户、公司或业绩数字。
3. 选出 3 条代表视频，确认每条的公开链接或交付媒体，以及公开授权状态。
4. 按下方统一文件规则准备 poster、muted preview 和 full 展示片。
5. 将占位字段替换为已确认内容；如任何字段仍未确认，继续保留“待提供／待确认”标记。
6. 补充内容测试，再交由用户进行桌面与手机页面复核。

联系方式、微信二维码、简历中的具体业绩数字、公司信息和其他个人资料均不进入本次公开内容；只有用户单独确认后才能进入网站。简历源文件仅用于事实核对，不作为自动公开来源。

## 统一文件规则

- 目录：`projects/<slug>/`。
- 文件名：`<slug>-poster.webp`、`<slug>-preview.mp4`、`<slug>-full.mp4`。如主片必须使用 WebM，只改扩展名，不改 basename。
- `poster`：WebP，sRGB，按表中比例导出；长边建议 2000–2400 px，单张建议不超过 1.2 MB。
- `previewSrc`：5–8 秒、无声、循环友好的 H.264 MP4；建议 1080p，不携带音轨，首帧与封面构图一致。
- `fullSrc`：H.264 MP4，保留原始声音；网页版建议 1080p、快速启动（fast start）。摄影或静态设计项目也需要交付一支可播放的展示片，不应将图片路径填入 `fullSrc`。
- 端到端交接前检查：封面无重要内容贴边，预览无音轨，主片音画同步，三个路径大小写与源码完全一致。

## 3 个 Featured 槽位

| 顺序 | slug | 分类 | 建议 poster | 5–8s muted preview | 建议 full | 比例 / 方向 |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | `film-01` | FILM / 影像 | `film-01-poster.webp` | `film-01-preview.mp4` | `film-01-full.mp4` | `16/9` / 横版 |
| 02 | `ai-video-01` | AI VIDEO / AI视频 | `ai-video-01-poster.webp` | `ai-video-01-preview.mp4` | `ai-video-01-full.mp4` | `16/9` / 横版 |
| 03 | `photography-01` | PHOTOGRAPHY / 摄影 | `photography-01-poster.webp` | `photography-01-preview.mp4` | `photography-01-full.mp4` | `4/5` / 竖版 |

## 9 个 Index 槽位

| 顺序 | slug | 分类 | 建议 poster | 5–8s muted preview | 建议 full | 比例 / 方向 |
| --- | --- | --- | --- | --- | --- | --- |
| 04 | `film-02` | FILM / 影像 | `film-02-poster.webp` | `film-02-preview.mp4` | `film-02-full.mp4` | `16/9` / 横版 |
| 05 | `ai-video-02` | AI VIDEO / AI视频 | `ai-video-02-poster.webp` | `ai-video-02-preview.mp4` | `ai-video-02-full.mp4` | `16/9` / 横版 |
| 06 | `photography-02` | PHOTOGRAPHY / 摄影 | `photography-02-poster.webp` | `photography-02-preview.mp4` | `photography-02-full.mp4` | `4/5` / 竖版 |
| 07 | `design-interactive-01` | DESIGN + INTERACTIVE / 设计与交互 | `design-interactive-01-poster.webp` | `design-interactive-01-preview.mp4` | `design-interactive-01-full.mp4` | `1/1` / 方形 |
| 08 | `film-03` | FILM / 影像 | `film-03-poster.webp` | `film-03-preview.mp4` | `film-03-full.mp4` | `16/9` / 横版 |
| 09 | `ai-video-03` | AI VIDEO / AI视频 | `ai-video-03-poster.webp` | `ai-video-03-preview.mp4` | `ai-video-03-full.mp4` | `9/16` / 竖版 |
| 10 | `photography-03` | PHOTOGRAPHY / 摄影 | `photography-03-poster.webp` | `photography-03-preview.mp4` | `photography-03-full.mp4` | `3/2` / 横版 |
| 11 | `design-interactive-02` | DESIGN + INTERACTIVE / 设计与交互 | `design-interactive-02-poster.webp` | `design-interactive-02-preview.mp4` | `design-interactive-02-full.mp4` | `1/1` / 方形 |
| 12 | `design-interactive-03` | DESIGN + INTERACTIVE / 设计与交互 | `design-interactive-03-poster.webp` | `design-interactive-03-preview.mp4` | `design-interactive-03-full.mp4` | `16/9` / 横版 |

## 路径示例

线上媒体根目录通过环境变量提供，源码字段只填相对路径：

```dotenv
VITE_MEDIA_BASE_URL=https://media.example.com/yang-yufeng/
```

```ts
poster: 'projects/film-01/film-01-poster.webp'
previewSrc: 'projects/film-01/film-01-preview.mp4'
fullSrc: 'projects/film-01/film-01-full.mp4'
```

`media.example.com` 仅是格式示例，不是已配置的 CDN。不要在未确认真实媒体域名前直接部署这一值。

## 待提供的个人资料

- 个人肖像：建议竖版 `portrait-yang-yufeng.webp`，`4/5`，sRGB，长边 2000–2400 px。
- 邮箱、手机号、微信号：待用户单独确认是否进入公开网站。
- 微信二维码：建议 `wechat-qr-yang-yufeng.png`，正方形，至少 1200×1200 px，交付前在手机上实测可扫描。
