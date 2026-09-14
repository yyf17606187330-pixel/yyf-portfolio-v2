import { ArrowIcon } from '../../../features/navigation/ArrowIcon';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { AboutContent } from '../../content/about';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { resolveMediaUrl } from '../../lib/media';
import { SkillCards } from './SkillCards';
import './AboutSection.css';

export type { AboutContent } from '../../content/about';

interface AboutSectionProps {
  content: AboutContent;
  paused?: boolean;
}

export function AboutSection({ content, paused = false }: AboutSectionProps) {
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
    && Boolean(portraitHoverSource)
    && failedPortraitHoverSource !== portraitHoverSource;
  portraitPrimaryCanPlayRef.current = portraitInViewport
    && pageVisible
    && !paused
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
    if (!frame || !video || paused || !portraitHoverActiveRef.current) return;

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

  const activatePortrait = (clientX: number, clientY: number, fromTap = false) => {
    const frame = portraitFrameRef.current;
    const video = portraitHoverVideoRef.current;
    if (!frame || !video || paused || !showPortraitHoverVideo) return;

    const bounds = frame.getBoundingClientRect();
    const x = Math.min(bounds.width, Math.max(0, clientX - bounds.left));
    const y = Math.min(bounds.height, Math.max(0, clientY - bounds.top));
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
      // Unlock iOS playback within the tap, while keeping the poster until canplay.
      if (fromTap) {
        const attempt = video.play();
        if (attempt) void attempt.catch(() => {
          portraitHoverActiveRef.current = false;
          portraitHoverPendingRef.current = false;
          setPortraitHoverActive(false);
          setPortraitHoverRadius(0);
          resumePrimaryPortrait();
        });
      }
    }
  };

  const handlePortraitPointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!hoverCapable || event.pointerType === 'touch') return;
    activatePortrait(event.clientX, event.clientY);
  };

  const deactivatePortrait = () => {
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

  const handlePortraitPointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (hoverCapable && event.pointerType !== 'touch') deactivatePortrait();
  };
  const togglePortrait = () => {
    if (portraitHoverActiveRef.current) { deactivatePortrait(); return; }
    const bounds = portraitFrameRef.current?.getBoundingClientRect();
    if (bounds) activatePortrait(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, true);
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
  }, [pageVisible, paused, portraitCompleted, portraitInViewport, showPortraitVideo]);

  useEffect(() => {
    if (portraitInViewport && pageVisible && !paused) return;

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
  }, [pageVisible, paused, portraitInViewport]);

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
      <div className="about-section__editorial-grid">
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
        <p className="about-section__intro" data-about-order="intro">
          {content.intro}
        </p>

        <section className="about-section__scope" data-about-order="scope">
          <header>
            <h3>技能与工作方式</h3>
            <p>CAPABILITIES / 06</p>
          </header>
          <SkillCards groups={content.capabilityGroups} paused={paused}>
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
                      if (portraitHoverAnimationRef.current !== null) {
                        cancelAnimationFrame(portraitHoverAnimationRef.current);
                        portraitHoverAnimationRef.current = null;
                      }
                      portraitHoverActiveRef.current = false;
                      portraitHoverRetractingRef.current = false;
                      portraitHoverPendingRef.current = false;
                      portraitHoverShouldRestartRef.current = true;
                      setPortraitHoverActive(false);
                      setPortraitHoverRadius(0);
                      setFailedPortraitHoverSource(portraitHoverSource);
                      resumePrimaryPortrait();
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
                {showPortraitHoverVideo && !hoverCapable ? <button type="button" className="about-section__portrait-toggle"
                  aria-label={portraitHoverActive ? '返回人物画面' : '切换人物视频'} aria-pressed={portraitHoverActive}
                  disabled={paused} onClick={togglePortrait}>
                  <span>{portraitHoverActive ? '点击返回人物画面' : '点击切换人物视频'}</span>
                </button> : null}
              </div>
              <figcaption>PORTRAIT / WORKING IMAGE</figcaption>
            </figure>
          </SkillCards>
        </section>

        <div className="about-section__body" data-about-order="body">
          {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <p className="about-section__signature">
            <i aria-hidden="true">/</i>
            <strong>{content.signature.name}</strong>
            <span>{content.signature.role}</span>
          </p>
        </div>

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
                  <strong className="outcome-value" aria-label={outcome.value}
                    data-numeric={/^\d/.test(outcome.value)}>
                    <span aria-hidden="true" className="outcome-value__core">
                      {[...(/^\d/.test(outcome.value) ? outcome.value.match(/^\d+/)![0] : outcome.value)].map((character, characterIndex) => (
                        <span className="outcome-value__character" key={characterIndex}>{character}</span>
                      ))}
                    </span>
                    {/^\d/.test(outcome.value) ? <small aria-hidden="true" className="outcome-value__unit">{outcome.value.replace(/^\d+/, '')}</small> : null}
                  </strong>
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
            <span aria-hidden="true"><ArrowIcon direction="down-right" /></span>
          </a>
        </footer>
      </div>
    </section>
  );
}
