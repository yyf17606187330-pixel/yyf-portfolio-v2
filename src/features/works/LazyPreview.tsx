import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { resolveMediaUrl } from '../../lib/media';
import type { Project } from '../../types/portfolio';

interface LazyPreviewProps {
  project: Project;
  enabled?: boolean;
}

export function LazyPreview({ project, enabled = true }: LazyPreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const [inViewport, setInViewport] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === 'visible');
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const posterUrl = resolveMediaUrl(project.poster);
  const previewUrl = resolveMediaUrl(project.previewSrc);
  const showVideo = enabled
    && hasEnteredViewport
    && previewUrl
    && !reducedMotion
    && failedSource !== previewUrl;

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame || !previewUrl || reducedMotion || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        setInViewport(visible);
        if (visible) {
          setHasEnteredViewport(true);
        }
      },
      { threshold: 0.01 },
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, [previewUrl, reducedMotion]);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (enabled && inViewport && pageVisible && showVideo) {
      // A rejected silent autoplay leaves the poster; full playback is still clickable.
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }

    return () => video.pause();
  }, [enabled, inViewport, pageVisible, showVideo]);

  return (
    <div
      className="lazy-preview"
      ref={frameRef}
      style={{ aspectRatio: project.aspectRatio }}
    >
      {posterUrl ? <img alt="" aria-hidden="true" decoding="async" loading="lazy" src={posterUrl} /> : null}
      {showVideo && previewUrl ? (
        <video
          aria-hidden="true"
          key={previewUrl}
          ref={videoRef}
          loop
          muted
          playsInline
          poster={posterUrl ?? undefined}
          preload="metadata"
          src={previewUrl}
          tabIndex={-1}
          onError={() => setFailedSource(previewUrl)}
        />
      ) : null}
      {!posterUrl && !showVideo ? (
        <span className="lazy-preview__placeholder">作品封面 / 预览待替换</span>
      ) : null}
      {!posterUrl && !previewUrl ? <span className="lazy-preview__grain" aria-hidden="true" /> : null}
    </div>
  );
}
