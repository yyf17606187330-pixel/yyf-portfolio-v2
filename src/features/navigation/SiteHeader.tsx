export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="site-header__identity" href="#top" aria-label="返回页面顶部">
        <span>YANG YUFENG</span>
        <span>PORTFOLIO / 2026</span>
      </a>
      <nav className="site-header__nav" aria-label="主导航">
        <span>WORK</span>
        <span>ABOUT</span>
        <span>CONTACT</span>
      </nav>
    </header>
  );
}
