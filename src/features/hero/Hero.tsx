import type { CSSProperties } from 'react';

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
            alt="杨玉峰个人肖像"
            decoding="async"
            fetchPriority="high"
            sizes="100vw"
            src={portrait.src}
          />
        ) : (
          <span className="hero__media-placeholder">肖像待替换</span>
        )}
      </div>
      <div className="hero__inner">
        <div className="hero__copy">
          <h1 id="hero-title">杨玉峰</h1>
          <p className="hero__positioning">新媒体内容运营 × 影像创作者</p>
          <p className="hero__emphasis">懂运营，也能把内容从脚本拍到成片。</p>
          <p className="hero__bio">
            我以新媒体运营为核心，独立完成选题策划、脚本编导、拍摄剪辑、发布投放与数据复盘。既懂内容怎么做，也懂内容为什么有效；AI
            则是我提升创意和生产效率的一部分。
          </p>
          <a className="hero__cta" href="#top">查看作品</a>
        </div>
      </div>
      <div aria-hidden="true" className="hero__marker" />
    </section>
  );
}
