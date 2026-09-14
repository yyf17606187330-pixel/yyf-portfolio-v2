import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import { colorGradingWorkGroup } from '../../content/colorGradingWorks';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { Project } from '../../types/portfolio';
import { LazyPreview } from './LazyPreview';
import { RevealRule } from './RevealRule';
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
    fullSrc: '',
    aspectRatio: item.aspectRatio,
  },
  chapter: `${colorGradingWorkGroup.chapter} / COLOR GRADING`,
  formatLabel: `16 : 9 / ${item.categoryLabel}`,
  durationLabel: item.durationLabel,
  summary: [item.description],
}));

type CardStyle = CSSProperties & {
  '--card-depth': number;
};

function LongFilmCard({
  active,
  cardRef,
  depth,
  descriptionId,
  film,
  index,
  preloadPreview,
  retainPreview,
  previewPlaying,
  previewEnabled,
  playerOpen,
  stackState,
  onOpenProject,
}: {
  active: boolean;
  cardRef: (node: HTMLElement | null) => void;
  depth: number;
  descriptionId: string;
  film: LongFilmRecord;
  index: number;
  preloadPreview: boolean;
  retainPreview: boolean;
  previewPlaying: boolean;
  previewEnabled: boolean;
  playerOpen: boolean;
  stackState: 'active' | 'future' | 'past';
  onOpenProject: LongFormProjectsProps['onOpenProject'];
}) {
  const hasFullMedia = Boolean(film.project.fullSrc);
  const playLabel = hasFullMedia
    ? `播放${film.project.title}完整作品`
    : `${film.project.title}完整视频暂不可用`;

  return (
    <article
      aria-current={active ? 'true' : undefined}
      className="long-form-projects__card"
      data-card-state={stackState}
      data-film-card={film.project.slug}
      ref={cardRef}
      style={{
        '--card-depth': depth,
        aspectRatio: film.project.aspectRatio.replace('/', ' / '),
      } as CardStyle}
    >
      <span aria-hidden="true" className="long-form-projects__card-number">
        {String(index + 1).padStart(2, '0')}
      </span>
      <button
        aria-describedby={active ? descriptionId : undefined}
        aria-label={playLabel}
        className="long-form-projects__play"
        disabled={!active || !hasFullMedia}
        onClick={(event) => onOpenProject(film.project, event.currentTarget)}
        tabIndex={active && hasFullMedia ? 0 : -1}
        type="button"
      >
        <LazyPreview
          enabled={previewPlaying && previewEnabled && !playerOpen}
          preload={preloadPreview || (playerOpen && retainPreview)}
          project={film.project}
          revealAfterFirstFrame
        />
        <span className="long-form-projects__play-label" aria-hidden="true">
          {hasFullMedia ? '播放正片' : '暂不可播放'}
        </span>
      </button>
    </article>
  );
}

