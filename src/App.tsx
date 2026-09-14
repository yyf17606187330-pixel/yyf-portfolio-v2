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
import { ExperienceSection } from './features/experience/ExperienceSection';
import { Hero } from './features/hero/Hero';
import { SiteHeader } from './features/navigation/SiteHeader';
import { InformationMarquee } from './features/navigation/InformationMarquee';
import { PlayerOverlay } from './features/player/PlayerOverlay';
import { WebsiteProjectSection } from './features/web/WebsiteProjectSection';
import { CommercialProjectCase } from './features/works/CommercialProjectCase';
import { ProjectShowcase } from './features/works/ProjectShowcase';
import { resolveMediaUrl } from './lib/media';
import type { Project } from './types/portfolio';

export default function App() {
  const headerRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const overlayOpen = activeProject !== null;
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
    setActiveProject(project);
  };

  return (
    <div className="site-shell" inert={overlayOpen ? true : undefined}>
      <SiteHeader headerRef={headerRef} />
      <main id="top">
        <Hero
          headerRef={headerRef}
          worksHref="#works"
          portrait={heroPortrait}
          paused={overlayOpen}
          scrollVideo={{
            poster: heroPoster,
            source: heroScrollVideo,
          }}
        />
        <InformationMarquee
          items={['YANG YUFENG', '内容策略', '编导拍摄', '剪辑调色', '运营投放', 'AI 与协作']}
          label="个人能力导览"
          paused={overlayOpen}
        />
        <AboutSection content={aboutContent} paused={overlayOpen} />
        <ProjectShowcase
          playerOpen={overlayOpen}
          onOpenProject={openProject}
        />
        <AiVideoCapabilitySection
          items={aiVideoCapabilityItems}
          onOpenProject={openProject}
          paused={overlayOpen}
        />
        <WebsiteProjectSection />
        <ExperienceSection
          content={experienceContent}
          paused={overlayOpen}
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
      <PlayerOverlay project={activeProject} opener={openerRef.current} onClose={() => setActiveProject(null)} />
    </div>
  );
}
