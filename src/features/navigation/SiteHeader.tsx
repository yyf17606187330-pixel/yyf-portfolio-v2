import type { MouseEvent } from 'react';
import { profile } from '../../content/profile';

interface SiteHeaderProps {
  onOpenMenu: (opener: HTMLElement) => void;
}

export function SiteHeader({ onOpenMenu }: SiteHeaderProps) {
  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    onOpenMenu(event.currentTarget);
  };

  return (
    <header className="site-header">
      <a className="site-header__identity" href="#top" aria-label="返回页面顶部">
        <span>{profile.latinName}</span>
        <span>{profile.positioning}</span>
      </a>
      <nav className="site-header__nav" aria-label="主导航">
        <a href="#work">WORK</a>
        <button className="site-header__nav-secondary" type="button" onClick={openMenu}>CAPABILITIES</button>
        <button className="site-header__nav-secondary" type="button" onClick={openMenu}>ABOUT</button>
        <button className="site-header__nav-secondary" type="button" onClick={openMenu}>CONTACT</button>
        <button className="site-header__menu" type="button" onClick={openMenu}>MENU</button>
      </nav>
    </header>
  );
}
