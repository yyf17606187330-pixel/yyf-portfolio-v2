import { useEffect, useRef, useState } from 'react';
import { resolveMediaUrl } from '../../lib/media';
import type { Project } from '../../types/portfolio';

interface LazyPreviewProps {
  project: Project;
}

export function LazyPreview({ project }: LazyPreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const posterUrl = resolveMediaUrl(project.poster);
  const previewUrl = resolveMediaUrl(project.previewSrc);

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame || !previewUrl || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '320px 0px' },
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, [previewUrl]);

  return (
    <div
      className="lazy-preview"
      ref={frameRef}
      style={{ aspectRatio: project.aspectRatio }}
    >
      {posterUrl ? <img alt="" aria-hidden="true" src={posterUrl} /> : null}
      {nearViewport && previewUrl ? (
        <video aria-hidden="true" autoPlay loop muted playsInline preload="metadata" src={previewUrl} />
      ) : null}
      {!posterUrl && !(nearViewport && previewUrl) ? (
        <span className="lazy-preview__placeholder">作品封面 / 预览待替换</span>
      ) : null}
      <span className="lazy-preview__grain" aria-hidden="true" />
    </div>
  );
}
