import type { Project } from '../../types/portfolio';
import { LongFormProjects } from './LongFormProjects';
import { InformationMarquee } from '../navigation/InformationMarquee';
import './ProjectShowcase.css';

interface ProjectShowcaseProps {
  playerOpen: boolean;
  onOpenProject: (project: Project, opener: HTMLElement) => void;
}

export function ProjectShowcase({ playerOpen, onOpenProject }: ProjectShowcaseProps) {
  return (
    <section aria-label="影像与调色作品" className="project-showcase" id="works" tabIndex={-1}>
      <div className="project-showcase__transition">
        <InformationMarquee
          items={['SELECTED WORK', '两组精选作品', '8 项作品', '影像作品', '调色作品', '2 : 1 / 16 : 9']}
          label="作品区导览"
          paused={playerOpen}
        />
      </div>
      <LongFormProjects playerOpen={playerOpen} onOpenProject={onOpenProject} />
    </section>
  );
}
