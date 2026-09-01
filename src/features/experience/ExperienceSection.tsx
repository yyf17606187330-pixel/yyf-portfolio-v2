import type { ReactNode } from 'react';
import type { ExperienceContent, ExperienceEntry } from '../../content/experience';
import './ExperienceSection.css';

export interface ExperienceSectionProps {
  content: ExperienceContent;
  renderProject?: (entry: ExperienceEntry) => ReactNode;
}

export function ExperienceSection({ content, renderProject }: ExperienceSectionProps) {
  const topMetrics = content.topMetrics ?? [];

  return (
    <section className="experience-section" id="experience" aria-label={content.eyebrow}>
      {topMetrics.length > 0 ? (
        <div className="experience-results" aria-label="工作成果概览">
          <dl className="experience-results__inner">
            {topMetrics.map((metric, index) => (
              <div
                className="experience-results__item"
                data-experience-top-metric
                key={`${metric.label}-${metric.value}`}
              >
                <dt>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {metric.label}
                </dt>
                <dd>
                  <strong>{metric.value}</strong>
                  <span>{metric.context}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <header className="experience-heading">
        <div className="experience-heading__chapter">
          <span>{content.sectionNumber}</span>
          <i aria-hidden="true" />
          <p>{content.eyebrow} / EXPERIENCE</p>
        </div>
        <h2 aria-label={`${content.title.primary} ${content.title.accent}`}>
          <span>{content.title.primary}</span>
          <em>{content.title.accent}</em>
        </h2>
      </header>

      <div className="experience-list">
        {content.experiences.map((entry, index) => {
          const number = String(index + 1).padStart(2, '0');
          const headingId = `experience-company-${entry.id}`;
          const project = renderProject?.(entry) ?? null;

          return (
            <article
              className="experience-entry"
              data-experience-entry
              data-experience-id={entry.id}
              aria-labelledby={headingId}
              key={entry.id}
            >
              <aside className="experience-entry__meta" aria-label={`${entry.company}基本信息`}>
                <div className="experience-entry__number">
                  <span>{number}</span>
                  <i aria-hidden="true" />
                </div>
                <p className="experience-entry__period" data-experience-period>{entry.displayPeriod}</p>
                <p className="experience-entry__division">{entry.division}</p>
                <p className="experience-entry__scope">{entry.scope}</p>
              </aside>

              <div className="experience-entry__body">
                <header className="experience-entry__header">
                  <p className="experience-entry__role">{entry.role}</p>
                  <h3 id={headingId}>{entry.company}</h3>
                  <p className="experience-entry__brand">{entry.brand}</p>
                </header>

                <div className="experience-entry__summaries">
                  {entry.summaries.map((summary) => (
                    <p data-experience-summary key={summary}>{summary}</p>
                  ))}
                </div>

                <div className="experience-entry__details">
                  {entry.detailBlocks.map((detail, detailIndex) => (
                    <section
                      className="experience-detail"
                      data-experience-detail
                      key={`${detail.kicker}-${detail.title}`}
                    >
                      <div className="experience-detail__index">
                        <span>{number}.{String(detailIndex + 1).padStart(2, '0')}</span>
                        <i aria-hidden="true" />
                      </div>
                      <p className="experience-detail__kicker">{detail.kicker}</p>
                      <h4>{detail.title}</h4>
                      <p>{detail.body}</p>
                    </section>
                  ))}
                </div>

                {entry.metrics.length > 0 ? (
                  <dl className="experience-entry__metrics">
                    {entry.metrics.map((metric) => (
                      <div data-experience-metric key={`${metric.label}-${metric.value}`}>
                        <dt>{metric.value}</dt>
                        <dd>
                          <strong>{metric.label}</strong>
                          <span>{metric.context}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                <footer className="experience-entry__notes" aria-label={`${entry.company}数据口径`}>
                  {entry.publicNotes.map((note, noteIndex) => (
                    <p data-experience-note key={note}>
                      <sup>{noteIndex + 1}</sup>
                      {note}
                    </p>
                  ))}
                </footer>
              </div>
              {project ? (
                <div className="experience-entry__project" data-experience-project>
                  {project}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
