import { ArrowIcon } from '../../../features/navigation/ArrowIcon';
import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { colorGradingWorkGroup } from '../../content/colorGradingWorks';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { Project } from '../../types/portfolio';
import { LazyPreview } from './LazyPreview';
import './LongFormProjects.css';

interface LongFormProjectsProps {
  playerOpen: boolean;
  onOpenProject: (project: Project, opener: HTMLElement) => void;
}

interface LongFilmRecord {
  project: Project;
  chapter: string;
  formatLabel: string;
  durationLabel: string;
  excerpt?: boolean;
  summary: readonly string[];
}

const selectedFilms: readonly LongFilmRecord[] = [
  {
    project: {
      slug: 'travel-vlog',
      title: '旅拍 Vlog',
      category: 'film',
      year: '',
      client: '',
      roles: ['剪辑', '调色', '配乐', '人声'],
      featured: true,
      order: 2,
      poster: 'projects/long-form/travel/poster-card.webp',
      previewSrc: 'projects/long-form/travel/preview-h264.mp4',
      fullSrc: 'projects/long-form/travel/full-hevc.mp4',
      aspectRatio: '2/1',
    },
    chapter: '02.01 / LONG-FORM',
    formatLabel: '2 : 1 / TRAVEL FILM',
    durationLabel: '04:20',
    summary: [
      '从 800+ 段素材中梳理叙事与节奏，完成剪辑、调色、配乐与人声处理。',
    ],
  },
  {
    project: {
      slug: 'narrative-film',
      title: '剧情短片',
      category: 'film',
      year: '',
      client: '',
      roles: ['编导', '制片', '拍摄', '剪辑', '调色', '输出'],
      featured: true,
      order: 3,
      poster: 'projects/long-form/narrative/poster-card.webp',
      previewSrc: 'projects/long-form/narrative/preview-h264.mp4',
      fullSrc: 'projects/long-form/narrative/full-hevc.mp4',
      aspectRatio: '16/9',
    },
    chapter: '02.01 / NARRATIVE',
    formatLabel: '16 : 9 / SHORT FILM',
    durationLabel: '03:24',
    summary: [
      '从编导、制片到拍摄与后期，主导剧情短片的完整制作。',
    ],
  },
  {
    project: {
      slug: 'dark-room',
      title: 'MacBook 短片',
      category: 'film',
      year: '2026',
      client: '',
      roles: [],
      featured: true,
      order: 4,
      poster: 'projects/long-form/dark-room/poster-card.webp',
      previewSrc: 'projects/long-form/dark-room/preview-h264.mp4',
      fullSrc: 'projects/long-form/dark-room/full-hevc.mp4',
      aspectRatio: '16/9',
    },
    chapter: '02.01 / PRODUCT FILM',
    formatLabel: '16 : 9 / PRODUCT STUDY',
    durationLabel: '00:22',
    summary: ['以 MacBook 为主体的 22 秒自主产品短片。'],
  },
  {
    project: {
      slug: 'film-2025-06-15',
      title: '棋局短片',
      category: 'film',
      year: '2025',
      client: '',
      roles: [],
      featured: true,
      order: 5,
      poster: 'projects/long-form/film-2025-06-15/poster-card.webp',
      previewSrc: 'projects/long-form/film-2025-06-15/preview-h264.mp4',
      fullSrc: 'projects/long-form/film-2025-06-15/full-hevc.mp4',
      aspectRatio: '16/9',
    },
    chapter: '02.01 / SHORT FILM',
    formatLabel: '16 : 9 / NARRATIVE STUDY',
    durationLabel: '01:23',
    summary: ['围绕室内人物与棋局展开的 1 分 23 秒剧情短片。'],
  },
];

const colorGradingFilms: readonly LongFilmRecord[] = colorGradingWorkGroup.items.map((item, index) => ({
  project: {
    slug: item.slug,
    title: item.title,
    category: item.category,
    year: '',
    client: '',
    roles: [...item.roles],
    featured: true,
    order: index + 1,
    poster: item.poster,
    previewSrc: item.previewSrc,
    fullSrc: item.previewSrc,
    aspectRatio: item.aspectRatio,
  },
  chapter: `${colorGradingWorkGroup.chapter} / COLOR GRADING`,
  formatLabel: `16 : 9 / ${item.categoryLabel}`,
  durationLabel: item.durationLabel,
  summary: [item.description],
  excerpt: true,
}));


