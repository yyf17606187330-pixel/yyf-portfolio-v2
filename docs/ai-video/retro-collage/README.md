# 复古拼贴 AI 视频｜可恢复资产检查点

本目录保存《ARE YOU READY?》复古拼贴 AI 视频的公开、可恢复检查点。它独立于网站内容与页面实现，仅用于跨设备同步当前已确认的关键帧、故事板和生成规格。

## 当前状态

- 画面比例：竖屏 `3:4`
- 目标时长：约 `30 秒`
- 结构：`7` 个连续关键阶段，推荐拆成两次约 `15 秒` 生成
- 风格：复古撕纸拼贴、定格动画、编辑设计动态视觉
- 对白／旁白：无
- 当前资产：7 张最终关键帧、两段式生成提示、七段式备用提示、故事板与复现说明
- 尚未完成：最终视频、音效、音乐、混音、字幕、网页封面与预览片
- 网站状态：暂不入站，不修改现有作品卡、内容清单或页面代码

当前 `3:4` 比例与已有候选 AI 视频槽位不匹配：`ai-video-01` 为 `16:9`，`ai-video-03` 为 `9:16`。如果以后决定入站，应先确认独立卡槽、展示比例和最终成片，再导出轻量 WebP 封面并登记尺寸与哈希。

## 目录

```text
docs/ai-video/retro-collage/
├── README.md
├── storyboard.md
├── generation-spec.md
├── prompts-two-pass.md
├── prompts-seven-scenes.md
├── frame-manifest.sha256
└── frames/
    ├── S01-newspaper-cover.png
    ├── S02-camera-raised.png
    ├── S03-material-burst-paper-road.png
    ├── S04-broadcast-studio.png
    ├── S05-photo-studio.png
    ├── S06-ai-paper-curtain.png
    └── S07-mountain-lake-finale.png
```

## 关键帧顺序

1. S01：报纸遮脸，报纸上唯一文字为 `ARE YOU READY?`
2. S02：报纸落下，人物举起相机
3. S03：相机喷出照片与胶片，纸团展开为纸路
4. S04：大型转播现场，人物在广播级摄像机旁做倒数手势
5. S05：摄影棚低位拍摄
6. S06：人物拉开 AI 电子纸幕
7. S07：人物背对镜头站在岩石上望向山湖

## 推荐使用方式

1. 先阅读 [`generation-spec.md`](generation-spec.md) 锁定人物与拼贴运动规则。
2. 使用 [`prompts-two-pass.md`](prompts-two-pass.md) 分两次生成：S01→S04、S04→S07。
3. 如果模型无法在一次生成中稳定通过多个阶段，改用 [`prompts-seven-scenes.md`](prompts-seven-scenes.md) 逐段生成。
4. 第二段必须以第一段最终 S04 画面作为首帧，后期只在完全相同的 S04 帧上拼接。
5. 每次生成后检查人物身份、服装、撕纸边、字幕禁用和关键构图，再进入下一段。

## Git LFS

`frames/*.png` 由 Git LFS 管理。本目录不包含旧 ZIP、中间尝试图、人物自拍、人物三视图、成片或音频。克隆后运行 `git lfs pull` 获取七张PNG原文件。

## 明确排除

- 约 95.95 MB 的旧图片 ZIP及其中间图
- 约 43.9 MB 的本地交付 ZIP
- 旧版或未采用的 S06／S07
- 本地 `.agent-state/`
- 人物原始照片和过程版人物三视图
- 尚不存在的成片、预览片、音频与音乐
- 网站页面、作品数据和媒体清单修改
