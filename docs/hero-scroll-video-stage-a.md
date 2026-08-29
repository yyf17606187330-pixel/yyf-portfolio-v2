# Hero 滚动视频媒体与控制约定

本文件记录 Stage A 控制逻辑及后续 Hero 集成使用的媒体生成方法。二进制媒体位于已忽略的 `public/media/hero/`，不得提交 Git。原视频保持不动，替换前先备份旧衍生素材。

## 本地媒体

固定运行时路径：

- `public/media/hero/hero-scroll.mp4`
- `public/media/hero/hero-poster.webp`

当前 Windows 工作树中的成品参数：

- 视频：H.264 High、yuv420p、BT.709、1920×1080、30fps、5.133333 秒、154 帧、4,962,193 bytes
- 音轨：已移除
- 关键帧：GOP 6，每 0.2 秒一个 I 帧，共 26 个；无 B 帧，faststart
- 最后一帧时间为 5.10 秒，避开原片尾部眨眼；这是本次素材选择，不应硬编码到通用 hook 中
- 海报：从上述成品首帧生成的 WebP、1920×1080、72,192 bytes；与视频共用构图和焦点

当前临时视频为此前的加强柔焦版本：`gblur=sigma=1.2:steps=3:planes=1`，不加颗粒、泛光或调色；保留1080p、CRF18、154帧、5.10秒末帧和原有构图/文案/10%滚动聚焦。用户已判断是视频素材本身的问题，正在重新生成；本轮静帧叠化已被否定并撤回，当前恢复原视频收尾。新片到位后重新选取末帧、核对构图，不自动沿用旧片的柔焦参数。

柔焦在转码阶段处理亮度层，未对色度层施加模糊，也不对页面文字/按钮添加 CSS filter。原1080p和更早900p衍生素材均有本地备份。

媒体不随分支同步。Mac 接手或发布时需要另行提供视频与首帧 poster 两个运行时文件，或者取得原素材后重新生成。

## 已停用的收尾图

`public/media/hero/hero-ending.webp`（2752×1536、255,088 bytes）保留在本机忽略目录，但 App/Hero 已移除引用，不再请求或显示。原始 JPEG 未修改、未删除。当前不要重新接入静帧叠化；完整备份有需要时可额外传此图，它不是当前运行时依赖。

## 重新生成

先把 `SOURCE_VIDEO` 指向本机原素材，再运行：

```bash
mkdir -p public/media/hero

ffmpeg -hide_banner -n -i "$SOURCE_VIDEO" \
  -map 0:v:0 -an -sn -dn -map_metadata -1 -map_chapters -1 \
  -vf 'setsar=1,gblur=sigma=1.2:steps=3:planes=1' \
  -r 30 -fps_mode cfr -frames:v 154 \
  -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p -profile:v high -level:v 4.1 \
  -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 \
  -movflags +faststart \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  public/media/hero/hero-scroll.mp4

ffmpeg -hide_banner -n \
  -i public/media/hero/hero-scroll.mp4 \
  -map 0:v:0 -frames:v 1 \
  -vf 'scale=in_color_matrix=bt709:out_color_matrix=bt601:in_range=tv:out_range=tv,format=yuv420p' \
  -c:v libwebp -quality 92 -compression_level 6 -lossless 0 \
  public/media/hero/hero-poster.webp
```

`-n` 会拒绝覆盖已有文件。需要重做时先确认并备份旧衍生文件，不要修改原素材。`-frames:v 154` 仅适用于本次 30fps 素材；更换视频时重新选取开眼且构图稳定的末帧。

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
- 仅在宽度至少 1024px 且为 fine pointer 的设备启用视频；移动端、粗指针和 `prefers-reduced-motion` 只保留 poster。
- `motionEnabled` 仅在有效 metadata 就绪后成立；Hero 还会测量两幕文案是否能放进视口，放不下时禁用 pin 并完整静态显示。
- `motionEligible` 在首帧即指明是否为可加载视频的桌面场景；Hero 据此在绘制前隐藏控件，不等 metadata 才隐藏。视频错误、非法时长或降级时恢复静态控件。
- metadata 有效后建立 `pin + scrub`，默认滚动距离 1600px；滚动进度映射到 `currentTime`，向上滚会反向。
- 连续滚动更新合并为每个动画帧最多一次 seek；资源错误会移除视频源并回到 poster。
- 卸载、禁用或资源失败时撤销 GSAP context，并取消未执行的 seek 帧。

当前 Hero 已整合完整首屏和 2×2 成果末帧，并在共享滚动进度上增加 10% 媒体缩放。背景采用 `object-fit: cover`、`pointer-events: none`，图片与视频共用容器，避免首帧跳变。不要因短暂打开导航或播放器而拆除 pin；未来接回 overlay 时由其滚动锁负责阻止背景滚动。

顶部与侧边按钮在 16%–56% 进度渐显，查看作品延后到 82%–100%，均使用 sine.inOut 并保持到末屏，回滚至开场重新隐藏；首屏文案渐隐、成果渐显的方向与时间不变。桌面 CTA 独立定位到左下预留区，适配测量包含按钮所需空间，静态降级仍在文档流中。

当前 `useLenis` 尚未与 ScrollTrigger 建立统一更新通道。正式接入时由主控评估 `lenis.on('scroll', ScrollTrigger.update)` 和统一 ticker，避免两个 Agent 同时修改共享滚动入口。
