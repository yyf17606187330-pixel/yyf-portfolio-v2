import { useRef } from 'react';
import { Hero } from './features/hero/Hero';
import { SiteHeader } from './features/navigation/SiteHeader';

export default function App() {
  const headerRef = useRef<HTMLElement>(null);
  const heroPortrait = {
    objectPosition: '64% 44%',
    scale: 1,
    src: '/assets/hero/hero-candidate-03.webp',
    tone: 'light' as const,
  };

  return (
    <div className="site-shell">
      <SiteHeader headerRef={headerRef} />
      <main id="top">
        <Hero
          headerRef={headerRef}
          portrait={heroPortrait}
          scrollVideo={{
            poster: '/media/hero/hero-poster.webp',
            source: '/media/hero/hero-scroll.mp4',
          }}
        />
      </main>
    </div>
  );
}
