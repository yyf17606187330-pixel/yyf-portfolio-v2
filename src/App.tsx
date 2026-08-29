import { useRef, useState } from 'react';
import { aboutContent } from './content/about';
import { experienceContent } from './content/experience';
import { waterPurifierCopy, waterPurifierProject } from './content/showcase';
import { AboutSection } from './features/about/AboutSection';
import { ExperienceSection } from './features/experience/ExperienceSection';
import { Hero } from './features/hero/Hero';
import { SiteHeader } from './features/navigation/SiteHeader';
import { PlayerOverlay } from './features/player/PlayerOverlay';
import { ProjectShowcase } from './features/works/ProjectShowcase';
import type { Project } from './types/portfolio';

export default function App() {
  const headerRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const heroPortrait = {
    objectPosition: '64% 43%',
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
          worksHref="#works"
          portrait={heroPortrait}
          scrollVideo={{
            poster: '/media/hero/hero-poster.webp',
            source: '/media/hero/hero-scroll.mp4',
          }}
        />
        <AboutSection content={aboutContent} />
        <ProjectShowcase
          {...waterPurifierCopy}
          project={waterPurifierProject}
          playerOpen={activeProject !== null}
          onOpenProject={(project, opener) => {
            openerRef.current = opener;
            setActiveProject(project);
          }}
        />
        <ExperienceSection content={experienceContent} />
      </main>
      <PlayerOverlay project={activeProject} opener={openerRef.current} onClose={() => setActiveProject(null)} />
    </div>
  );
}
