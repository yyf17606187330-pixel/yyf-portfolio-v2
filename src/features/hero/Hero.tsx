import { useCallback, useEffect, useRef } from 'react';
import type { CSSProperties, RefObject } from 'react';
import gsap from 'gsap';
import { useScrollVideo } from '../../hooks/useScrollVideo';

export interface HeroPortrait {
  objectPosition: string;
  scale: number;
  src: string;
  tone: 'dark' | 'light';
}

interface HeroProps {
  headerRef?: RefObject<HTMLElement | null>;
  portrait: HeroPortrait;
  scrollVideo?: {
    poster: string;
    source: string;
  };
}

export function Hero({ headerRef, portrait, scrollVideo }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const primaryStoryRef = useRef<HTMLDivElement>(null);
  const secondaryStoryRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
    const header = headerRef?.current ?? null;
    const marker = markerRef.current;
    const primary = primaryStoryRef.current;
    const secondary = secondaryStoryRef.current;

    if (!hero || !marker || !primary || !secondary) {
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
        if (header) {
          timeline.to(
            header,
            {
              autoAlpha: 0,
              duration: 0.14,
              ease: 'power1.out',
              y: -16,
            },
            0.04,
          );
        }
        timeline.to(
          marker,
          {
            autoAlpha: 0,
            duration: 0.14,
            ease: 'power1.out',
            x: 14,
          },
          0.06,
        );
        timeline.to(
          cta,
          {
            autoAlpha: 0,
            duration: 0.12,
            ease: 'power1.out',
            scale: 0.98,
            y: -12,
          },
          0.06,
        );
        timeline.to(
          primaryLines,
          {
            autoAlpha: 0,
            duration: 0.16,
            ease: 'power1.out',
            stagger: 0.02,
            y: -24,
          },
          0.08,
        );
        timeline.fromTo(
          secondary,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            duration: 0.16,
            ease: 'power1.out',
            y: 0,
          },
          0.54,
        );
      }, hero);

      if (timeline) {
        storyAnimationRef.current = { context, timeline };
      }
    }

    storyAnimationRef.current?.timeline.progress(Math.min(Math.max(progress, 0), 1));
  }, [clearStoryAnimation, headerRef]);

  useEffect(() => clearStoryAnimation, [clearStoryAnimation]);

  const { motionEnabled, videoProps } = useScrollVideo({
    onProgress: updateStoryProgress,
    poster: scrollVideo?.poster ?? portrait.src,
    source: scrollVideo?.source ?? null,
    triggerRef: heroRef,
    videoRef,
  });
  const heroStyle = {
    '--hero-image-position': portrait.objectPosition,
    '--hero-image-scale': portrait.scale,
  } as CSSProperties;
  const cta = <a className="hero__cta" href="#top">查看作品</a>;

  return (
    <section
      aria-labelledby="hero-title"
      className={`hero hero--${portrait.tone}${motionEnabled ? ' hero--scroll-story' : ''}`}
      ref={heroRef}
      style={heroStyle}
    >
      <div className="hero__media" aria-hidden={!portrait.src}>
        {portrait.src ? (
          <img
            alt="杨玉峰个人肖像"
            decoding="async"
            fetchPriority="high"
            sizes="100vw"
            src={portrait.src}
          />
        ) : (
          <span className="hero__media-placeholder">肖像待替换</span>
        )}
        {scrollVideo ? (
          <video
            {...videoProps}
            aria-hidden="true"
            className="hero__scroll-video"
            ref={videoRef}
            tabIndex={-1}
          />
        ) : null}
      </div>
      <div className="hero__inner">
        <div className="hero__copy">
          <div className="hero__story-panel hero__story-panel--primary" ref={primaryStoryRef}>
            <h1 className="hero__story-line" id="hero-title">杨玉峰</h1>
            <p className="hero__positioning hero__story-line">新媒体内容运营 × 影像创作者</p>
            {motionEnabled ? cta : null}
          </div>
          <div className="hero__story-panel hero__story-panel--secondary" ref={secondaryStoryRef}>
            <p className="hero__emphasis hero__story-line">懂运营，也能把内容从脚本拍到成片。</p>
            <p className="hero__bio hero__story-line">
              我以新媒体运营为核心，独立完成选题策划、脚本编导、拍摄剪辑、发布投放与数据复盘。既懂内容怎么做，也懂内容为什么有效；AI
              则是我提升创意和生产效率的一部分。
            </p>
          </div>
          {motionEnabled ? null : cta}
        </div>
      </div>
      <div aria-label="微信联系标识" className="hero__marker" ref={markerRef}>
        <span className="hero__marker-initial">Y.</span>
        <img
          alt="微信"
          className="hero__marker-wechat"
          src="/assets/icons/wechat.svg"
        />
      </div>
    </section>
  );
}
