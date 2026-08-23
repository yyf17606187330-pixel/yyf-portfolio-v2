# 作品素材交接清单

这份清单只定义当前 12 个占位项目的文件槽位，不代表真实项目名、客户或成绩。实际交付时，保留已定的 `slug` 并替换内容字段。

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
- 邮箱：待用户提供并确认对外公开的真实邮箱；未提供前保留占位文案。
- 微信二维码：建议 `wechat-qr-yang-yufeng.png`，正方形，至少 1200×1200 px，交付前在手机上实测可扫描。
