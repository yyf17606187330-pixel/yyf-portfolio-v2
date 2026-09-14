import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { aiProductionContent, type AiVideoCapabilityItem } from '../../content/aiVideoCapability';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { resolveMediaUrl } from '../../lib/media';
import type { Project } from '../../types/portfolio';
import { AiImageCase } from './AiImageCase';
import './AiVideoCapabilitySection.css';

export interface AiVideoCapabilitySectionProps {
  items: readonly AiVideoCapabilityItem[];
  onOpenProject: (project: Project, opener: HTMLElement) => void;
  paused?: boolean;
}

interface AiVideoMediaProps {
  item: AiVideoCapabilityItem;
  active: boolean;
  reducedMotion: boolean;
  onOpenFullscreen: (event: MouseEvent<HTMLButtonElement>) => void;
}

function toPlayerProject(item: AiVideoCapabilityItem, index: number): Project {
  return {
    slug: `ai-video-preview-${item.id}`,
    title: item.title,
    category: 'ai-video',
    year: '',
    client: '',
    roles: [item.label],
    featured: true,
    order: index + 1,
    poster: item.poster ?? '',
    previewSrc: item.previewSrc ?? '',
    fullSrc: item.fullSrc ?? item.previewSrc ?? '',
    aspectRatio: item.aspectRatio ?? '16/9',
  };
}

function AiVideoMedia({ item, active, reducedMotion, onOpenFullscreen }: AiVideoMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === 'visible');
  const hasPreview = Boolean(item.previewSrc);
  const hasPlayableMedia = Boolean(item.fullSrc || item.previewSrc);
  const posterUrl = item.poster ? resolveMediaUrl(item.poster) : null;
  const previewUrl = item.previewSrc ? resolveMediaUrl(item.previewSrc) : null;
  const canPlay = hasPreview && !reducedMotion;
  const shouldMountVideo = canPlay && active && pageVisible;

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (active && shouldMountVideo) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }

    return () => video.pause();
  }, [active, item.previewSrc, pageVisible, shouldMountVideo]);

  const status = reducedMotion
    ? '按系统偏好保留封面'
    : item.previewSrc
      ? '悬停加载预览'
      : 'AI 视频媒体待接入';
  const ratioLabel = item.aspectRatio === '1472/632' ? '2.33 : 1' : item.aspectRatio?.replace('/', ' : ') ?? 'FORMAT TBD';

  return (
    <div
      className="ai-video-capability__media"
      data-media-ratio={item.aspectRatio ?? 'pending'}
      style={{ aspectRatio: item.aspectRatio ?? '16/9' }}
    >
      {posterUrl ? (
        <img alt={`${item.title}封面`} decoding="async" loading="lazy" src={posterUrl} />
      ) : null}
      {shouldMountVideo && previewUrl ? (
        <video
          aria-hidden="true"
          loop
          muted
          playsInline
          poster={posterUrl ?? undefined}
          preload={active ? 'metadata' : 'none'}
          ref={videoRef}
          src={previewUrl}
        />
      ) : null}
      {!item.poster && !shouldMountVideo ? (
        <span className="ai-video-capability__placeholder">
          {item.previewSrc ? '悬停后加载预览' : 'AI 视频媒体待接入'}
        </span>
      ) : null}
      <span className="ai-video-capability__ratio">{ratioLabel}</span>
      {hasPlayableMedia ? (
        <button
          aria-label={`打开${item.title}全屏预览`}
          className="ai-video-capability__preview-toggle"
          type="button"
          onClick={onOpenFullscreen}
        >
          <span>观看视频</span>
        </button>
      ) : (
        <span className="ai-video-capability__status">{status}</span>
      )}
    </div>
  );
}

