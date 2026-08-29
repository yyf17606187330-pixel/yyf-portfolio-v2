import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { AboutContent } from '../../content/about';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { resolveMediaUrl } from '../../lib/media';
import './AboutSection.css';

export type { AboutContent } from '../../content/about';

interface AboutSectionProps {
  content: AboutContent;
}

export function AboutSection({ content }: AboutSectionProps) {
  const titleId = 'about-title';
  const portraitFrameRef = useRef<HTMLDivElement>(null);
  const portraitVideoRef = useRef<HTMLVideoElement>(null);
  const portraitHoverVideoRef = useRef<HTMLVideoElement>(null);
  const portraitHoverAnimationRef = useRef<number | null>(null);
  const portraitHoverOriginRef = useRef({ x: 0, y: 0 });
  const portraitHoverRadiusRef = useRef(0);
  const portraitHoverPendingRef = useRef(false);
  const portraitHoverActiveRef = useRef(false);
  const portraitHoverRetractingRef = useRef(false);
  const portraitHoverShouldRestartRef = useRef(true);
  const portraitPrimaryCanPlayRef = useRef(false);
  const [portraitHasEntered, setPortraitHasEntered] = useState(false);
  const [portraitInViewport, setPortraitInViewport] = useState(false);
  const [portraitCompleted, setPortraitCompleted] = useState(false);
  const [portraitHoverActive, setPortraitHoverActive] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === 'visible');
  const [failedPortraitSource, setFailedPortraitSource] = useState<string | null>(null);
  const [failedPortraitHoverSource, setFailedPortraitHoverSource] = useState<string | null>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const hoverCapable = useMediaQuery('(hover: hover) and (pointer: fine)');
  const portrait = content.portrait;
  const portraitSource = portrait ? resolveMediaUrl(portrait.src) : null;
  const portraitPoster = portrait?.type === 'video' ? resolveMediaUrl(portrait.poster) : null;
  const portraitHoverSource = portrait?.type === 'video' && portrait.hover
    ? resolveMediaUrl(portrait.hover.src)
    : null;
  const showPortraitVideo = portrait?.type === 'video'
    && Boolean(portraitSource)
    && portraitHasEntered
    && !reducedMotion
    && failedPortraitSource !== portraitSource;
  const showPortraitHoverVideo = showPortraitVideo
    && hoverCapable
    && Boolean(portraitHoverSource)
    && failedPortraitHoverSource !== portraitHoverSource;
  portraitPrimaryCanPlayRef.current = portraitInViewport
    && pageVisible
    && showPortraitVideo
    && !portraitCompleted;

  const setPortraitHoverRadius = (radius: number) => {
    portraitHoverRadiusRef.current = radius;
    portraitFrameRef.current?.style.setProperty('--about-portrait-reveal-radius', `${radius}px`);
  };

  const animatePortraitHover = (
    targetRadius: number,
    duration: number,
    onComplete?: () => void,
  ) => {
    const frame = portraitFrameRef.current;
    if (!frame) return;

    if (portraitHoverAnimationRef.current !== null) {
      cancelAnimationFrame(portraitHoverAnimationRef.current);
    }

    const startRadius = portraitHoverRadiusRef.current;
    const startTime = performance.now();
    const tick = (time: number) => {
      const progress = Math.min(1, Math.max(0, (time - startTime) / duration));
      const eased = 1 - ((1 - progress) ** 3);
      setPortraitHoverRadius(startRadius + ((targetRadius - startRadius) * eased));

      if (progress < 1) {
        portraitHoverAnimationRef.current = requestAnimationFrame(tick);
      } else {
        portraitHoverAnimationRef.current = null;
        onComplete?.();
      }
    };

    portraitHoverAnimationRef.current = requestAnimationFrame(tick);
  };

  const resumePrimaryPortrait = () => {
    const video = portraitVideoRef.current;
    if (
      !video
      || !portraitPrimaryCanPlayRef.current
      || portraitHoverActiveRef.current
      || portraitHoverRetractingRef.current
    ) return;

    const playResult = video.play();
    if (playResult) void playResult.catch(() => undefined);
  };

  const startPortraitHover = () => {
    const frame = portraitFrameRef.current;
    const video = portraitHoverVideoRef.current;
    if (!frame || !video || !portraitHoverActiveRef.current) return;

    portraitHoverPendingRef.current = false;
    if (portraitHoverShouldRestartRef.current) {
      video.currentTime = portrait?.type === 'video' ? (portrait.hover?.startAt ?? 0) : 0;
      portraitHoverShouldRestartRef.current = false;
    }
    const playResult = video.play();
    if (playResult) void playResult.catch(() => undefined);

    const { height, width } = frame.getBoundingClientRect();
    const { x, y } = portraitHoverOriginRef.current;
    const targetRadius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) + 64;
    animatePortraitHover(targetRadius, 1000);
  };

  const handlePortraitPointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    const frame = portraitFrameRef.current;
    const video = portraitHoverVideoRef.current;
    if (!frame || !video || !showPortraitHoverVideo || event.pointerType === 'touch') return;

    const bounds = frame.getBoundingClientRect();
    const x = Math.min(bounds.width, Math.max(0, event.clientX - bounds.left));
    const y = Math.min(bounds.height, Math.max(0, event.clientY - bounds.top));
    portraitHoverOriginRef.current = { x, y };
    frame.style.setProperty('--about-portrait-reveal-x', `${x}px`);
    frame.style.setProperty('--about-portrait-reveal-y', `${y}px`);
    portraitHoverActiveRef.current = true;
    portraitHoverRetractingRef.current = false;
    setPortraitHoverActive(true);
    portraitVideoRef.current?.pause();

    if (video.readyState >= 2) {
      startPortraitHover();
    } else {
      portraitHoverPendingRef.current = true;
    }
  };

  const handlePortraitPointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    portraitHoverActiveRef.current = false;
    portraitHoverPendingRef.current = false;
    setPortraitHoverActive(false);
    portraitHoverVideoRef.current?.pause();
    portraitHoverRetractingRef.current = true;
    animatePortraitHover(0, 800, () => {
      if (portraitHoverActiveRef.current) return;
      portraitHoverRetractingRef.current = false;
      resumePrimaryPortrait();
    });
  };

  useEffect(() => {
    const frame = portraitFrameRef.current;

    if (portrait?.type !== 'video' || !portraitSource || reducedMotion || !frame) {
      return undefined;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setPortraitHasEntered(true);
      setPortraitInViewport(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        setPortraitInViewport(visible);
        if (visible) setPortraitHasEntered(true);
      },
      { threshold: 0.01 },
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, [portrait?.type, portraitSource, reducedMotion]);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    const video = portraitVideoRef.current;
    if (!video) return undefined;

    if (
      portraitPrimaryCanPlayRef.current
      && !portraitHoverActiveRef.current
      && !portraitHoverRetractingRef.current
    ) {
      const playResult = video.play();
      if (playResult) void playResult.catch(() => undefined);
    } else {
      video.pause();
    }

    return () => video.pause();
  }, [pageVisible, portraitCompleted, portraitInViewport, showPortraitVideo]);

  useEffect(() => {
    if (portraitInViewport && pageVisible) return;

    portraitHoverActiveRef.current = false;
    portraitHoverRetractingRef.current = false;
    portraitHoverPendingRef.current = false;
    setPortraitHoverActive(false);
    portraitHoverVideoRef.current?.pause();
    if (portraitHoverAnimationRef.current !== null) {
      cancelAnimationFrame(portraitHoverAnimationRef.current);
      portraitHoverAnimationRef.current = null;
    }
    setPortraitHoverRadius(0);
  }, [pageVisible, portraitInViewport]);

  useEffect(() => () => {
    if (portraitHoverAnimationRef.current !== null) {
      cancelAnimationFrame(portraitHoverAnimationRef.current);
    }
  }, []);

  return (
    <section
      aria-label={content.eyebrow}
      className="about-section"
      id="about"
    >
      <aside
        aria-label="关于我导览"
        className="about-section__transition"
        data-about-order="transition"
      >
        <div className="about-section__transition-inner">
          <p className="about-section__now">
            <span aria-hidden="true">•</span>
            {content.transition.now}
            <i aria-hidden="true" />
          </p>
          <dl className="about-section__transition-grid">
            {content.transition.items.map((item) => (
              <div key={item.id}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
                <small>{item.detail}</small>
              </div>
            ))}
          </dl>
        </div>
      </aside>

      <header className="about-section__header" data-about-order="title">
        <div className="about-section__chapter">
          <span>{content.sectionNumber}</span>
          <i aria-hidden="true" />
          <p>{content.eyebrow}</p>
        </div>
        <h2 aria-label={`${content.title.primary} ${content.title.accent}`} id={titleId}>
          <span>{content.title.primary}</span>
          <em>{content.title.accent}</em>
        </h2>
      </header>

      <div className="about-section__capability-rail" data-about-order="capabilities">
        <ul aria-label="核心能力">
          {content.capabilities.map((capability, index) => (
            <li aria-label={`能力：${capability}`} key={capability}>
              <span aria-hidden="true">{index === 0 ? '→' : '·'}</span>
              {capability}
            </li>
          ))}
        </ul>
      </div>

      <div className="about-section__editorial-grid">
        <p className="about-section__intro" data-about-order="intro">
          {content.intro}
        </p>

        <figure className="about-section__portrait" data-about-order="portrait">
          <div
            className="about-section__portrait-frame"
            data-hover-reveal={portraitHoverActive ? 'active' : 'inactive'}
            onPointerEnter={handlePortraitPointerEnter}
            onPointerLeave={handlePortraitPointerLeave}
            ref={portraitFrameRef}
            style={{ aspectRatio: '2 / 3' }}
          >
            {portrait?.type === 'video' && portraitPoster ? (
              <img
                alt={portrait.alt}
                className="about-section__portrait-poster"
                decoding="async"
                loading="lazy"
                src={portraitPoster}
                style={{ objectPosition: portrait.position ?? 'center' }}
              />
            ) : null}
            {showPortraitVideo && portrait?.type === 'video' && portraitSource ? (
              <video
                aria-hidden="true"
                className="about-section__portrait-video"
                muted
                playsInline
                poster={portraitPoster ?? undefined}
                preload="metadata"
                ref={portraitVideoRef}
                src={portraitSource}
                style={{ objectPosition: portrait.position ?? 'center' }}
                tabIndex={-1}
                onEnded={() => setPortraitCompleted(true)}
                onError={() => setFailedPortraitSource(portraitSource)}
              />
            ) : null}
            {showPortraitHoverVideo && portrait?.type === 'video' && portraitHoverSource ? (
              <video
                aria-hidden="true"
                className="about-section__portrait-hover-video"
                muted
                playsInline
                preload="auto"
                ref={portraitHoverVideoRef}
                src={portraitHoverSource}
                style={{ objectPosition: portrait.hover?.position ?? portrait.position ?? 'center' }}
                tabIndex={-1}
                onCanPlay={() => {
                  if (portraitHoverPendingRef.current) startPortraitHover();
                }}
                onEnded={() => {
                  portraitHoverShouldRestartRef.current = true;
                }}
                onError={() => {
                  portraitHoverActiveRef.current = false;
                  portraitHoverRetractingRef.current = false;
                  portraitHoverPendingRef.current = false;
                  portraitHoverShouldRestartRef.current = true;
                  setPortraitHoverActive(false);
                  setPortraitHoverRadius(0);
                  setFailedPortraitHoverSource(portraitHoverSource);
                }}
              />
            ) : null}
            {portrait?.type === 'image' && portraitSource ? (
              <img
                alt={portrait.alt}
                src={portraitSource}
                style={{ objectPosition: portrait.position ?? 'center' }}
              />
            ) : null}
            {!portrait ? (
              <div
                aria-label={content.portraitPlaceholder}
                className="about-section__portrait-placeholder"
                role="img"
              >
                <span>2 : 3 / PORTRAIT</span>
                <strong>{content.portraitPlaceholder}</strong>
              </div>
            ) : null}
          </div>
          <figcaption>PORTRAIT / WORKING IMAGE</figcaption>
        </figure>

        <div className="about-section__body" data-about-order="body">
          {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <p className="about-section__signature">
            <i aria-hidden="true">/</i>
            <strong>{content.signature.name}</strong>
            <span>{content.signature.role}</span>
          </p>
        </div>

        <section className="about-section__scope" data-about-order="scope">
          <header>
            <p>CAPABILITY RANGE</p>
            <h3>能力范围</h3>
          </header>
          <ol aria-label="能力范围">
            {content.capabilityGroups.map((group, index) => (
              <li key={group.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{group.title}</strong>
                  <p>{group.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="about-section__outcomes" data-about-order="outcomes">
          <header>
            <h3>实践与成果</h3>
            <span>VOL. 01 · '26</span>
          </header>
          <dl aria-label="实践与成果">
            {content.outcomes.map((outcome, index) => (
              <div key={outcome.id}>
                <dt>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {outcome.label}
                </dt>
                <dd>
                  <strong>{outcome.value}</strong>
                  <p>{outcome.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="about-section__footer" data-about-order="link">
          <div>
            {content.notes.map((note, index) => (
              <p key={note}><sup>{index + 1}</sup>{note}</p>
            ))}
          </div>
          <a href={content.worksLink.href}>
            {content.worksLink.label}
            <span aria-hidden="true">↘</span>
          </a>
        </footer>
      </div>
    </section>
  );
}
