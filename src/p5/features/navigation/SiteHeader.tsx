import type { RefObject } from 'react';

interface SiteHeaderProps {
  headerRef?: RefObject<HTMLElement | null>;
}

export function SiteHeader({ headerRef }: SiteHeaderProps = {}) {
  return (
    <header className="site-header" ref={headerRef}>
      <a className="site-header__identity" href="#top" aria-label="返回页面顶部">
        <b aria-hidden="true">Y.</b>
        <span>YANG YUFENG<small>PORTFOLIO / 2026</small></span>
      </a>
      <nav className="site-header__nav" aria-label="主导航">
        <a href="#works">WORK</a>
        <a href="#about">ABOUT</a>
        <a href="#experience">EXPERIENCE</a>
      </nav>
    </header>
  );
}
