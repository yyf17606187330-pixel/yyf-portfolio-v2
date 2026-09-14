import { useEffect, useRef, type RefObject } from 'react';

function framePath(width: number, height: number) {
  const frameShape = width < 900
    ? [[0.08, 0.23], [0.86, 0.16], [0.98, 0.35], [0.9, 0.98], [0.05, 0.95]]
    : [[0.52, 0.23], [0.9, 0.12], [0.97, 0.34], [0.91, 0.98], [0.49, 0.89]];
  const path = new Path2D();
  frameShape.forEach(([x, y], index) => {
    const point = [x * width, y * height];
    if (index === 0) path.moveTo(point[0], point[1]);
    else path.lineTo(point[0], point[1]);
  });
  path.closePath();
  return path;
}

export function getHeroComposition(width: number, height: number, videoWidth: number, videoHeight: number) {
  const compact = width < 900;
  const dh = Math.min(height * 0.92, width * (compact ? 1.18 : 0.7));
  const dw = dh * videoWidth / videoHeight;
  return { dw, dh, dx: width * (compact ? 0.52 : 0.73) - dw * 0.56, dy: height * 0.07 };
}

/** Paint every layer from the same decoded frame, including when seeking backwards. */
export function HeroComposite({ videoRef, source, onReady }: {
  videoRef: RefObject<HTMLVideoElement | null>;
  source: string;
  onReady: (source: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || typeof Path2D === 'undefined') return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let callback: number | undefined;
    let disposed = false;
    let paintedKey = '';
    let announced = false;
    let foreground: typeof import('./heroForeground.json') | null = null;
    const paint = (time = video.currentTime) => {
      const matte = foreground;
      if (disposed || !matte || video.readyState < 2 || !video.videoWidth) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      const density = Math.min(window.devicePixelRatio || 1, 1.5);
      const frame = Math.min(matte.frames.length - 1, Math.max(0, Math.floor(time * matte.fps + 0.0001)));
      const key = `${frame}:${width}:${height}:${density}`;
      if (key === paintedKey) return;
      paintedKey = key;
      if (canvas.width !== Math.round(width * density) || canvas.height !== Math.round(height * density)) {
        canvas.width = Math.round(width * density);
        canvas.height = Math.round(height * density);
      }
      context.setTransform(density, 0, 0, density, 0, 0);
      context.clearRect(0, 0, width, height);
      const { dx, dy, dw, dh } = getHeroComposition(width, height, video.videoWidth, video.videoHeight);
      const panel = framePath(width, height);
      context.save();
      context.clip(panel);
      context.fillStyle = '#e6002b';
      context.fillRect(0, 0, width, height);
      context.drawImage(video, dx, dy, dw, dh);
      context.restore();
      context.strokeStyle = '#fff';
      context.lineWidth = width < 900 ? 7 : 10;
      context.lineJoin = 'miter';
      context.stroke(panel);
      // Offline head contours exclude the background's black speed lines.
      // Use the actual decoded frame time, not the requested scroll progress.
      const head = new Path2D();
      matte.frames[frame].forEach(([x, y], index) => {
        const cx = dx + x / matte.width * dw;
        const cy = dy + y / matte.height * dh;
        if (index === 0) head.moveTo(cx, cy);
        else head.lineTo(cx, cy);
      });
      head.closePath();
      // A graphic offset silhouette, matching the surrounding ink shapes.
      // Limit the shadow to the upper head so the matte's lower ROI cannot
      // create a horizontal shadow across the neck.
      context.save();
      context.beginPath();
      context.rect(0, 0, width, dy + dh * 0.52);
      context.clip();
      const offset = width < 900 ? 8 : 14;
      context.translate(offset, offset * 0.8);
      context.fillStyle = '#111';
      context.fill(head);
      context.restore();
      context.save();
      context.clip(head);
      context.drawImage(video, dx, dy, dw, dh);
      context.restore();
      if (!announced) { announced = true; onReady(source); }
    };
    const draw = () => paint();
    void import('./heroForeground.json').then(module => {
      if (disposed) return;
      foreground = module.default;
      draw();
    }).catch(() => {
      // Keep the normal framed video if the optional contour chunk cannot load.
    });
    const tick: VideoFrameRequestCallback = (_, metadata) => {
      paint(metadata.mediaTime);
      if (!disposed) callback = video.requestVideoFrameCallback(tick);
    };
    if (typeof video.requestVideoFrameCallback === 'function') callback = video.requestVideoFrameCallback(tick);
    video.addEventListener('loadeddata', draw);
    video.addEventListener('seeked', draw);
    video.addEventListener('timeupdate', draw);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(draw);
    observer?.observe(canvas);
    draw();
    return () => {
      disposed = true;
      observer?.disconnect();
      if (callback !== undefined) video.cancelVideoFrameCallback(callback);
      video.removeEventListener('loadeddata', draw);
      video.removeEventListener('seeked', draw);
      video.removeEventListener('timeupdate', draw);
    };
  }, [videoRef, source, onReady]);
  return <canvas className="p5-hero__composite" ref={canvasRef} aria-hidden="true" />;
}