function LongFilmDeck({ films, deckId, label, playerOpen, onOpenProject }: LongFormProjectsProps & {
  films: readonly LongFilmRecord[];
  deckId: string;
  label: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewPaused, setPreviewPaused] = useState(false);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const film = films[activeIndex];
  const hasFullMedia = Boolean(film.project.fullSrc);
  const panelId = deckId + '-panel';
  const choose = (index: number) => {
    setActiveIndex(index);
    setPreviewPaused(false);
  };
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = films.length - 1;
    else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % films.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + films.length) % films.length;
    else return;
    event.preventDefault();
    choose(next);
    buttonsRef.current[next]?.focus();
  };

  return (
    <article className="film-console" data-film-deck={deckId} aria-label={label}>
      <div className="film-console__screen-column" id={panelId}>
        <div className="film-console__topline"><span>{label}</span><span>0{activeIndex + 1} / 0{films.length}</span></div>
        <div className="film-console__screen" data-film-card={film.project.slug}>
          <button className="film-console__play" type="button" disabled={!hasFullMedia}
            aria-label={film.excerpt ? '放大观看' + film.project.title + '调色片段' : hasFullMedia ? '播放' + film.project.title + '完整作品' : film.project.title + '完整视频暂不可用'}
            onClick={(event) => onOpenProject(film.project, event.currentTarget)}>
            <LazyPreview key={film.project.slug} project={film.project} revealAfterFirstFrame
              enabled={!playerOpen && !previewPaused && !reducedMotion}
              preload={playerOpen && !previewPaused && !reducedMotion} />
            <span className="film-console__play-label" aria-hidden="true">{film.excerpt ? '放大观看 · 调色片段' : '播放正片'} <ArrowIcon /></span>
          </button>
        </div>
        <div className="film-console__preview-bar">
          <span>{reducedMotion ? '静态封面' : film.excerpt ? '调色片段 · 可放大观看' : hasFullMedia ? '8 秒静音预览' : '静音预览 · 完整视频暂未提供'}</span>
          {!reducedMotion && film.project.previewSrc ? (
            <button type="button" aria-pressed={previewPaused} onClick={() => setPreviewPaused(!previewPaused)}>
              {previewPaused ? '继续预览' : '暂停预览'}
            </button>
          ) : null}
        </div>
        <div className="film-console__copy" aria-live="polite" aria-atomic="true" data-active-film-copy>
          <div><p>{film.chapter} / {film.durationLabel}</p><h3>{film.project.title}</h3></div>
          <div><p className="film-console__roles">{film.project.roles.join(' · ') || film.formatLabel}</p>
            {film.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </div>
      </div>
      <div className="film-console__menu">
        <p className="film-console__menu-title">SELECT A FILM<span aria-hidden="true">↓</span></p>
        <ol aria-label={label + '目录'}>
          {films.map((item, index) => (
            <li key={item.project.slug}>
              <button type="button" aria-label={'选择' + item.project.title}
                aria-controls={panelId} aria-pressed={index === activeIndex}
                onClick={() => choose(index)} onKeyDown={(event) => handleKeyDown(event, index)}
                ref={(button) => { buttonsRef.current[index] = button; }}>
                <span className="film-console__number">0{index + 1}</span>
                <span><strong>{item.project.title}</strong><small>{item.formatLabel}</small></span>
                <span className="film-console__arrow" aria-hidden="true"><ArrowIcon /></span>
              </button>
            </li>
          ))}
        </ol>
        <p className="film-console__menu-note">从叙事到色彩，<br />让每一个镜头有自己的位置。</p>
      </div>
    </article>
  );
}

export function LongFormProjects({ playerOpen, onOpenProject }: LongFormProjectsProps) {
  return (
    <section aria-label="长片作品" className="long-form-projects">
      <header className="long-form-projects__heading">
        <p>02 / SELECTED WORK</p><span>IMAGE / NARRATIVE / COLOR</span>
      </header>
      <div className="long-form-projects__intro">
        <div><p aria-hidden="true">SELECTED<br /><em>WORK.</em></p><h2>影像作品与调色作品</h2></div>
        <p>两组作品，分别展示完整影像制作与色彩处理能力。<br />选择作品，进入画面。</p>
      </div>
      <div className="long-form-projects__consoles">
        <LongFilmDeck films={selectedFilms} deckId="selected-films-02-01" label="精选影像 / 01"
          playerOpen={playerOpen} onOpenProject={onOpenProject} />
        <LongFilmDeck films={colorGradingFilms} deckId={colorGradingWorkGroup.id} label="调色作品 / 02"
          playerOpen={playerOpen} onOpenProject={onOpenProject} />
      </div>
    </section>
  );
}
