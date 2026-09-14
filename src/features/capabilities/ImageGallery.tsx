import { ArrowIcon } from '../navigation/ArrowIcon';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useScrollLock } from '../../hooks/useScrollLock';
import { resolveMediaUrl } from '../../lib/media';
import './ImageGallery.css';

interface GalleryImage {
  id: string;
  title: string;
  src: string;
  width: number;
  height: number;
}

interface ImageGalleryProps {
  images: readonly GalleryImage[];
  title: string;
  initialIndex: number;
  opener: HTMLElement | null;
  onClose: () => void;
}

export function ImageGallery({ images, title, initialIndex, opener, onClose }: ImageGalleryProps) {
  const [index, setIndex] = useState(() => Math.max(0, Math.min(initialIndex, images.length - 1)));
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const settleRef = useRef<number | undefined>(undefined);
  const alignedRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickUntil = useRef(0);
  const wasZoomedRef = useRef(false);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const item = images[index];
  const select = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(next, images.length - 1)));
  }, [images.length]);
  useScrollLock(true);
  useFocusTrap(dialogRef, true, () => zoomed ? setZoomed(false) : onClose(), undefined, opener);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!track) { alignedRef.current = false; return; }
    if (track && slide && track.clientWidth) {
      track.scrollTo({ left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2, behavior: zoomed || reducedMotion || !alignedRef.current ? 'instant' : 'smooth' });
      alignedRef.current = true;
    }
    return () => window.clearTimeout(settleRef.current);
  }, [index, reducedMotion, zoomed]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!track || !slide) return;
    const measure = () => {
      const width = slide.offsetWidth;
      const height = slide.offsetHeight;
      if (!width || !height || !track.clientWidth || !track.clientHeight) return;
      // Measure the contained image, including wide/portrait letterboxing.
      const fit = Math.min(width / item.width, height / item.height);
      const scale = Math.min(track.clientWidth * 0.94 / (item.width * fit), track.clientHeight * 0.94 / (item.height * fit));
      slide.style.setProperty('--gallery-zoom-scale', String(scale));
      slide.style.setProperty('--gallery-zoom-x', `${track.clientWidth / 2 - (slide.offsetLeft - track.scrollLeft + width / 2)}px`);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(slide);
    return () => observer.disconnect();
  }, [index, item.width, item.height, zoomed]);

  useEffect(() => {
    if (zoomed || wasZoomedRef.current) {
      (trackRef.current?.children[index] as HTMLElement | undefined)?.focus({ preventScroll: true });
    }
    wasZoomedRef.current = zoomed;
  }, [index, zoomed]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || zoomed) return;
    let distance = 0;
    let lastEvent = 0;
    let blockedUntil = 0;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // Preserve browser pinch-to-zoom.
      event.preventDefault();
      const now = Date.now();
      if (now < blockedUntil) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const normalized = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientWidth : 1);
      if (now - lastEvent > 180 || Math.sign(normalized) !== Math.sign(distance)) distance = 0;
      lastEvent = now;
      distance += normalized;
      if (Math.abs(distance) < 40) return;
      const direction = Math.sign(distance);
      distance = 0;
      blockedUntil = now + 450;
      setIndex((current) => Math.max(0, Math.min(current + direction, images.length - 1)));
    };
    track.addEventListener('wheel', wheel, { passive: false });
    return () => track.removeEventListener('wheel', wheel);
  }, [images.length, zoomed]);

  const settleScroll = () => {
    window.clearTimeout(settleRef.current);
    if (zoomed) return;
    settleRef.current = window.setTimeout(() => {
      const track = trackRef.current;
      if (!track || !track.clientWidth) return;
      const center = track.scrollLeft + track.clientWidth / 2;
      let nearest = 0;
      let distance = Infinity;
      Array.from(track.children).forEach((child, position) => {
        const slide = child as HTMLElement;
        const delta = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center);
        if (delta < distance) { distance = delta; nearest = position; }
      });
      setIndex(nearest);
    }, 150);
  };

  return createPortal(
    <div className="image-gallery" data-text-reveal-skip data-zoomed={zoomed} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="image-gallery-title" tabIndex={-1}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLInputElement) return;
        const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? images.length - 1 : null;
        if (next !== null) { event.preventDefault(); select(next); }
      }}>
      <header className="image-gallery__header">
        <div><p>IMAGE COLLECTION / {images.length} PHOTOGRAPHS</p><h2 id="image-gallery-title">{title}</h2></div>
        <button className="image-gallery__control" type="button" onClick={onClose} aria-label="关闭相册">关闭 ×</button>
      </header>
        <div className="image-gallery__track" ref={trackRef} onScroll={settleScroll}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            touchStartRef.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
          }}
          onTouchMove={(event) => { if (event.touches.length !== 1) touchStartRef.current = null; }}
          onTouchCancel={() => { touchStartRef.current = null; }}
          onTouchEnd={(event) => {
            const start = touchStartRef.current;
            touchStartRef.current = null;
            const touch = event.changedTouches[0];
            if (!start || !touch) return;
            const dx = touch.clientX - start.x;
            const dy = touch.clientY - start.y;
            if (Math.hypot(dx, dy) > 12) suppressClickUntil.current = Date.now() + 400;
            if (zoomed && Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.2) select(index + (dx < 0 ? 1 : -1));
          }} aria-label="横向照片轮播">
          {images.map((image, position) => (
            <button key={image.id} type="button" className="image-gallery__slide" data-active={position === index}
              data-side={position < index ? 'left' : position > index ? 'right' : 'center'}
              aria-hidden={zoomed && position !== index ? true : undefined}
              aria-label={position === index ? `${zoomed ? '缩小' : '放大'}：${image.title}` : `切换到第${position + 1}张：${image.title}`}
              tabIndex={position === index ? 0 : -1}
              onClick={() => { if (Date.now() < suppressClickUntil.current) return; if (position === index) setZoomed((current) => !current); else select(position); }}>
              {Math.abs(position - index) <= 2 ? <img src={resolveMediaUrl(image.src) ?? undefined} alt={image.title} width={image.width} height={image.height} draggable={false} decoding="async" /> : null}
              <span className="image-gallery__enlarge" aria-hidden="true">查看大图 <ArrowIcon /></span>
            </button>
          ))}
        </div>
      <footer className="image-gallery__footer">
        <div className="image-gallery__navigation">
          <button className="image-gallery__control" type="button" disabled={index === 0} onClick={() => select(index - 1)} aria-label="上一张">←</button>
          <div className="image-gallery__caption" role="status"><span>{String(index + 1).padStart(2, '0')} / {images.length}</span><p>{item.title}</p></div>
          <button className="image-gallery__control" type="button" disabled={index === images.length - 1} onClick={() => select(index + 1)} aria-label="下一张">→</button>
        </div>
        <input className="image-gallery__scrubber" type="range" min={1} max={images.length} value={index + 1} aria-label="选择照片" aria-valuetext={`第${index + 1}张，共${images.length}张：${item.title}`} onChange={(event) => select(Number(event.target.value) - 1)} />
        <div className="image-gallery__help"><span>{zoomed ? '完整画幅 · 左右滑动换图 · 点击缩回' : '滚轮切换 · 左右滑动 · 点击大图'}</span>
          {zoomed ? <button type="button" onClick={() => setZoomed(false)}>返回轮播 <ArrowIcon direction="down-left" /></button> : null}
          <a href={resolveMediaUrl(item.src) ?? undefined} target="_blank" rel="noreferrer">打开图片 <ArrowIcon /></a>
        </div>
      </footer>
    </div>, document.body,
  );
}
