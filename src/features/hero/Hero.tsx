import type { CSSProperties } from 'react';
import { profile } from '../../content/profile';

export interface HeroPortrait {
  objectPosition: string;
  scale: number;
  src: string;
  tone: 'dark' | 'light';
}

interface HeroProps {
  portrait: HeroPortrait;
}

export function Hero({ portrait }: HeroProps) {
  const heroStyle = {
    '--hero-image-position': portrait.objectPosition,
    '--hero-image-scale': portrait.scale,
  } as CSSProperties;

  return (
    <section className={`hero hero--${portrait.tone}`} style={heroStyle} aria-labelledby="hero-title">
      <div className="hero__media" aria-hidden={!portrait.src}>
        {portrait.src ? (
          <img
            alt={`${profile.name}个人肖像`}
            decoding="async"
            fetchPriority="high"
            sizes="(max-width: 900px) 100vw, 58vw"
            src={portrait.src}
          />
        ) : (
          <span className="hero__media-placeholder">肖像待替换</span>
        )}
      </div>
      <div className="hero__veil" aria-hidden="true" />
      <div className="hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow">DIRECTOR / AI VISUAL CREATOR</p>
          <p className="hero__name">{profile.name}</p>
          <h1 aria-label="YANG YUFENG" id="hero-title">
            <span>YANG</span>
            <span>YUFENG</span>
          </h1>
          <p className="hero__positioning">{profile.positioning}</p>
          <p className="hero__bio">{profile.bio}</p>
          <a className="hero__cta" href="#work">
            VIEW WORK <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
