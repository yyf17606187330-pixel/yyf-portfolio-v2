import { getCategoryLabel } from '../../content/categories';
import type { Project } from '../../types/portfolio';
import { LazyPreview } from './LazyPreview';

interface ProjectCardProps {
  index: number;
  project: Project;
  variant?: 'featured' | 'index';
  onOpenProject: (project: Project, opener: HTMLElement) => void;
}

export function ProjectCard({ index, project, variant = 'index', onOpenProject }: ProjectCardProps) {
  return (
    <article className={`project-card project-card--${variant}`}>
      <button
        className="project-card__button"
        type="button"
        aria-label={`打开项目：${project.title}`}
        onClick={(event) => onOpenProject(project, event.currentTarget)}
      >
        <LazyPreview project={project} />
        <span className="project-card__details">
          <span className="project-card__number">{String(index).padStart(2, '0')}</span>
          <span className="project-card__title">{project.title}</span>
          <span className="project-card__category">{getCategoryLabel(project.category)}</span>
          <span className="project-card__year">{project.year}</span>
        </span>
      </button>
    </article>
  );
}
