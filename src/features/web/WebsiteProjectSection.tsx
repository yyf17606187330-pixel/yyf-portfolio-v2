import { websiteProjectContent } from '../../content/websiteProject';
import './WebsiteProjectSection.css';

export function WebsiteProjectSection() {
  return (
    <section
      aria-labelledby="website-project-heading"
      className="website-project"
      id="web-projects"
    >
      <div className="website-project__inner">
        <header className="website-project__heading">
          <p>WEB &amp; INTERACTION</p>
          <h2 id="website-project-heading">{websiteProjectContent.sectionTitle}</h2>
        </header>
        <article className="website-project__case" aria-labelledby="website-project-title">
          <div className="website-project__intro">
            <h3 id="website-project-title">{websiteProjectContent.projectTitle}</h3>
            <p>{websiteProjectContent.description}</p>
          </div>
          <dl className="website-project__facts">
            {websiteProjectContent.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </div>
    </section>
  );
}
