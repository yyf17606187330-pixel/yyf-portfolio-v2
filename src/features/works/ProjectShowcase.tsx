import type { Project } from '../../types/portfolio';
import { LongFormProjects } from './LongFormProjects';
import './ProjectShowcase.css';

interface ProjectShowcaseProps {
  playerOpen: boolean;
  onOpenProject: (project: Project, opener: HTMLElement) => void;
}

export function ProjectShowcase({ playerOpen, onOpenProject }: ProjectShowcaseProps) {
  return (
    <section aria-label="精选作品" className="project-showcase" id="works">
      <LongFormProjects playerOpen={playerOpen} onOpenProject={onOpenProject} />
    </section>
  );
}
