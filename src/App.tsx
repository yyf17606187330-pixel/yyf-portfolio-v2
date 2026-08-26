import { Hero } from './features/hero/Hero';
import { SiteHeader } from './features/navigation/SiteHeader';

export default function App() {
  const heroPortrait = {
    objectPosition: '64% 44%',
    scale: 1,
    src: '/assets/hero/hero-candidate-03.webp',
    tone: 'light' as const,
  };

  return (
    <div className="site-shell">
      <SiteHeader />
      <main id="top">
        <Hero portrait={heroPortrait} />
      </main>
    </div>
  );
}
