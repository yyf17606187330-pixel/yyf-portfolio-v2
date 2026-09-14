import type { Project } from '../../types/portfolio';
import {
  ProjectMediaDeck,
  type ProjectMediaDeckSourceItem,
} from './ProjectMediaDeck';
import './ProjectShowcase.css';

export interface CommercialProjectCaseProps {
  project: Project;
  label: string;
  description: string;
  durationLabel: string;
  statusLabel: string;
  mediaItems: readonly ProjectMediaDeckSourceItem[];
  results: Array<{
    title: string;
    body: string;
  }>;
  process: Array<{
    stage: string;
    title: string;
    body: string;
  }>;
  playerOpen: boolean;
  onOpenProject: (project: Project, opener: HTMLElement) => void;
}

export function CommercialProjectCase({
  project,
  label,
  description,
  durationLabel,
  statusLabel,
  mediaItems,
  results,
  process,
  playerOpen,
  onOpenProject,
}: CommercialProjectCaseProps) {
  const projectTitleId = `${project.slug}-title`;
  const projectDescriptionId = `${project.slug}-description`;

  return (
    <section
      aria-label={`${project.title}商业项目`}
      className="commercial-project project-showcase"
    >
      <header className="project-showcase__heading">
        <div className="project-showcase__eyebrow">
          <p>03.{String(project.order).padStart(2, '0')} / EMPLOYER PROJECT</p>
          <p>{project.client} · {project.year}</p>
        </div>
        <h2 aria-label={project.title} id={projectTitleId}>
          {project.title}<span aria-hidden="true">项目</span>
        </h2>
        <p className="project-showcase__statement" id={projectDescriptionId}>
          {description}
        </p>
      </header>

      <article
        aria-describedby={projectDescriptionId}
        aria-labelledby={projectTitleId}
        className="project-showcase__project"
      >
        <div className="project-showcase__summary">
          <section aria-label={`${project.title}项目职责`} className="project-showcase__responsibilities">
            <h3>项目职责</h3>
            <ul aria-label="本项目职责">
              {project.roles.map((role) => <li key={role}>{role}</li>)}
            </ul>
          </section>

          <section aria-label={`${project.title}项目结果`} className="project-showcase__results">
            <h3>项目结果</h3>
            <dl>
              {results.map((result) => (
                <div key={result.title}>
                  <dt>{result.title}</dt>
                  <dd>{result.body}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="project-showcase__media project-showcase__media--deck-focus">
          <ProjectMediaDeck
            baseDescription={description}
            mediaItems={mediaItems}
            onOpenProject={onOpenProject}
            playerOpen={playerOpen}
            project={project}
          />
        </div>

        <section aria-label={`${project.title}项目说明`} className="project-showcase__copy">
          <div className="project-showcase__process">
            <h3>制作过程</h3>
            <ol aria-label={`${project.title}项目创作过程`} className="project-showcase__timeline">
              {process.map((item, index) => (
                <li key={item.title}>
                  <span className="project-showcase__stage">
                    {String(index + 1).padStart(2, '0')} / {item.stage}
                  </span>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </li>
              ))}
            </ol>
          </div>

          <section aria-label="项目关键信息" className="project-showcase__vitals">
            <h3>关键信息</h3>
            <dl>
              <div><dt>类别</dt><dd>{label}</dd></div>
              <div>
                <dt>画幅 · 片长</dt>
                <dd>{project.aspectRatio.replace('/', ' : ')} · {durationLabel}</dd>
              </div>
              <div><dt>状态</dt><dd>{statusLabel}</dd></div>
            </dl>
          </section>
        </section>
      </article>
    </section>
  );
}
