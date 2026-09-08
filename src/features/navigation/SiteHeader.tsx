import type { RefObject } from 'react';

interface SiteHeaderProps {
  headerRef?: RefObject<HTMLElement | null>;
}

export function SiteHeader({ headerRef }: SiteHeaderProps = {}) {
  return (
    <header className="site-header" ref={headerRef}>
      <a className="site-header__identity" href="#top" aria-label="返回页面顶部">
        <span>YANG YUFENG</span>
        <span>PORTFOLIO / 2026</span>
      </a>
      <nav className="site-header__nav" aria-label="主导航">
        <a href="#works">WORK</a>
        <a href="#about">ABOUT</a>
      </nav>
    </header>
  );
}
