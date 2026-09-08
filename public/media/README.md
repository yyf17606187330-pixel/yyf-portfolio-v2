# 媒体目录说明

本目录已经包含受版本管理的网页媒体，并非空目录。当前内容、真实 slug、文件模式与待接入状态见 [内容与媒体交接清单](../../docs/content-inventory.md)；事实边界以 [PROJECT.md](../../PROJECT.md) 为准。

## 当前目录

2026-09-08 清点：62 个已跟踪媒体文件，包含 40 个 MP4 和 22 个 WebP；另有本 README。包含本轮新加入暂存区的 6 个 AI 媒体文件。

| 目录 | 当前用途 |
| --- | --- |
| `hero/` | Hero 滚动视频与海报 |
| `about/` | About 主肖像、悬停交互视频及海报 |
| `projects/long-form/` | 第一组 4 项作品的海报、预览与 HEVC 正片；第二组 4 项调色练习的海报与短预览 |
| `ai-video/` | 时间线剧情阶段样片、复古拼贴和滑雪场景样片的海报、预览和播放器文件 |
| `projects/water-purifier/` | 净水器主卡的海报、预览、HEVC 正片与 H.264 后备；`deck/` 下还有 5 条素材 |
| `projects/tea-ware/deck/` | 3 条茶具素材；第一条供 `tea-ware` 主卡复用，不重复计数 |

三项 AI 作品分别使用 `landscape-*`、`collage-*`、`ski-*`，不互换媒体。酒店项目当前只有文字介绍；调色卡片尚未配置正片，不把短预览当作正片。

## 加载方式

- 内容数据使用相对于本目录的路径，例如 `projects/long-form/travel/full-hevc.mp4`。
- `src/lib/media.ts` 的 `resolveMediaUrl` 默认解析到 `/media/`，可通过 `VITE_MEDIA_BASE_URL` 使用经校验的 HTTPS 媒体根地址或站内路径。设置该变量不代表已完成媒体托管或部署。
- Hero 备用静态图、微信图标和 About 纸张背景 `/assets/about/collage-paper-stage.webp` 位于 `public/assets/`，直接使用站内地址，不受上述媒体根地址配置影响。

## Git 与 LFS

- `.gitattributes` 将 `public/media/**/*.mp4` 交给 Git LFS 管理；当前 40 个 MP4 均可在 `git lfs ls-files` 中找到。
- WebP 和 README 由普通 Git 管理。
- `.gitignore` 默认阻止新增、尚未批准的媒体进入跟踪，并显式放行三项 AI 作品的九个网页衍生文件。忽略规则不会移除已经跟踪的 Hero、About、长片或商业素材。
- 新克隆或跨设备接续时，需要取得对应 LFS 对象；只有 LFS 指针文本不能用于播放。原始拍摄文件和素材去重别名由来源记录管理，不应因为清单存在记录就额外提交原片。

已有文件随 Git／LFS 交接，新增大型媒体按项目授权范围处理，保留原片。

## 媒体角色与格式

- 海报用于静态展示；短预览与正片保持独立路径，播放器优先使用已配置的正片。
- 第一组 4 项独立作品的正片目前为 `full-hevc.mp4`，未配置 H.264 正片后备。净水器主卡已有 `full-h264.mp4` 后备，其余净水器补充卡、茶具和三项 AI 作品已有 H.264 网页视频。
- 保留现有格式；不把文件存在或 LFS 完整性通过解释为所有浏览器都能解码 HEVC。
- 时间线约 32.879 秒、16:9；拼贴约 25.8 秒、9:16；滑雪约 30.1 秒、1472:632。拼贴新增 H.264 兼容副本，滑雪播放文件为原码流重封装，两项预览各 6 秒。文件名中的 `full` 仅区分播放文件与短预览，不表示完整 TVC 已完成。

## 交接检查

```sh
git ls-files public/media
git lfs ls-files
npm run check:media
```

`npm run check:media` 检查 Git 已跟踪 MP4／WebP 的真实文件头，并核对 MP4 的 LFS 大小和 SHA-256；CI 应取得 LFS 对象后运行同一检查。

更新内容关联后运行 `npm run test:run -- src/content/contentConsistency.test.ts`。该测试不重复检查文件字节或 LFS。文件完整性和内容关联通过，不等于浏览器解码、实播、音画同步或视觉验收通过；后续再进行这些验收。