function LongFilmCopy({
  film,
  id,
  live = false,
}: {
  film: LongFilmRecord;
  id?: string;
  live?: boolean;
}) {
  return (
    <div
      aria-atomic={live ? 'true' : undefined}
      aria-live={live ? 'polite' : undefined}
      className="long-form-projects__copy"
      data-active-film-copy={live ? '' : undefined}
      id={id}
    >
      <p className="long-form-projects__chapter">
        {film.chapter}
        <span>{film.durationLabel}</span>
      </p>
      <div className="long-form-projects__title-row">
        <h3>{film.project.title}</h3>
      </div>
      <p className="long-form-projects__format">{film.project.year ? `${film.project.year} · ` : ''}{film.formatLabel}</p>
      {film.project.roles.length > 0 ? (
        <p className="long-form-projects__roles">
          {film.project.roles.join(' · ')}
        </p>
      ) : null}
      <div className="long-form-projects__summary">
        {film.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </div>
  );
}

interface LongFilmDeckProps extends LongFormProjectsProps {
  ariaLabel: string;
  controlLabel: string;
  deckId: string;
  featureClassName: string;
  films: readonly LongFilmRecord[];
  previewLabel: string;
}

function LongFilmDeck({
  ariaLabel,
  controlLabel,
  deckId,
  featureClassName,
  films,
  onOpenProject,
  playerOpen,
  previewLabel,
}: LongFilmDeckProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [warmedIndices, setWarmedIndices] = useState<ReadonlySet<number>>(() => (
    new Set(films.length > 1 ? [0, 1] : [0])
  ));
  const [transitioningIndex, setTransitioningIndex] = useState<number | null>(null);
  const [previewPaused, setPreviewPaused] = useState(false);
  const activeIndexRef = useRef(0);
  const animationContextRef = useRef<ReturnType<typeof gsap.context> | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const deckRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const outgoingReleaseCardRef = useRef<HTMLElement | null>(null);
  const outgoingReleaseFrameRef = useRef<number | null>(null);
  const outgoingReleasePaintRef = useRef<number | null>(null);
  const touchGestureCapturedRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const wheelLockedRef = useRef(false);
  const wheelReleaseTimerRef = useRef<number | null>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const commitIndex = useCallback((nextIndex: number) => {
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    setTransitioningIndex(null);
    setWarmedIndices((current) => {
      const followingIndex = nextIndex + 1;
      if (current.has(nextIndex) && (followingIndex >= films.length || current.has(followingIndex))) {
        return current;
      }
      const next = new Set(current);
      next.add(nextIndex);
      if (followingIndex < films.length) next.add(followingIndex);
      return next;
    });
    setPreviewPaused(false);
    isAnimatingRef.current = false;
  }, [films.length]);

  const cancelOutgoingStyleRelease = useCallback((releaseStyles = false) => {
    if (outgoingReleaseFrameRef.current !== null) {
      window.cancelAnimationFrame(outgoingReleaseFrameRef.current);
      outgoingReleaseFrameRef.current = null;
    }
    if (outgoingReleasePaintRef.current !== null) {
      window.cancelAnimationFrame(outgoingReleasePaintRef.current);
      outgoingReleasePaintRef.current = null;
    }
    if (releaseStyles && outgoingReleaseCardRef.current) {
      gsap.set(outgoingReleaseCardRef.current, {
        clearProps: 'transform,opacity,visibility,willChange',
      });
    }
    outgoingReleaseCardRef.current = null;
  }, []);

  const releaseOutgoingStylesAfterPaint = useCallback((card: HTMLElement) => {
    cancelOutgoingStyleRelease(true);
    outgoingReleaseCardRef.current = card;
    outgoingReleaseFrameRef.current = window.requestAnimationFrame(() => {
      outgoingReleaseFrameRef.current = null;
      outgoingReleasePaintRef.current = window.requestAnimationFrame(() => {
        outgoingReleasePaintRef.current = null;
        if (outgoingReleaseCardRef.current === card) {
          gsap.set(card, {
            clearProps: 'transform,opacity,visibility,willChange',
          });
          outgoingReleaseCardRef.current = null;
        }
      });
    });
  }, [cancelOutgoingStyleRelease]);

  const transitionTo = useCallback((nextIndex: number) => {
    const currentIndex = activeIndexRef.current;
    if (
      nextIndex < 0
      || nextIndex >= films.length
      || nextIndex === currentIndex
      || isAnimatingRef.current
    ) return false;

    const currentCard = cardRefs.current[currentIndex];
    const nextCard = cardRefs.current[nextIndex];
    if (reducedMotion || !currentCard || !nextCard || !deckRef.current) {
      commitIndex(nextIndex);
      return true;
    }

    isAnimatingRef.current = true;
    setTransitioningIndex(nextIndex);
    setWarmedIndices((current) => {
      if (current.has(nextIndex)) return current;
      const next = new Set(current);
      next.add(nextIndex);
      return next;
    });
    cancelOutgoingStyleRelease(true);
    animationContextRef.current?.revert();
    animationContextRef.current = gsap.context(() => {
      const onComplete = () => {
        flushSync(() => commitIndex(nextIndex));
        if (nextIndex > currentIndex) {
          releaseOutgoingStylesAfterPaint(currentCard);
        }
      };
      const transitionDepth = Math.min(3, Math.abs(nextIndex - currentIndex));

      gsap.set([currentCard, nextCard], { willChange: 'transform, opacity' });

      if (nextIndex > currentIndex) {
        gsap.to(nextCard, {
          autoAlpha: 1,
          clearProps: 'transform,opacity,visibility,willChange',
          duration: 0.68,
          ease: 'power4.inOut',
          scale: 1,
          x: 0,
          y: 0,
          z: 0,
        });
        gsap.to(currentCard, {
          autoAlpha: 0,
          duration: 0.68,
          ease: 'power4.inOut',
          onComplete,
          rotation: 2.2,
          yPercent: 112,
        });
        return;
      }

      gsap.to(currentCard, {
        autoAlpha: 1 - transitionDepth * 0.16,
        clearProps: 'transform,opacity,visibility,willChange',
        duration: 0.68,
        ease: 'power4.inOut',
        scale: 1 - transitionDepth * 0.009,
        x: `${transitionDepth * 0.24}rem`,
        y: `${transitionDepth * 0.58}rem`,
        z: -transitionDepth,
      });
      gsap.fromTo(
        nextCard,
        { autoAlpha: 1, rotation: -2.2, yPercent: 112, zIndex: 20 },
        {
          autoAlpha: 1,
          clearProps: 'transform,opacity,visibility,zIndex,willChange',
          duration: 0.68,
          ease: 'power4.inOut',
          onComplete,
          rotation: 0,
          yPercent: 0,
        },
      );
    }, deckRef);

    return true;
  }, [cancelOutgoingStyleRelease, commitIndex, films, reducedMotion, releaseOutgoingStylesAfterPaint]);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck || playerOpen) return undefined;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      const currentIndex = activeIndexRef.current;
      const nextIndex = currentIndex + direction;

      if (nextIndex < 0 || nextIndex >= films.length) return;
      event.preventDefault();
      if (wheelLockedRef.current || isAnimatingRef.current) return;

      if (transitionTo(nextIndex)) {
        wheelLockedRef.current = true;
        if (wheelReleaseTimerRef.current !== null) {
          window.clearTimeout(wheelReleaseTimerRef.current);
        }
        wheelReleaseTimerRef.current = window.setTimeout(() => {
          wheelLockedRef.current = false;
          wheelReleaseTimerRef.current = null;
        }, 560);
      }
    };

    deck.addEventListener('wheel', handleWheel, { passive: false });
    return () => deck.removeEventListener('wheel', handleWheel);
  }, [playerOpen, transitionTo]);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck || playerOpen) return undefined;

    const resetTouchGesture = () => {
      touchStartYRef.current = null;
      touchGestureCapturedRef.current = false;
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
      touchGestureCapturedRef.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const startY = touchStartYRef.current;
      const currentY = event.touches[0]?.clientY;
      if (startY === null || currentY === undefined) return;

      if (touchGestureCapturedRef.current) {
        if (event.cancelable) event.preventDefault();
        return;
      }

      const deltaY = startY - currentY;
      if (Math.abs(deltaY) < 8) return;

      const nextIndex = activeIndexRef.current + (deltaY > 0 ? 1 : -1);
      if (nextIndex < 0 || nextIndex >= films.length) return;

      if (event.cancelable) event.preventDefault();
      if (Math.abs(deltaY) >= 48 && transitionTo(nextIndex)) {
        touchGestureCapturedRef.current = true;
      }
    };

    deck.addEventListener('touchstart', handleTouchStart, { passive: true });
    deck.addEventListener('touchmove', handleTouchMove, { passive: false });
    deck.addEventListener('touchend', resetTouchGesture);
    deck.addEventListener('touchcancel', resetTouchGesture);

    return () => {
      deck.removeEventListener('touchstart', handleTouchStart);
      deck.removeEventListener('touchmove', handleTouchMove);
      deck.removeEventListener('touchend', resetTouchGesture);
      deck.removeEventListener('touchcancel', resetTouchGesture);
    };
  }, [playerOpen, transitionTo]);

  useEffect(() => () => {
    cancelOutgoingStyleRelease();
    animationContextRef.current?.revert();
    if (wheelReleaseTimerRef.current !== null) {
      window.clearTimeout(wheelReleaseTimerRef.current);
    }
  }, [cancelOutgoingStyleRelease]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let nextIndex: number | null = null;

    if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(event.key)) {
      nextIndex = activeIndexRef.current + 1;
    } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) {
      nextIndex = activeIndexRef.current - 1;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = films.length - 1;
    }

    if (nextIndex !== null && transitionTo(nextIndex)) event.preventDefault();
  };

  const activeFilm = films[activeIndex];
  const activeDescriptionId = `${deckId}-active-description`;
  const helpId = `${deckId}-help`;
  const activeHasPreview = Boolean(activeFilm.project.previewSrc);

  return (
    <article
      className={`long-form-projects__feature ${featureClassName}`}
      data-card-feature={deckId}
    >
      <div className="long-form-projects__deck-column">
        <div
          aria-describedby={helpId}
          aria-label={ariaLabel}
          aria-roledescription="卡片轮播"
          className="long-form-projects__deck"
          data-film-deck={deckId}
          onKeyDown={handleKeyDown}
          ref={deckRef}
          role="group"
          tabIndex={0}
        >
          <span className="long-form-projects__sr-only" id={helpId}>
            使用上下方向键、按钮或在卡片区域滚动切换作品。
          </span>
          {films.map((film, index) => (
            <LongFilmCard
              active={index === activeIndex}
              cardRef={(node) => { cardRefs.current[index] = node; }}
              depth={Math.min(3, Math.abs(index - activeIndex))}
              descriptionId={activeDescriptionId}
              film={film}
              index={index}
              key={film.project.slug}
              onOpenProject={onOpenProject}
              playerOpen={playerOpen}
              preloadPreview={warmedIndices.has(index)
                && index !== activeIndex
                && index !== transitioningIndex
                && !previewPaused
                && !reducedMotion}
              retainPreview={!previewPaused
                && !reducedMotion
                && (warmedIndices.has(index)
                  || index === activeIndex
                  || index === transitioningIndex)}
              previewPlaying={index === activeIndex || index === transitioningIndex}
              previewEnabled={!previewPaused && !reducedMotion}
              stackState={index < activeIndex
                ? 'past'
                : index === activeIndex ? 'active' : 'future'}
            />
          ))}
        </div>

        <div className="long-form-projects__preview-bar">
          <span>
            {!activeHasPreview || reducedMotion ? '静态封面' : previewLabel}
          </span>
          {activeHasPreview && !reducedMotion ? (
            <button
              aria-pressed={previewPaused}
              onClick={() => setPreviewPaused((paused) => !paused)}
              type="button"
            >
              {previewPaused ? '继续预览' : '暂停预览'}
            </button>
          ) : null}
        </div>

        <div className="long-form-projects__controls">
          <p aria-live="polite">
            <span>{String(activeIndex + 1).padStart(2, '0')}</span>
            {' / '}{String(films.length).padStart(2, '0')} · {activeFilm.project.title}
          </p>
          <div>
            <button
              aria-label={`上一张${controlLabel}`}
              disabled={activeIndex === 0}
              onClick={() => transitionTo(activeIndexRef.current - 1)}
              type="button"
            >
              <span aria-hidden="true">↑</span>
            </button>
            <button
              aria-label={`下一张${controlLabel}`}
              disabled={activeIndex === films.length - 1}
              onClick={() => transitionTo(activeIndexRef.current + 1)}
              type="button"
            >
              <span aria-hidden="true">↓</span>
            </button>
          </div>
        </div>
      </div>

      <LongFilmCopy film={activeFilm} id={activeDescriptionId} live />
    </article>
  );
}

