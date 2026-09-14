import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { jobProfile } from '../../content/jobProfile';
import { useScrollVideo } from '../../hooks/useScrollVideo';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export interface HeroPortrait {
  objectPosition: string;
  scale: number;
  src: string;
  tone: 'dark' | 'light';
}

interface HeroProps {
  headerRef?: RefObject<HTMLElement | null>;
  worksHref?: string;
  portrait: HeroPortrait;
  paused?: boolean;
  onReady?: () => void;
  scrollVideo?: {
    poster: string;
    source: string;
  };
}

export function Hero({ headerRef, portrait, scrollVideo, worksHref = '#top', paused = false, onReady }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const primaryStoryRef = useRef<HTMLDivElement>(null);
  const secondaryStoryRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fitsViewport, setFitsViewport] = useState(true);
  const [failedPoster, setFailedPoster] = useState<string | null>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const poster = scrollVideo?.poster && failedPoster !== scrollVideo.poster
    ? scrollVideo.poster
    : portrait.src;

  useLayoutEffect(() => {
    const inner = innerRef.current;
    const primary = primaryStoryRef.current;
    const secondary = secondaryStoryRef.current;
    const cta = ctaRef.current;

    if (!inner || !primary || !secondary || !cta) {
      return undefined;
    }

    const measure = () => {
      const style = window.getComputedStyle(inner);
      const padding = (Number.parseFloat(style.paddingTop) || 0)
        + (Number.parseFloat(style.paddingBottom) || 0);
      const lines = primary.querySelectorAll<HTMLElement>('.hero__story-line');
      const firstLine = lines[0];
      const lastLine = lines[lines.length - 1];
      const primaryHeight = firstLine && lastLine
        ? lastLine.offsetTop + lastLine.offsetHeight - firstLine.offsetTop
        : 0;
      const contentHeight = Math.max(primaryHeight || primary.offsetHeight, secondary.offsetHeight);
      // In the pinned layout the same CTA space is already part of the inner padding.
      const ctaSpace = heroRef.current?.classList.contains('hero--scroll-story')
        ? 0
        : cta.offsetHeight + (Number.parseFloat(window.getComputedStyle(cta).marginTop) || 0);

      if (contentHeight > 0) {
        setFitsViewport(contentHeight + ctaSpace <= window.innerHeight - padding + 1);
      }
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(primary);
    observer?.observe(secondary);
    observer?.observe(cta);
    window.addEventListener('resize', measure);
    measure();

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);
  const storyAnimationRef = useRef<{
    context: ReturnType<typeof gsap.context>;
    timeline: ReturnType<typeof gsap.timeline>;
  } | null>(null);
  const clearStoryAnimation = useCallback(() => {
    storyAnimationRef.current?.context.revert();
    storyAnimationRef.current = null;
  }, []);
  const updateStoryProgress = useCallback((progress: number | null) => {
    if (progress === null) {
      clearStoryAnimation();
      return;
    }

    const hero = heroRef.current;
    const media = mediaRef.current;
    const header = headerRef?.current ?? null;
    const marker = markerRef.current;
    const primary = primaryStoryRef.current;
    const secondary = secondaryStoryRef.current;

    if (!hero || !media || !marker || !primary || !secondary) {
      return;
    }

    if (!storyAnimationRef.current) {
      let timeline: ReturnType<typeof gsap.timeline> | null = null;
      const context = gsap.context(() => {
        const primaryLines = primary.querySelectorAll('.hero__story-line');
        const cta = primary.querySelector('.hero__cta');
        const durationAnchor = { progress: 0 };

        timeline = gsap.timeline({ paused: true });
        timeline.to(durationAnchor, { duration: 1, ease: 'none', progress: 1 }, 0);
        timeline.fromTo(
          media,
          { scale: 1 },
          { duration: 0.8, ease: 'none', scale: 1.1 },
          0.04,
        );
        if (header) {
          timeline.fromTo(
            header,
            { autoAlpha: 0, y: -16 },
            {
              autoAlpha: 1,
              duration: 0.4,
              ease: 'sine.inOut',
              y: 0,
            },
            0.16,
          );
        }
        timeline.fromTo(
          marker,
          { autoAlpha: 0, x: 14 },
          {
            autoAlpha: 1,
            duration: 0.4,
            ease: 'sine.inOut',
            x: 0,
          },
          0.16,
        );
        timeline.fromTo(
          cta,
          { autoAlpha: 0, scale: 0.98, y: 12 },
          {
            autoAlpha: 1,
            duration: 0.18,
            ease: 'sine.inOut',
            scale: 1,
            y: 0,
          },
          0.82,
        );
        timeline.to(
          primaryLines,
          {
            autoAlpha: 0,
            filter: 'blur(5px)',
            duration: 0.16,
            ease: 'power1.out',
            stagger: 0.02,
            y: -24,
          },
          0.08,
        );
        timeline.fromTo(
          secondary,
          { autoAlpha: 0, y: 28, filter: 'blur(10px)' },
          {
            autoAlpha: 1,
            filter: 'blur(0px)',
            duration: 0.18,
            ease: 'power1.out',
            y: 0,
          },
          0.68,
        );
      }, hero);

      if (timeline) {
        storyAnimationRef.current = { context, timeline };
      }
    }

    storyAnimationRef.current?.timeline.progress(Math.min(Math.max(progress, 0), 1));
  }, [clearStoryAnimation, headerRef]);

  useEffect(() => clearStoryAnimation, [clearStoryAnimation]);

  const { motionEligible, motionEnabled, videoProps } = useScrollVideo({
    enabled: fitsViewport,
    onProgress: updateStoryProgress,
    poster,
    source: scrollVideo?.source ?? null,
    triggerRef: heroRef,
    videoRef,
  });

  useEffect(() => {
    // Reuse the mounted Hero video: the opening never starts a second download.
    if (!motionEligible || (videoProps.src && (videoRef.current?.readyState ?? 0) >= 2)) onReady?.();
  }, [motionEligible, onReady, videoProps.src]);

  useLayoutEffect(() => {
    const hashTarget = document.getElementById(window.location.hash.slice(1));
    const openedPastHero = window.location.hash !== '#top'
      && Boolean(hashTarget)
      && !heroRef.current?.contains(hashTarget);

    if (!motionEligible) {
      return undefined;
    }

    if (openedPastHero) {
      const context = gsap.context(() => {
        gsap.set(markerRef.current, { autoAlpha: 1, x: 0 });
      }, heroRef);
      return () => context.revert();
    }

    // Hide before the first paint, not only after asynchronous video metadata arrives.
    const controls = [headerRef?.current, markerRef.current, ctaRef.current]
      .filter((element): element is HTMLElement => Boolean(element));
    const context = gsap.context(() => {
      gsap.set(controls, { autoAlpha: 0 });
    }, heroRef);

    return () => {
      clearStoryAnimation();
      context.revert();
    };
  }, [clearStoryAnimation, headerRef, motionEligible]);

  useLayoutEffect(() => {
    const marker = markerRef.current;
    if (motionEligible || !marker) return undefined;
    let animation: gsap.core.Tween;
    const context = gsap.context(() => {
      animation = gsap.fromTo(marker, { autoAlpha: 0, x: 14 }, {
        autoAlpha: 1, x: 0, duration: 1, ease: 'sine.inOut', paused: true,
      });
    }, heroRef);
    let initial = true;
    let frame: number | null = null;
    const update = () => {
      frame = null;
      const target = document.getElementById(window.location.hash.slice(1));
      const openedPastHero = initial && window.location.hash !== '#top'
        && Boolean(target) && !heroRef.current?.contains(target);
      const progress = Math.min(1, Math.max(0, (window.scrollY / window.innerHeight - 0.16) / 0.4));
      animation.progress(openedPastHero ? 1 : reducedMotion ? Number(window.scrollY > 0) : progress);
      initial = false;
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      context.revert();
    };
  }, [motionEligible, reducedMotion]);

  const heroStyle = {
    '--hero-image-position': portrait.objectPosition,
    '--hero-image-scale': portrait.scale,
  } as CSSProperties;

  return (
    <section
      aria-labelledby="hero-title"
      className={`hero hero--${portrait.tone}${motionEnabled ? ' hero--scroll-story' : ''}`}
      ref={heroRef}
      style={heroStyle}
    >
      <div className="hero__media" aria-hidden={!poster} ref={mediaRef}>
        {poster ? (
          <img
            alt="杨玉峰个人肖像"
            decoding="async"
            fetchPriority="high"
            onError={poster !== portrait.src ? () => setFailedPoster(poster) : undefined}
            sizes="100vw"
            src={poster}
          />
        ) : (
          <span className="hero__media-placeholder">肖像待替换</span>
        )}
        {scrollVideo ? (
          <video
            {...videoProps}
            aria-hidden="true"
            className="hero__scroll-video"
            onLoadedData={onReady}
            onError={(event) => { videoProps.onError?.(event); onReady?.(); }}
            ref={videoRef}
            tabIndex={-1}
          />
        ) : null}
      </div>
      <div className="hero__inner" ref={innerRef}>
        <div className="hero__copy">
          <div className="hero__story-panel hero__story-panel--primary" ref={primaryStoryRef} data-text-reveal-group>
            <h1 className="hero__story-line" id="hero-title"><span className="hero__text-reveal" data-text-reveal>杨玉峰</span></h1>
            <p className="hero__positioning hero__story-line">
              <span className="hero__text-reveal" data-text-reveal>{jobProfile.positioning}</span>
              <span className="hero__availability" data-text-reveal>求职 · {jobProfile.cities} · {jobProfile.focus}</span>
            </p>
            <p className="hero__emphasis hero__story-line"><span className="hero__text-reveal" data-text-reveal>懂运营，也能把内容从脚本拍到成片。</span></p>
            <p className="hero__bio hero__story-line">
              <span className="hero__text-reveal" data-text-reveal>负责内容策划、拍摄剪辑与调色，也制作 AI 影像。商业项目中，我把内容制作、发布投放和数据复盘连起来。</span>
            </p>
            <a className="hero__cta" href={worksHref} ref={ctaRef}><span className="paper-control__label">查看作品</span></a>
          </div>
          <div className="hero__story-panel hero__story-panel--secondary" ref={secondaryStoryRef}>
            <h2 className="hero__proof-heading">经验与成果</h2>
            <dl className="hero__proof-grid">
              <div className="hero__proof-item">
                <dt>7年</dt>
                <dd>内容／电商／直播运营经验</dd>
              </div>
              <div className="hero__proof-item">
                <dt>800万+</dt>
                <dd>项目年 GMV<span>持续推动业务增长</span></dd>
              </div>
              <div className="hero__proof-item">
                <dt>100+</dt>
                <dd>参与拍摄项目<span>具备编导能力</span></dd>
              </div>
              <div className="hero__proof-item">
                <dt>0→1</dt>
                <dd>个人 IP 与电商起号<span>从定位、内容策划到运营增长</span></dd>
              </div>
            </dl>
            <p className="hero__proof-summary">
              用运营理解受众，用编导组织表达，用达芬奇与 Seedance 完成影像，再用增长结果验证内容。
            </p>
          </div>
        </div>
      </div>
      {createPortal(
        <div aria-label="邮箱联系标识" className="hero__marker" hidden={paused} ref={markerRef}>
          <a aria-label="回到开场" className="hero__marker-initial" href="#top">Y.</a>
          <a aria-label="查看邮箱与求职信息" className="hero__marker-contact" href="#contact" inert={paused ? true : undefined}>
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 6 9 7 9-7" />
            </svg>
          </a>
        </div>,
        document.body,
      )}
    </section>
  );
}
