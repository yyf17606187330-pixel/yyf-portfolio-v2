import { useCallback, useState } from 'react';
import { profile } from './content/profile';
import { projects } from './content/projects';
import { FluidBackdrop } from './features/fluid/FluidBackdrop';
import { IntroSequence } from './features/intro/IntroSequence';
import { NavigationOverlay, type NavigationTarget } from './features/navigation/NavigationOverlay';
import { SiteHeader } from './features/navigation/SiteHeader';
import { PlayerOverlay } from './features/player/PlayerOverlay';
import { ProjectCard } from './features/works/ProjectCard';
import { WorkIndex } from './features/works/WorkIndex';
import { useLenis } from './hooks/useLenis';
import type { Project } from './types/portfolio';

type TopLayer =
  | { kind: 'menu'; opener: HTMLElement; target: NavigationTarget }
  | { kind: 'player'; opener: HTMLElement; project: Project }
  | null;

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [topLayer, setTopLayer] = useState<TopLayer>(null);
  const featuredProjects = projects.filter((project) => project.featured).sort((left, right) => left.order - right.order);
  const indexProjects = projects.filter((project) => !project.featured).sort((left, right) => left.order - right.order);

  useLenis();

  const completeIntro = useCallback(() => setIntroComplete(true), []);
  const openMenu = useCallback((opener: HTMLElement, target: NavigationTarget) => {
    setTopLayer({ kind: 'menu', opener, target });
  }, []);
  const openProject = useCallback((project: Project, opener: HTMLElement) => {
    setTopLayer({ kind: 'player', project, opener });
  }, []);
  const closeTopLayer = useCallback(() => setTopLayer(null), []);

  return (
    <>
      <IntroSequence onComplete={completeIntro} />

      <div
        aria-hidden={!introComplete || topLayer !== null ? 'true' : undefined}
        className="site-shell"
        inert={!introComplete || topLayer !== null}
      >
        <SiteHeader onOpenMenu={openMenu} />

        <main id="top">
          <section className="identity-lead" aria-labelledby="identity-title">
            <FluidBackdrop region="hero" />
            <div className="identity-lead__meta">
              <p>PORTFOLIO / 作品集</p>
              <p>IMAGE DIRECTION × AI VISUAL</p>
            </div>
            <div className="identity-lead__copy">
              <p>{profile.name}</p>
              <h1 id="identity-title">
                <span>YANG</span>
                <span>YUFENG</span>
              </h1>
              <p>{profile.positioning}</p>
            </div>
            <a className="identity-lead__jump" href="#work">
              VIEW WORK <span aria-hidden="true">↓</span>
            </a>
          </section>

          <section className="featured-work" id="work" aria-labelledby="featured-title">
            <div className="section-heading section-heading--featured">
              <p className="eyebrow">SELECTED WORK / 重点作品</p>
              <h2 id="featured-title">WORK FIRST.</h2>
              <p>三个重点项目位，等待替换真实封面与成片。</p>
            </div>
            <div className="featured-work__grid">
              {featuredProjects.map((project) => (
                <ProjectCard
                  index={project.order}
                  key={project.slug}
                  onOpenProject={openProject}
                  project={project}
                  variant="featured"
                />
              ))}
            </div>
          </section>

          <WorkIndex projects={indexProjects} onOpenProject={openProject} />
        </main>

        <footer className="site-footer">
          <p>{profile.latinName}</p>
          <p>{profile.positioning}</p>
          <button type="button" onClick={(event) => openMenu(event.currentTarget, 'contact')}>
            CONTACT / 联系
          </button>
        </footer>
      </div>

      <NavigationOverlay
        open={topLayer?.kind === 'menu'}
        opener={topLayer?.kind === 'menu' ? topLayer.opener : null}
        onClose={closeTopLayer}
        target={topLayer?.kind === 'menu' ? topLayer.target : 'top'}
      />
      <PlayerOverlay
        project={topLayer?.kind === 'player' ? topLayer.project : null}
        opener={topLayer?.kind === 'player' ? topLayer.opener : null}
        onClose={closeTopLayer}
      />
    </>
  );
}
