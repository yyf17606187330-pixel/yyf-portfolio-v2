import { useRef, useState } from 'react';
import { aboutContent } from './content/about';
import { aiVideoCapabilityItems } from './content/aiVideoCapability';
import { experienceContent } from './content/experience';
import { waterPurifierCopy, waterPurifierProject } from './content/showcase';
import { waterPurifierMediaDeck } from './content/waterPurifierMedia';
import {
  teaWareCopy,
  teaWareProject,
  teaWareProjectMediaItems,
} from './content/teaWareShowcase';
import { AboutSection } from './features/about/AboutSection';
import { AiVideoCapabilitySection } from './features/capabilities/AiVideoCapabilitySection';
import { CapabilityBoundarySection } from './features/capabilities/CapabilityBoundarySection';
import { ExperienceSection } from './features/experience/ExperienceSection';
import { Hero } from './features/hero/Hero';
import { NavigationOverlay } from './features/navigation/NavigationOverlay';
import { SiteHeader } from './features/navigation/SiteHeader';
import { PlayerOverlay } from './features/player/PlayerOverlay';
import { CommercialProjectCase } from './features/works/CommercialProjectCase';
import { ProjectShowcase } from './features/works/ProjectShowcase';
import { resolveMediaUrl } from './lib/media';
import type { Project } from './types/portfolio';

export default function App() {
  const headerRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const navigationOpenerRef = useRef<HTMLElement | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const overlayOpen = activeProject !== null || navigationOpen;
  const heroPoster = resolveMediaUrl('hero/hero-poster.webp') ?? '/media/hero/hero-poster.webp';
  const heroScrollVideo = resolveMediaUrl('hero/hero-scroll.mp4') ?? '/media/hero/hero-scroll.mp4';
  const heroPortrait = {
    objectPosition: '64% 43%',
    scale: 1,
    src: '/assets/hero/hero-candidate-03.webp',
    tone: 'light' as const,
  };
  const openProject = (project: Project, opener: HTMLElement) => {
    openerRef.current = opener;
    setNavigationOpen(false);
    setActiveProject(project);
  };

  return (
    <div className="site-shell" inert={overlayOpen ? true : undefined}>
      <SiteHeader
        headerRef={headerRef}
        onOpenContact={(opener) => {
          navigationOpenerRef.current = opener;
          setActiveProject(null);
          setNavigationOpen(true);
        }}
      />
      <main id="top">
        <Hero
          headerRef={headerRef}
          worksHref="#works"
          portrait={heroPortrait}
          scrollVideo={{
            poster: heroPoster,
            source: heroScrollVideo,
          }}
        />
        <AboutSection content={aboutContent} paused={overlayOpen} />
        <CapabilityBoundarySection
          capabilities={aboutContent.capabilities}
          groups={aboutContent.capabilityGroups}
        />
        <AiVideoCapabilitySection
          items={aiVideoCapabilityItems}
          onOpenProject={openProject}
          paused={overlayOpen}
        />
        <ProjectShowcase
          playerOpen={overlayOpen}
          onOpenProject={openProject}
        />
        <ExperienceSection
          content={experienceContent}
          renderProject={(entry) => {
            if (entry.id === 'kuwo') {
              return (
                <CommercialProjectCase
                  {...waterPurifierCopy}
                  mediaItems={waterPurifierMediaDeck}
                  project={waterPurifierProject}
                  playerOpen={overlayOpen}
                  onOpenProject={openProject}
                />
              );
            }

            if (entry.id === 'zhepin') {
              return (
                <CommercialProjectCase
                  {...teaWareCopy}
                  mediaItems={teaWareProjectMediaItems}
                  project={teaWareProject}
                  playerOpen={overlayOpen}
                  onOpenProject={openProject}
                />
              );
            }

            return null;
          }}
        />
      </main>
      <NavigationOverlay
        open={navigationOpen}
        opener={navigationOpenerRef.current}
        target="contact"
        onClose={() => setNavigationOpen(false)}
      />
      <PlayerOverlay project={activeProject} opener={openerRef.current} onClose={() => setActiveProject(null)} />
    </div>
  );
}
