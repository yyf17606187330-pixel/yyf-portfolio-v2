import type { AboutContent } from '../../content/about';
import './CapabilityBoundarySection.css';

export interface CapabilityBoundarySectionProps {
  capabilities: AboutContent['capabilities'];
  groups: AboutContent['capabilityGroups'];
}

export function CapabilityBoundarySection({
  capabilities,
  groups,
}: CapabilityBoundarySectionProps) {
  return (
    <section
      aria-label="技能与工具"
      className="capability-boundary"
      data-design-system="capability-editorial-v1"
      data-typography-contract="about-scope-v1"
      id="skills"
    >
      <div className="capability-boundary__inner">
        <header className="capability-boundary__header">
          <div className="capability-boundary__chapter">
            <span>CAPABILITY RANGE</span>
            <i aria-hidden="true" />
            <p>技能与工具 / TOOLKIT</p>
          </div>
          <div className="capability-boundary__heading-grid">
            <h2
              aria-label="技能与工具能力边界"
              className="capability-boundary__display capability-boundary__scope-heading"
            >
              <span>从内容策略到影像交付</span>
              <em>技能与工具能力边界</em>
            </h2>
            <p className="capability-boundary__body">
              除了商业项目，我也持续做 AI 视觉、调色练习和网站协作；这些工具最终都服务于同一件事：把想法稳定地变成可交付的内容。
            </p>
          </div>
        </header>

        <div className="capability-boundary__content">
          <section className="capability-boundary__skills" aria-labelledby="skills-list-title">
            <header>
              <p className="capability-boundary__scope-label" id="skills-list-title">
                CORE SKILLS / 核心能力
              </p>
              <span>{String(capabilities.length).padStart(2, '0')} 项</span>
            </header>
            <ul aria-label="技能清单">
              {capabilities.map((capability, index) => (
                <li key={capability}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{capability}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="capability-boundary__groups" aria-labelledby="capability-groups-title">
            <header>
              <p className="capability-boundary__scope-label" id="capability-groups-title">
                WORKING RANGE / 能力边界
              </p>
              <span>{String(groups.length).padStart(2, '0')} 组</span>
            </header>
            <ol aria-label="能力范围清单">
              {groups.map((group, index) => (
                <li key={group.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{group.title}</strong>
                    <p>{group.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </section>
  );
}