export function AiVideoCapabilitySection({
  items,
  onOpenProject,
  paused = false,
}: AiVideoCapabilitySectionProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const galleryItems = items.filter((item) => item.placement !== 'intro');
  const featuredItem = galleryItems.find((item) => item.featured);
  const supportingItems = galleryItems.filter((item) => item !== featuredItem);

  const openFullscreen = (
    item: AiVideoCapabilityItem,
    index: number,
    opener: HTMLButtonElement,
  ) => {
    if (!item.fullSrc && !item.previewSrc) return;

    setActiveId(null);
    onOpenProject(toPlayerProject(item, index), opener);
  };

  const renderProjectCard = (item: AiVideoCapabilityItem) => {
    const hasMedia = Boolean(item.poster && item.fullSrc);

    return (
      <article
        aria-labelledby={`ai-project-${item.id}`}
        className={`ai-video-capability__card ai-video-capability__card--${item.featured ? 'featured' : 'supporting'}${hasMedia ? '' : ' ai-video-capability__card--text'}`}
        data-ai-video-card={item.id}
        data-orientation={item.orientation}
        data-has-preview={item.previewSrc ? 'true' : 'false'}
        key={item.id}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setActiveId((current) => (current === item.id ? null : current));
          }
        }}
        onFocus={() => {
          if (!paused && item.previewSrc && !reducedMotion) setActiveId(item.id);
        }}
        onPointerEnter={(event) => {
          if (!paused && event.pointerType !== 'touch' && item.previewSrc && !reducedMotion) {
            setActiveId(item.id);
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== 'touch') {
            setActiveId((current) => (current === item.id ? null : current));
          }
        }}
      >
        {hasMedia ? (
          <AiVideoMedia
            active={!paused && activeId === item.id}
            item={item}
            reducedMotion={reducedMotion}
            onOpenFullscreen={(event) => openFullscreen(item, items.indexOf(item), event.currentTarget)}
          />
        ) : null}
        <div className="ai-video-capability__meta">
          <div className="ai-video-capability__meta-topline">
            <p>{item.label}</p>
            {item.aspectRatio ? <span>{item.aspectRatio === '1472/632' ? '2.33:1' : item.aspectRatio.replace('/', ':')}</span> : null}
          </div>
          <h3 id={`ai-project-${item.id}`}>{item.title}</h3>
          <p>{item.description}</p>
        </div>
        {item.result ? (
          <dl className="ai-video-capability__practice-result">
            <div>
              <dt>{item.result.label}</dt>
              <dd>{item.result.value}</dd>
            </div>
          </dl>
        ) : null}
      </article>
    );
  };

  return (
    <section
      aria-label={aiProductionContent.title}
      className="ai-video-capability"
      id="ai-video"
    >
      <div className="ai-video-capability__inner">
        <div className="ai-video-capability__chapter" aria-hidden="true">
          <span>AI CREATION</span>
          <i />
          <p>影像创作与内容生产</p>
        </div>

        <header className="ai-video-capability__heading-grid">
          <h2 id="ai-video-capability-title">
            <span>{aiProductionContent.title}</span>
          </h2>
          <p>{aiProductionContent.intro}</p>
        </header>

        <div className="ai-video-capability__practice-grid">
          {featuredItem ? renderProjectCard(featuredItem) : null}
          <article className="ai-video-capability__practice" aria-labelledby="ai-delivery-title">
            <div>
              <p className="ai-video-capability__practice-label">{aiProductionContent.delivery.label}</p>
              <h3 id="ai-delivery-title">{aiProductionContent.delivery.title}</h3>
              <p className="ai-video-capability__practice-description">{aiProductionContent.delivery.description}</p>
            </div>
            <dl className="ai-video-capability__practice-result">
              <div>
                <dt>{aiProductionContent.delivery.resultLabel}</dt>
                <dd>{aiProductionContent.delivery.result}</dd>
              </div>
            </dl>
          </article>
        </div>

        {supportingItems.length > 0 ? (
          <div className="ai-video-capability__media-grid" aria-label="AI 影像作品">
            {supportingItems.map(renderProjectCard)}
          </div>
        ) : null}
        <AiImageCase />
      </div>
    </section>
  );
}
