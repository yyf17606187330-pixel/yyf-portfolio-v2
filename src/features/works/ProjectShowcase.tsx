import type { Project } from '../../types/portfolio';
import { LongFormProjects } from './LongFormProjects';
import { RevealRule } from './RevealRule';
import './ProjectShowcase.css';

interface ProjectShowcaseProps {
  playerOpen: boolean;
  onOpenProject: (project: Project, opener: HTMLElement) => void;
}

export function ProjectShowcase({ playerOpen, onOpenProject }: ProjectShowcaseProps) {
  return (
    <section aria-label="精选作品" className="project-showcase" id="works">
      <div
        aria-label="作品区导览"
        className="project-showcase__transition"
        role="region"
      >
        <div className="project-showcase__transition-inner">
          <p className="project-showcase__now">
            <span aria-hidden="true">•</span>
            NOW · AUG '26
            <RevealRule name="now" />
          </p>
          <dl className="project-showcase__transition-grid">
            <div>
              <dt>SHOWING</dt>
              <dd>两组精选影像</dd>
              <small>独立影像与调色练习</small>
            </div>
            <div>
              <dt>MATERIAL</dt>
              <dd>8 条素材</dd>
              <small>每组 4 条</small>
            </div>
            <div>
              <dt>FORMAT</dt>
              <dd>2 : 1 / 16 : 9</dd>
              <small>MOVING IMAGE</small>
            </div>
            <div>
              <dt>BROWSE</dt>
              <dd>卡片切换</dd>
              <small>滚轮 · 按钮 · 方向键</small>
            </div>
          </dl>
        </div>
      </div>
      <LongFormProjects playerOpen={playerOpen} onOpenProject={onOpenProject} />
    </section>
  );
}
