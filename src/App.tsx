import { useCallback, useRef, useState } from 'react';
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
import { ContactSection } from './features/contact/ContactSection';
import { ExperienceSection } from './features/experience/ExperienceSection';
import { Hero } from './features/hero/Hero';
import { CollageIntro } from './features/intro/CollageIntro';
import { shouldShowIntro } from './features/intro/introSession';
import { useTextReveal } from './features/motion/useTextReveal';
import { SiteHeader } from './features/navigation/SiteHeader';
import { InformationMarquee } from './features/navigation/InformationMarquee';
import { PlayerOverlay } from './features/player/PlayerOverlay';
import { WebsiteProjectSection } from './features/web/WebsiteProjectSection';
import { CommercialProjectCase } from './features/works/CommercialProjectCase';
import { ProjectShowcase } from './features/works/ProjectShowcase';
import { resolveMediaUrl } from './lib/media';
import { usePortfolioTextTargets } from './hooks/usePortfolioTextTargets';
import type { Project } from './types/portfolio';

export default function App() {
  const pageRef = useRef<HTMLDivElement>(null);
  usePortfolioTextTargets(pageRef);
  const headerRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [introOpen, setIntroOpen] = useState(shouldShowIntro);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const markHeroReady = useCallback(() => setHeroVideoReady(true), []);
  const completeIntro = useCallback(() => setIntroOpen(false), []);
  const overlayOpen = activeProject !== null;
  const pagePaused = overlayOpen || introOpen;
  useTextReveal(pageRef, { enabled: !introOpen, paused: overlayOpen });
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
    <div className="site-shell" ref={pageRef} inert={pagePaused ? true : undefined}>
      {introOpen ? <CollageIntro heroPoster={heroPoster} heroVideoReady={heroVideoReady} onComplete={completeIntro} /> : null}
      <SiteHeader headerRef={headerRef} />
      <main id="top">
        <Hero
          headerRef={headerRef}
          worksHref="#works"
          portrait={heroPortrait}
          paused={pagePaused}
          onReady={markHeroReady}
          scrollVideo={{
            poster: heroPoster,
            source: heroScrollVideo,
          }}
        />
        <InformationMarquee
          items={['YANG YUFENG', '内容策略', '编导拍摄', '剪辑调色', '运营投放', 'AI 与协作']}
          label="个人能力导览"
          paused={pagePaused}
        />
        <AboutSection content={aboutContent} paused={pagePaused} />
        <ProjectShowcase
          playerOpen={pagePaused}
          onOpenProject={openProject}
        />
        <AiVideoCapabilitySection
          items={aiVideoCapabilityItems}
          onOpenProject={openProject}
          paused={pagePaused}
        />
        <WebsiteProjectSection />
        <ExperienceSection
          content={experienceContent}
          paused={pagePaused}
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
      <ContactSection />
      <PlayerOverlay project={activeProject} opener={openerRef.current} onClose={() => setActiveProject(null)} />
    </div>
  );
}
