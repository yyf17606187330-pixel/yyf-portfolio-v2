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
import type { WaterPurifierMediaItem } from '../../content/waterPurifierMedia';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { Project } from '../../types/portfolio';
import { LazyPreview } from './LazyPreview';
import './ProjectMediaDeck.css';

type CardStyle = CSSProperties & {
  '--card-depth': number;
};

export interface ProjectMediaDeckProps {
  baseDescription: string;
  mediaItems: readonly WaterPurifierMediaItem[];
  onOpenProject: (project: Project, opener: HTMLElement) => void;
  playerOpen: boolean;
  project: Project;
}

export interface ProjectMediaDeckItem {
  description: string;
  project: Project;
}

export function createProjectMediaDeckItems(
  project: Project,
  baseDescription: string,
  mediaItems: readonly WaterPurifierMediaItem[],
): readonly ProjectMediaDeckItem[] {
  return [
    { description: baseDescription, project },
    ...mediaItems.map((item, index) => ({
      description: item.preview.selectionReason,
      project: {
        ...project,
        aspectRatio: item.aspectRatio,
        fallbackSrc: undefined,
        fullSrc: item.full.path,
        order: project.order + index + 1,
        poster: item.poster.asset.path,
        previewSrc: item.preview.asset.path,
        slug: `${project.slug}-${item.slug}`,
        title: project.title,
      },
    })),
  ];
}

export function ProjectMediaDeck({
  baseDescription,
  mediaItems,
  onOpenProject,
  playerOpen,
  project,
}: ProjectMediaDeckProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioningIndex, setTransitioningIndex] = useState<number | null>(null);
  const [warmedIndices, setWarmedIndices] = useState<ReadonlySet<number>>(() => (
    new Set(mediaItems.length > 0 ? [0, 1] : [0])
  ));
  const deckItems = createProjectMediaDeckItems(project, baseDescription, mediaItems);
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
      if (
        current.has(nextIndex)
        && (followingIndex >= deckItems.length || current.has(followingIndex))
      ) return current;
      const next = new Set(current);
      next.add(nextIndex);
      if (followingIndex < deckItems.length) next.add(followingIndex);
      return next;
    });
    isAnimatingRef.current = false;
  }, [deckItems.length]);

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
      || nextIndex >= deckItems.length
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
        gsap.set(nextCard, {
          clearProps: 'transform,opacity,visibility,zIndex,willChange',
        });
        releaseOutgoingStylesAfterPaint(currentCard);
      };
      const transitionDepth = Math.min(3, Math.abs(nextIndex - currentIndex));

      gsap.set([currentCard, nextCard], { willChange: 'transform, opacity' });
      if (nextIndex > currentIndex) {
        gsap.to(nextCard, {
          autoAlpha: 1,
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
          rotation: -2.2,
          yPercent: -112,
        });
        return;
      }

      gsap.to(currentCard, {
        autoAlpha: 1 - transitionDepth * 0.16,
        duration: 0.68,
        ease: 'power4.inOut',
        scale: 1 - transitionDepth * 0.009,
        x: `${transitionDepth * 0.24}rem`,
        y: `${transitionDepth * -0.38}rem`,
        z: -transitionDepth,
      });
      gsap.fromTo(
        nextCard,
        { autoAlpha: 1, rotation: 2.2, yPercent: -112, zIndex: 20 },
        {
          autoAlpha: 1,
          duration: 0.68,
          ease: 'power4.inOut',
          onComplete,
          rotation: 0,
          yPercent: 0,
        },
      );
    }, deckRef);
    return true;
  }, [
    cancelOutgoingStyleRelease,
    commitIndex,
    deckItems.length,
    reducedMotion,
    releaseOutgoingStylesAfterPaint,
  ]);
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let nextIndex: number | null = null;
    if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(event.key)) {
      nextIndex = activeIndexRef.current + 1;
    } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) {
      nextIndex = activeIndexRef.current - 1;
    }
    if (nextIndex !== null && transitionTo(nextIndex)) event.preventDefault();
  };

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck || playerOpen) return undefined;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8) return;
      const nextIndex = activeIndexRef.current + (event.deltaY > 0 ? 1 : -1);
      if (nextIndex < 0 || nextIndex >= deckItems.length) return;

      event.preventDefault();
      if (wheelLockedRef.current) return;
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
  }, [deckItems.length, playerOpen, transitionTo]);

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
      if (nextIndex < 0 || nextIndex >= deckItems.length) return;

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
  }, [deckItems.length, playerOpen, transitionTo]);

  useEffect(() => () => {
    cancelOutgoingStyleRelease();
    animationContextRef.current?.revert();
    if (wheelReleaseTimerRef.current !== null) {
      window.clearTimeout(wheelReleaseTimerRef.current);
    }
  }, [cancelOutgoingStyleRelease]);

  return (
    <div className="project-media-deck">
      <div
        aria-label={`${project.title}媒体卡组`}
        className="project-media-deck__stack"
        onKeyDown={handleKeyDown}
        ref={deckRef}
        role="group"
        tabIndex={0}
      >
        {deckItems.map((item, index) => (
          <article
            aria-current={index === activeIndex ? 'true' : undefined}
            className="project-media-deck__card"
            data-card-state={index < activeIndex
              ? 'past'
              : index === activeIndex ? 'active' : 'future'}
            data-project-media-card={item.project.slug}
            key={item.project.slug}
            ref={(node) => { cardRefs.current[index] = node; }}
            style={{
              '--card-depth': Math.min(3, Math.abs(index - activeIndex)),
            } as CardStyle}
          >
            <span aria-hidden="true" className="project-media-deck__card-number">
              {String(index + 1).padStart(2, '0')}
            </span>
            <button
              aria-label={`播放${project.title}短片 ${String(index + 1).padStart(2, '0')}`}
              disabled={index !== activeIndex}
              className="project-media-deck__play"
              onClick={(event) => onOpenProject(item.project, event.currentTarget)}
              tabIndex={index === activeIndex ? 0 : -1}
              type="button"
            >
              <LazyPreview
                enabled={(index === activeIndex || index === transitioningIndex)
                  && !playerOpen
                  && !reducedMotion}
                preload={warmedIndices.has(index)
                  && (index !== activeIndex || playerOpen)
                  && index !== transitioningIndex
                  && !reducedMotion}
                project={item.project}
                revealAfterFirstFrame
              />
            </button>
            <span aria-hidden="true" className="project-media-deck__play-label">
              播放正片
            </span>
          </article>
        ))}
      </div>
      <div className="project-media-deck__controls">
        <p aria-live="polite" className="project-media-deck__counter">
          <span>
            {String(activeIndex + 1).padStart(2, '0')}
            {' / '}
            {String(deckItems.length).padStart(2, '0')}
          </span>
        </p>
        <div className="project-media-deck__buttons">
          <button
            aria-label={`上一张${project.title}作品`}
            disabled={activeIndex === 0}
            onClick={() => transitionTo(activeIndexRef.current - 1)}
            type="button"
          >
            <span aria-hidden="true">↑</span>
          </button>
          <button
            aria-label={`下一张${project.title}作品`}
            disabled={activeIndex === deckItems.length - 1}
            onClick={() => transitionTo(activeIndexRef.current + 1)}
            type="button"
          >
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </div>
    </div>
  );
}
