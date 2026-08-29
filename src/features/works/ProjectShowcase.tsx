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
  playerOpen: boolean;
  onOpenProject: (project: Project, opener: HTMLElement) => void;
}

const placeholderNarrative = [
  '本段用于承接项目背景与沟通目标。正式版本应说明作品为什么被制作、希望观众先理解什么，以及竖屏画面对应的发布场景。当前内容只用于确认首段高度、行宽和阅读节奏，不代表真实客户需求，也不包含未经确认的业务结论。',
  '本段用于说明从选题、脚本到拍摄执行的过程。正式版本可补充经过确认的创作判断、现场限制与镜头组织方式，但在资料补齐前不写具体品牌要求、人员规模、预算、周期或合作关系。此处文字只负责撑开第二段的视觉密度。',
  '本段用于描述剪辑、声音、调色与平台适配等后期思路。后续应由内容负责人根据真实素材替换，保留能够被作品画面直接验证的信息；不填播放量、转化率、投放回报、奖项或其他未经核实的数据。当前段落仅用于测试连续中文的换行与段距。',
  '本段用于收束个人职责与复盘角度。正式文案可以解释哪些环节由本人完成、哪些来自协作，以及最终版本如何回应最初目标；在确认前不扩大职责、不虚构成果，也不把排版占位视为公开案例说明。此处用于确认长文与右侧九比十六视频在桌面上的高度关系。',
];

const processStages = ['项目背景', '策划与拍摄', '后期与适配', '职责复盘'];

export function ProjectShowcase({
  project,
  label,
  description,
  durationLabel,
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
              <dd>LAYOUT STUDY</dd>
              <small>正式文案待替换</small>
            </div>
          </dl>
        </div>
      </div>

      <header className="project-showcase__heading">
        <div className="project-showcase__eyebrow">
          <p>02.{String(project.order).padStart(2, '0')} / SELECTED WORK</p>
          <p className="project-showcase__placeholder-note">排版占位 · 正式文案待替换</p>
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
              <span>VOL. 01 · '26</span>
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
                <dt>状态 / STATUS</dt>
                <dd>正式文案待替换</dd>
              </div>
            </dl>
          </section>
        </div>

        <div
          aria-label="作品说明占位文案"
          className="project-showcase__copy"
        >
          <div className="project-showcase__process-heading">
            <strong>/ {project.title}项目 · 创作过程</strong>
            <span>PROCESS NOTES</span>
          </div>
          <ol aria-label="创作过程占位" className="project-showcase__timeline">
            {placeholderNarrative.map((paragraph, index) => (
              <li key={paragraph}>
                <span className="project-showcase__stage">0{index + 1} / {processStages[index]}</span>
                <p>
                  <strong>排版占位 0{index + 1}｜待替换</strong>
                  {paragraph}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </article>

      <LongFormProjects playerOpen={playerOpen} onOpenProject={onOpenProject} />
    </section>
  );
}
