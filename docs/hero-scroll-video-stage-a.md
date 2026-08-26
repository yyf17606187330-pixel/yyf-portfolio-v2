# Hero 滚动视频 Stage A 交接

本阶段只提供可复用的滚动视频控制逻辑和本地媒体生成方法，不改 Hero 构图、`App.tsx`、全局样式或视觉入口。二进制媒体位于已忽略的 `public/media/hero/`，不得提交 Git。

## 本地媒体

固定运行时路径：

- `public/media/hero/hero-scroll.mp4`
- `public/media/hero/hero-poster.webp`

当前 Windows 工作树中的成品参数：

- 视频：H.264 High、yuv420p、BT.709、1104×816、24fps、6.041667 秒、145 帧、2,085,989 bytes
- 音轨：已移除
- 关键帧：GOP 6，每 0.25 秒一个 I 帧，共 25 个
- 海报：WebP、1104×816、31,810 bytes

媒体不随分支同步。Mac 接手时需要另行传输这两个衍生文件，或者取得原素材后在仓库根目录重新生成。

## 重新生成

先把 `SOURCE_VIDEO` 指向本机原素材，再运行：

```bash
mkdir -p public/media/hero

ffmpeg -hide_banner -n -i "$SOURCE_VIDEO" \
  -map 0:v:0 -an \
  -c:v libx264 -preset slow -crf 20 \
  -pix_fmt yuv420p -profile:v high -level:v 4.1 \
  -fps_mode passthrough \
  -g 6 -keyint_min 6 -sc_threshold 0 -bf 2 \
  -movflags +faststart \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  public/media/hero/hero-scroll.mp4

ffmpeg -hide_banner -n \
  -i public/media/hero/hero-scroll.mp4 \
  -map 0:v:0 -frames:v 1 \
  -c:v libwebp -quality 82 -compression_level 6 -lossless 0 \
  public/media/hero/hero-poster.webp
```

`-n` 会拒绝覆盖已有文件。需要重做时先人工确认并移走旧衍生文件，不要修改原素材。

复核编码、音轨和关键帧：

```bash
ffprobe -v error \
  -show_entries 'format=duration,size,bit_rate:stream=codec_name,profile,codec_type,width,height,pix_fmt,color_space,color_transfer,color_primaries,r_frame_rate,avg_frame_rate,nb_frames,bit_rate' \
  -of json public/media/hero/hero-scroll.mp4

ffprobe -v error -select_streams v:0 -skip_frame nokey \
  -show_entries frame=best_effort_timestamp_time,pict_type \
  -of csv=p=0 public/media/hero/hero-scroll.mp4
```

## Stage B 接入契约

`useScrollVideo` 接收 Hero 的 `triggerRef`、背景 `videoRef`、本地媒体路径，并返回可直接展开到 `<video>` 的 `videoProps`：

```tsx
const triggerRef = useRef<HTMLElement>(null);
const videoRef = useRef<HTMLVideoElement>(null);
const { videoProps } = useScrollVideo({
  triggerRef,
  videoRef,
  source: '/media/hero/hero-scroll.mp4',
  poster: '/media/hero/hero-poster.webp',
});
```

默认行为：

- 首次绘制只显示 poster，下一动画帧才挂载桌面视频并开始预加载。
- 仅在宽度至少 768px 且为 fine pointer 的设备启用视频；移动端、粗指针和 `prefers-reduced-motion` 只保留 poster。
- metadata 有效后建立 `pin + scrub`，默认滚动距离 1600px；滚动进度映射到 `currentTime`，向上滚会反向。
- 连续滚动更新合并为每个动画帧最多一次 seek；资源错误会移除视频源并回到 poster。
- 卸载、禁用或资源失败时撤销 GSAP context，并取消未执行的 seek 帧。

Stage B 仍需由视觉分支决定实际 DOM 和构图。容器应使用正常文档宽度并限制溢出，避免 `100vw` 引起滚动条；背景视频建议 `object-fit: cover`、`pointer-events: none`。不要因短暂打开导航或播放器而拆除 pin，现有 overlay 的滚动锁应负责阻止背景滚动。

当前 `useLenis` 尚未与 ScrollTrigger 建立统一更新通道。正式接入时由主控评估 `lenis.on('scroll', ScrollTrigger.update)` 和统一 ticker，避免两个 Agent 同时修改共享滚动入口。
