import { useMemo, useState } from 'react';
import type { Project, ProjectCategory } from '../../types/portfolio';
import { CategoryFilter, type CategorySelection } from './CategoryFilter';
import { ProjectCard } from './ProjectCard';

interface WorkIndexProps {
  projects: Project[];
  onOpenProject: (project: Project, opener: HTMLElement) => void;
}

const emptyCounts: Record<ProjectCategory, number> = {
  film: 0,
  'ai-video': 0,
  photography: 0,
  'design-interactive': 0,
};

export function WorkIndex({ projects, onOpenProject }: WorkIndexProps) {
  const [activeCategory, setActiveCategory] = useState<CategorySelection>('all');
  const sortedProjects = useMemo(() => [...projects].sort((left, right) => left.order - right.order), [projects]);
  const counts = useMemo(
    () => sortedProjects.reduce<Record<ProjectCategory, number>>(
      (result, project) => ({ ...result, [project.category]: result[project.category] + 1 }),
      { ...emptyCounts },
    ),
    [sortedProjects],
  );
  const visibleProjects = activeCategory === 'all'
    ? sortedProjects
    : sortedProjects.filter((project) => project.category === activeCategory);

  return (
    <section className="work-index" aria-labelledby="work-index-title">
      <div className="section-heading">
        <p className="eyebrow">WORK INDEX / 作品索引</p>
        <h2 id="work-index-title">ALL WORKS</h2>
        <p aria-live="polite">当前显示 {visibleProjects.length} 项</p>
      </div>
      <CategoryFilter
        activeCategory={activeCategory}
        counts={counts}
        total={sortedProjects.length}
        onChange={setActiveCategory}
      />
      <div className="work-index__grid">
        {visibleProjects.map((project) => (
          <ProjectCard
            index={project.order}
            key={project.slug}
            onOpenProject={onOpenProject}
            project={project}
          />
        ))}
      </div>
    </section>
  );
}