export function LongFormProjects({ playerOpen, onOpenProject }: LongFormProjectsProps) {
  return (
    <section aria-label="长片作品" className="long-form-projects">
      <header className="long-form-projects__heading">
        <span>02.01—02.02</span>
        <RevealRule name="long-form" />
        <p>LONG-FORM / MOVING IMAGE</p>
      </header>
      <div className="long-form-projects__intro">
        <h2 aria-label="影像作品与调色作品">
          <span>影像作品</span>
          <em>与调色作品</em>
        </h2>
        <p>
          两组作品，分别展示完整影像制作与色彩处理能力。
        </p>
      </div>

      <div
        className="long-form-projects__editorial-grid"
        data-long-form-staggered-layout
      >
        <LongFilmDeck
          ariaLabel="精选影像第一辑抽牌浏览"
          controlLabel="作品"
          deckId="selected-films-02-01"
          featureClassName="long-form-projects__feature--deck"
          films={selectedFilms}
          onOpenProject={onOpenProject}
          playerOpen={playerOpen}
          previewLabel="8 秒静音预览"
        />
        <LongFilmDeck
          ariaLabel="调色作品第二辑抽牌浏览"
          controlLabel="调色作品"
          deckId={colorGradingWorkGroup.id}
          featureClassName="long-form-projects__feature--narrative"
          films={colorGradingFilms}
          onOpenProject={onOpenProject}
          playerOpen={playerOpen}
          previewLabel="静音预览"
        />
      </div>
    </section>
  );
}
