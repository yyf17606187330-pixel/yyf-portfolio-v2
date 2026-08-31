import { useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { Project } from '../../types/portfolio';
import { LazyPreview } from './LazyPreview';
import { LongFormProjects } from './LongFormProjects';
import { RevealRule } from './RevealRule';
import './ProjectShowcase.css';

interface ProjectShowcaseProps {
  project: Project;
  label: string;
  description: string;
  durationLabel: string;
  contentTitle: string;
  contentSummary: string;
  statusLabel: string;
  process: Array<{
    stage: string;
    title: string;
    body: string;
  }>;
  playerOpen: boolean;
  onOpenProject: (project: Project, opener: HTMLElement) => void;
}

export function ProjectShowcase({
  project,
  label,
  description,
  durationLabel,
  contentTitle,
  contentSummary,
  statusLabel,
  process,
  playerOpen,
  onOpenProject,
}: ProjectShowcaseProps) {
  const [previewPaused, setPreviewPaused] = useState(false);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const projectTitleId = `${project.slug}-title`;
  const projectDescriptionId = `${project.slug}-description`;
  const tickerItems = [
    { label: '类别', value: label },
    ...project.roles.map((role, index) => ({ label: index === 0 ? '职责' : '', value: role })),
    { label: '片长', value: durationLabel },
  ];
  const roleSummary = project.roles.join(' · ');

  return (
    <section aria-label="精选作品" className="project-showcase" id="works">
      <div aria-label="作品区导览" className="project-showcase__transition">
        <div className="project-showcase__transition-inner">
          <p className="project-showcase__now">
            <span aria-hidden="true">•</span>
            NOW · AUG '26
            <RevealRule name="now" />
          </p>
          <dl className="project-showcase__transition-grid">
            <div>
              <dt>SHOWING</dt>
              <dd>{project.title}项目</dd>
              <small>{label}</small>
            </div>
            <div>
              <dt>FORMAT</dt>
              <dd>9 / 16</dd>
              <small>VERTICAL FILM</small>
            </div>
            <div>
              <dt>CREATED BY</dt>
              <dd>{project.roles.slice(0, 3).join(' · ')}</dd>
              <small>其余职责见项目档案</small>
            </div>
            <div>
              <dt>CONTENT</dt>
              <dd>{contentTitle}</dd>
              <small>{contentSummary}</small>
            </div>
          </dl>
        </div>
      </div>

      <LongFormProjects playerOpen={playerOpen} onOpenProject={onOpenProject} />

      <header className="project-showcase__heading">
        <div className="project-showcase__eyebrow">
          <p>02.{String(project.order).padStart(2, '0')} / SELECTED WORK</p>
          <p>{project.client} · {project.year}</p>
        </div>
        <h2 aria-label={project.title} id={projectTitleId}>
          {project.title}<span aria-hidden="true">项目</span>
        </h2>
        <p className="project-showcase__statement">
          <em id={projectDescriptionId}>{description}</em>
        </p>
      </header>

      <article className="project-showcase__project" aria-labelledby={projectTitleId}>
        <div className="project-showcase__meta">
          <div aria-label="作品信息" className="project-showcase__meta-summary">
            <div className="project-showcase__meta-group project-showcase__meta-category">
              <span>类别</span>
              <strong>{label}</strong>
            </div>
            <div className="project-showcase__meta-group project-showcase__meta-roles">
              <span>职责</span>
              <ul aria-label="本项目职责">
                {project.roles.map((role) => <li key={role}>{role}</li>)}
              </ul>
            </div>
            <div className="project-showcase__meta-group project-showcase__meta-duration">
              <span>片长</span>
              <strong>{durationLabel}</strong>
            </div>
          </div>

          <div aria-hidden="true" className="project-showcase__ticker">
            <div className="project-showcase__ticker-track">
              {[0, 1].map((copyIndex) => (
                <div className="project-showcase__ticker-set" key={copyIndex}>
                  {tickerItems.map((item, itemIndex) => (
                    <span className="project-showcase__ticker-item" key={`${item.label}-${item.value}`}>
                      {item.label ? <span>{item.label}</span> : null}
                      <strong>{item.value}</strong>
                      <i>{itemIndex === tickerItems.length - 1 ? '—' : '·'}</i>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="project-showcase__media">
          <button
            aria-describedby={projectDescriptionId}
            aria-label={`播放${project.title}完整作品`}
            className="project-showcase__play"
            onClick={(event) => onOpenProject(project, event.currentTarget)}
            type="button"
          >
            <LazyPreview project={project} enabled={!playerOpen && !previewPaused} />
            <span className="project-showcase__play-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="m8 5 11 7-11 7Z" /></svg>
              播放正片
            </span>
          </button>
          <div className="project-showcase__preview-bar">
            <span>{reducedMotion ? '静态封面' : '静音短预览'}</span>
            {!reducedMotion ? (
              <button
                aria-pressed={previewPaused}
                type="button"
                onClick={() => setPreviewPaused((paused) => !paused)}
              >
                {previewPaused ? '继续预览' : '暂停预览'}
              </button>
            ) : null}
          </div>

          <section aria-label="项目关键信息" className="project-showcase__vitals">
            <header>
              <h3>Project vitals</h3>
              <span>{project.year}</span>
            </header>
            <dl>
              <div>
                <dt>类别 / TYPE</dt>
                <dd>{label}</dd>
              </div>
              <div>
                <dt>职责 / ROLE</dt>
                <dd>{roleSummary}</dd>
              </div>
              <div>
                <dt>画幅 / LENGTH</dt>
                <dd>9 / 16 · {durationLabel}</dd>
              </div>
              <div>
                <dt>品牌 / BRAND</dt>
                <dd>{project.client}</dd>
              </div>
              <div>
                <dt>周期 / PERIOD</dt>
                <dd>{project.year}</dd>
              </div>
              <div>
                <dt>状态 / STATUS</dt>
                <dd>{statusLabel}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div
          aria-label={`${project.title}项目说明`}
          className="project-showcase__copy"
        >
          <div className="project-showcase__process-heading">
            <strong>/ {project.title}项目 · 创作过程</strong>
            <span>PROCESS NOTES</span>
          </div>
          <ol aria-label={`${project.title}项目创作过程`} className="project-showcase__timeline">
            {process.map((item, index) => (
              <li key={item.title}>
                <span className="project-showcase__stage">0{index + 1} / {item.stage}</span>
                <p>
                  <strong>{item.title}</strong>
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </article>

    </section>
  );
}
