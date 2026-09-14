import { ArrowIcon } from '../../../features/navigation/ArrowIcon';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePageVisibility } from '../../hooks/usePageVisibility';
import { useScrollVideo } from '../../hooks/useScrollVideo';
import { HeroComposite } from './HeroComposite';
import './Hero.css';

export interface HeroPortrait {
  objectPosition: string;
  scale: number;
  src: string;
  tone: 'dark' | 'light';
}

interface HeroProps {
  worksHref?: string;
  portrait: HeroPortrait;
  paused?: boolean;
  scrollVideo?: { poster: string; source: string };
}

export function Hero({ portrait, scrollVideo, worksHref = '#works', paused = false }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [failedPoster, setFailedPoster] = useState<string | null>(null);
  const [failedVideo, setFailedVideo] = useState<string | null>(null);
  const [readyVideo, setReadyVideo] = useState<string | null>(null);
  const [readyComposite, setReadyComposite] = useState<string | null>(null);
  const desktop = useMediaQuery('(min-width: 1024px) and (pointer: fine)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const pageVisible = usePageVisibility();
  const poster = scrollVideo?.poster && failedPoster !== scrollVideo.poster ? scrollVideo.poster : portrait.src;
  const canAnimate = Boolean(scrollVideo?.source) && !reducedMotion && failedVideo !== scrollVideo?.source;
  const playing = canAnimate && !desktop && inView && pageVisible && !paused && !userPaused;
  const { videoProps } = useScrollVideo({
    enabled: canAnimate && desktop,
    poster,
    source: scrollVideo?.source ?? null,
    triggerRef: rootRef,
    pinRef: stageRef,
    videoRef,
    scrollDistance: 1200,
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) void video.play().catch(() => undefined);
    else video.pause();
    return () => video.pause();
  }, [playing, scrollVideo?.source]);

  return (
    <section className="p5-hero" aria-labelledby="hero-title" ref={rootRef} data-scroll-motion={canAnimate && desktop}>
      <div className="p5-hero__stage" ref={stageRef}>
        <span className="p5-hero__issue" aria-hidden="true">CREATOR FILE / 01</span>
        <div className="p5-hero__portrait" data-composite={canAnimate && readyComposite === scrollVideo?.source}
          style={{ '--portrait-position': portrait.objectPosition } as CSSProperties}>
          <img alt="杨玉峰个人肖像" fetchPriority="high" src={poster}
            onError={poster !== portrait.src ? () => setFailedPoster(poster) : undefined} />
          {canAnimate && scrollVideo ? <>
            <video aria-hidden="true" className="p5-hero__video" data-ready={readyVideo === scrollVideo.source}
              loop={!desktop} muted playsInline poster={poster} preload={inView ? 'metadata' : 'none'}
              ref={videoRef} src={inView ? scrollVideo.source : undefined} tabIndex={-1}
              {...(desktop ? videoProps : {})}
              onLoadedData={() => setReadyVideo(scrollVideo.source)}
              onError={() => setFailedVideo(scrollVideo.source)} />
            <HeroComposite videoRef={videoRef} source={scrollVideo.source} onReady={setReadyComposite} />
          </> : null}
        </div>
        <div className="p5-hero__copy">
          <p className="p5-hero__eyebrow">YANG YUFENG / PORTFOLIO</p>
          <h1 id="hero-title" aria-label="杨玉峰"><span>杨</span><span>玉</span><span>峰</span></h1>
          <p className="p5-hero__statement"><span>让内容</span><strong>发生作用。</strong></p>
          <p className="p5-hero__positioning">新媒体内容运营 × 影像创作者</p>
          <p className="p5-hero__bio">懂运营，也能把内容从脚本拍到成片。<br />用影像组织表达，用结果验证内容。</p>
          <a className="p5-hero__cta" href={worksHref}>查看作品 <span aria-hidden="true"><ArrowIcon /></span></a>
        </div>
        <div className="p5-hero__side-note" aria-hidden="true">IDEAS<br />STORIES<br />IMPACT</div>
        <div className="p5-hero__bottomline">
          <span>内容策略 / 编导拍摄 / 剪辑调色 / AI 影像</span>
          {canAnimate && desktop ? <a href="#about">滚动推进 · 回滚倒退 <span aria-hidden="true">↓</span></a>
            : canAnimate ? <button type="button" aria-pressed={userPaused} onClick={() => setUserPaused(!userPaused)}>
            {userPaused ? '播放肖像动效' : '暂停肖像动效'} <span aria-hidden="true">{userPaused ? '▷' : 'Ⅱ'}</span>
          </button> : <span>CREATOR / Y.</span>}
        </div>
      </div>
      <dl className="p5-hero__proof" aria-label="经验与成果">
        <div><dt>7<span>年</span></dt><dd>内容／电商／直播运营经验</dd></div>
        <div><dt>800<span>万+</span></dt><dd>项目年 GMV</dd></div>
        <div><dt>100<span>+</span></dt><dd>参与拍摄项目</dd></div>
        <div><dt>0→1</dt><dd>个人 IP 与电商起号</dd></div>
      </dl>
    </section>
  );
}
