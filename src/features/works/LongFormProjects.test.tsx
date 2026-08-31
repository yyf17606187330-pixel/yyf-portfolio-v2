import { act, cleanup, createEvent, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '../../types/portfolio';
import { LongFormProjects } from './LongFormProjects';

const gsapMock = vi.hoisted(() => {
  const state = {
    autoComplete: true,
    completionActiveSlugs: [] as Array<string | null>,
  };
  const tween = { kill: vi.fn() };
  return {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: vi.fn() };
    }),
    fromTo: vi.fn((_target: unknown, _from: unknown, to: { onComplete?: () => void }) => {
      if (state.autoComplete) to.onComplete?.();
      return tween;
    }),
    set: vi.fn(),
    state,
    to: vi.fn((_target: unknown, vars: { onComplete?: () => void }) => {
      if (state.autoComplete && vars.onComplete) {
        vars.onComplete();
        state.completionActiveSlugs.push(
          document
            .querySelector('[data-film-card][aria-current="true"]')
            ?.getAttribute('data-film-card') ?? null,
        );
      }
      return tween;
    }),
  };
});

vi.mock('gsap', () => ({
  default: {
    context: gsapMock.context,
    fromTo: gsapMock.fromTo,
    set: gsapMock.set,
    to: gsapMock.to,
  },
}));

describe('LongFormProjects card deck', () => {
  const observed = new Map<Element, IntersectionObserverCallback>();
  const pause = vi.fn();
  const play = vi.fn(() => Promise.resolve());

  const activeSlug = (container: HTMLElement) => (
    container.querySelector('[data-film-card][aria-current="true"]')?.getAttribute('data-film-card')
  );

  const enterObservedPreviews = () => {
    act(() => {
      for (const [target, callback] of observed) {
        callback(
          [{ isIntersecting: true, target } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      }
    });
  };

  beforeEach(() => {
    observed.clear();
    pause.mockClear();
    play.mockClear();
    gsapMock.context.mockClear();
    gsapMock.fromTo.mockClear();
    gsapMock.set.mockClear();
    gsapMock.to.mockClear();
    gsapMock.state.autoComplete = true;
    gsapMock.state.completionActiveSlugs.length = 0;
    vi.useFakeTimers();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => ({
      observe: vi.fn((target: Element) => observed.set(target, callback)),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
    })));
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('keeps the approved four-card order and exposes only factual visitor-facing metadata', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const cards = [...container.querySelectorAll<HTMLElement>('[data-film-card]')];

    expect(screen.getByRole('heading', {
      level: 2,
      name: '两种影像练习 关于行走与叙事',
    })).toBeInTheDocument();
    expect(container).toHaveTextContent('从 800+ 段素材中梳理内容与节奏');
    expect(cards.map((card) => card.dataset.filmCard)).toEqual([
      'travel-vlog',
      'narrative-film',
      'dark-room',
      'film-2025-06-15',
    ]);
    expect(cards.map((card) => card.querySelector('.long-form-projects__card-number')?.textContent))
      .toEqual(['01', '02', '03', '04']);
    expect(activeSlug(container)).toBe('travel-vlog');
    const activeCopy = container.querySelector('[data-active-film-copy]');
    expect(activeCopy).toHaveTextContent('旅拍 Vlog');
    expect(activeCopy).toHaveTextContent('04:20');
    expect(activeCopy).toHaveTextContent('剪辑 · 调色 · 配乐 · 人声');
    expect(container).not.toHaveTextContent(
      /排版占位|待补|待替换|待确认|当前不代填|真实资料|内部说明/,
    );
    expect(container.querySelector('.long-form-projects__editorial-grid')).toBeInTheDocument();
    expect(container.querySelector('.long-form-projects__deck-column')).toBeInTheDocument();
    expect(container.querySelectorAll('.long-form-projects__preview-bar > span')).toHaveLength(1);
    expect(container.querySelector('.long-form-projects__preview-bar > span'))
      .toHaveTextContent('8 秒静音预览');
    expect(cards.map((card) => card.querySelector('img')?.getAttribute('src'))).toEqual([
      '/media/projects/long-form/travel/poster-card.webp',
      '/media/projects/long-form/narrative/poster-card.webp',
      '/media/projects/long-form/dark-room/poster-card.webp',
      '/media/projects/long-form/film-2025-06-15/poster-card.webp',
    ]);
    expect(container.querySelectorAll('.lazy-preview__placeholder')).toHaveLength(0);
    expect(container.querySelector('video[src*="full-"]')).not.toBeInTheDocument();
  });

  it('updates the original editorial copy in place without creating a second project layout', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const copySlot = container.querySelector('[data-active-film-copy]');

    expect(copySlot).toHaveTextContent('旅拍 Vlog');
    expect(copySlot).toHaveTextContent('从 800+ 段素材中梳理内容与节奏');
    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));

    expect(container.querySelector('[data-active-film-copy]')).toBe(copySlot);
    expect(copySlot).toHaveTextContent('剧情短片');
    expect(copySlot).toHaveTextContent('主导剧情短片从编导、制片、拍摄、剪辑、调色到输出');
    expect(container.querySelectorAll('.long-form-projects__editorial-grid')).toHaveLength(1);
  });

  it('keeps the card deck in the original travel media slot and preserves the lower narrative feature', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const staggeredLayout = container.querySelector('[data-long-form-staggered-layout]');
    const deckFeature = container.querySelector('[data-card-feature]');
    const narrativeFeature = container.querySelector('[data-static-feature="narrative-film"]');

    expect(staggeredLayout).toBeInTheDocument();
    expect(deckFeature).toContainElement(container.querySelector('[data-film-deck]'));
    expect(deckFeature).toContainElement(container.querySelector('[data-active-film-copy]'));
    expect(narrativeFeature).toHaveTextContent('剧情短片');
    expect(narrativeFeature).toHaveTextContent('03:24');
    expect(narrativeFeature).toHaveTextContent('编导 · 制片 · 拍摄 · 剪辑 · 调色 · 输出');
    expect(narrativeFeature?.querySelector('img')).toHaveAttribute(
      'src',
      '/media/projects/long-form/narrative/poster-card.webp',
    );
    expect(narrativeFeature?.querySelector('video')).not.toBeInTheDocument();

    const preservedNarrative = narrativeFeature;
    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));
    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));

    expect(container.querySelector('[data-static-feature="narrative-film"]'))
      .toBe(preservedNarrative);
    expect(preservedNarrative).toHaveTextContent('剧情短片');
    expect(container.querySelector('[data-active-film-copy]')).toHaveTextContent('MacBook 短片');
  });

  it('uses one wheel gesture per card while releasing normal page scroll at both boundaries', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const deck = container.querySelector('[data-film-deck]') as HTMLElement;

    const firstUp = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -120 });
    act(() => deck.dispatchEvent(firstUp));
    expect(firstUp.defaultPrevented).toBe(false);
    expect(activeSlug(container)).toBe('travel-vlog');

    const firstDown = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 });
    act(() => deck.dispatchEvent(firstDown));
    expect(firstDown.defaultPrevented).toBe(true);
    expect(activeSlug(container)).toBe('narrative-film');

    const sameGesture = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 });
    act(() => deck.dispatchEvent(sameGesture));
    expect(activeSlug(container)).toBe('narrative-film');

    act(() => vi.advanceTimersByTime(600));
    act(() => deck.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 })));
    expect(activeSlug(container)).toBe('dark-room');
    act(() => vi.advanceTimersByTime(600));
    act(() => deck.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 })));
    expect(activeSlug(container)).toBe('film-2025-06-15');
    act(() => vi.advanceTimersByTime(600));

    const lastDown = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 });
    act(() => deck.dispatchEvent(lastDown));
    expect(lastDown.defaultPrevented).toBe(false);
    expect(activeSlug(container)).toBe('film-2025-06-15');
  });

  it('supports buttons and keyboard without changing the fixed source order', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const deck = container.querySelector('[data-film-deck]') as HTMLElement;
    const previous = screen.getByRole('button', { name: '上一张作品' });
    const next = screen.getByRole('button', { name: '下一张作品' });

    expect(previous).toBeDisabled();
    fireEvent.click(next);
    expect(activeSlug(container)).toBe('narrative-film');
    fireEvent.keyDown(deck, { key: 'ArrowDown' });
    expect(activeSlug(container)).toBe('dark-room');
    fireEvent.keyDown(deck, { key: 'ArrowUp' });
    expect(activeSlug(container)).toBe('narrative-film');
    fireEvent.keyDown(deck, { key: 'End' });
    expect(activeSlug(container)).toBe('film-2025-06-15');
    expect(next).toBeDisabled();
    fireEvent.keyDown(deck, { key: 'Home' });
    expect(activeSlug(container)).toBe('travel-vlog');
    expect(previous).toBeDisabled();
  });

  it('promotes only the two transitioning cards and settles the incoming card without an end snap', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const currentCard = container.querySelector('[data-film-card="travel-vlog"]');
    const nextCard = container.querySelector('[data-film-card="narrative-film"]');

    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));

    expect(gsapMock.set).toHaveBeenCalledWith([currentCard, nextCard], {
      willChange: 'transform, opacity',
    });
    expect(gsapMock.to).toHaveBeenCalledWith(nextCard, expect.objectContaining({
      autoAlpha: 1,
      scale: 1,
      x: 0,
      y: 0,
      z: 0,
    }));
    expect(gsapMock.to).toHaveBeenCalledWith(currentCard, expect.objectContaining({
      clearProps: 'transform,opacity,visibility,willChange',
      duration: 0.68,
    }));
  });

  it('commits the incoming card before the completed tween can expose cleared outgoing styles', () => {
    render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));

    expect(gsapMock.state.completionActiveSlugs).toEqual(['narrative-film']);
  });

  it('captures one valid touch swipe while releasing page scroll at both deck boundaries', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const deck = container.querySelector('[data-film-deck]') as HTMLElement;

    fireEvent.touchStart(deck, { touches: [{ clientY: 500 }] });
    const firstUp = createEvent.touchMove(deck, {
      bubbles: true,
      cancelable: true,
      touches: [{ clientY: 390 }],
    });
    fireEvent(deck, firstUp);
    expect(firstUp.defaultPrevented).toBe(true);
    expect(activeSlug(container)).toBe('narrative-film');

    const sameGesture = createEvent.touchMove(deck, {
      bubbles: true,
      cancelable: true,
      touches: [{ clientY: 300 }],
    });
    fireEvent(deck, sameGesture);
    expect(sameGesture.defaultPrevented).toBe(true);
    expect(activeSlug(container)).toBe('narrative-film');
    fireEvent.touchEnd(deck);

    fireEvent.keyDown(deck, { key: 'Home' });
    fireEvent.touchStart(deck, { touches: [{ clientY: 390 }] });
    const firstDown = createEvent.touchMove(deck, {
      bubbles: true,
      cancelable: true,
      touches: [{ clientY: 500 }],
    });
    fireEvent(deck, firstDown);
    expect(firstDown.defaultPrevented).toBe(false);
    expect(activeSlug(container)).toBe('travel-vlog');
    fireEvent.touchEnd(deck);

    fireEvent.keyDown(deck, { key: 'End' });
    fireEvent.touchStart(deck, { touches: [{ clientY: 500 }] });
    const lastUp = createEvent.touchMove(deck, {
      bubbles: true,
      cancelable: true,
      touches: [{ clientY: 390 }],
    });
    fireEvent(deck, lastUp);
    expect(lastUp.defaultPrevented).toBe(false);
    expect(activeSlug(container)).toBe('film-2025-06-15');
    fireEvent.touchEnd(deck);
  });

  it('mounts and plays a preview only for the current card, pausing it before the next card loads', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    enterObservedPreviews();

    let videos = container.querySelectorAll<HTMLVideoElement>('.long-form-projects__card video');
    expect(videos).toHaveLength(1);
    expect(videos[0]).toHaveAttribute('src', '/media/projects/long-form/travel/preview-h264.mp4');

    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));
    videos = container.querySelectorAll<HTMLVideoElement>('.long-form-projects__card video');
    expect(videos).toHaveLength(1);
    expect(videos[0]).toHaveAttribute('src', '/media/projects/long-form/narrative/preview-h264.mp4');
    expect(pause).toHaveBeenCalled();
    expect(container.querySelector('video[src*="full-hevc"]')).not.toBeInTheDocument();
  });

  it('keeps each incoming preview behind its poster until that video decodes a first frame', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    enterObservedPreviews();

    let video = container.querySelector<HTMLVideoElement>('.long-form-projects__card video');
    expect(video).toHaveAttribute('src', '/media/projects/long-form/travel/preview-h264.mp4');
    expect(video).toHaveAttribute('data-preview-ready', 'false');

    fireEvent.loadedData(video as HTMLVideoElement);
    expect(video).toHaveAttribute('data-preview-ready', 'true');

    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));
    video = container.querySelector<HTMLVideoElement>('.long-form-projects__card video');
    expect(video).toHaveAttribute('src', '/media/projects/long-form/narrative/preview-h264.mp4');
    expect(video).toHaveAttribute('data-preview-ready', 'false');

    fireEvent.loadedData(video as HTMLVideoElement);
    expect(video).toHaveAttribute('data-preview-ready', 'true');

    fireEvent.click(screen.getByRole('button', { name: '上一张作品' }));
    video = container.querySelector<HTMLVideoElement>('.long-form-projects__card video');
    expect(video).toHaveAttribute('src', '/media/projects/long-form/travel/preview-h264.mp4');
    expect(video).toHaveAttribute('data-preview-ready', 'false');
  });

  it('opens only the current project and passes frozen full media only after activation', () => {
    const onOpenProject = vi.fn<(project: Project, opener: HTMLElement) => void>();
    const { container } = render(
      <LongFormProjects playerOpen={false} onOpenProject={onOpenProject} />,
    );

    const travelPlay = screen.getByRole('button', { name: '播放旅拍 Vlog完整作品' });
    fireEvent.click(travelPlay);
    expect(onOpenProject).toHaveBeenLastCalledWith(
      expect.objectContaining({ slug: 'travel-vlog' }),
      travelPlay,
    );

    fireEvent.keyDown(container.querySelector('[data-film-deck]') as HTMLElement, {
      key: 'ArrowDown',
    });
    const narrativePlay = screen.getByRole('button', { name: '播放剧情短片完整作品' });
    fireEvent.click(narrativePlay);
    expect(onOpenProject).toHaveBeenLastCalledWith(
      expect.objectContaining({
        slug: 'narrative-film',
        roles: ['编导', '制片', '拍摄', '剪辑', '调色', '输出'],
      }),
      narrativePlay,
    );

    fireEvent.keyDown(container.querySelector('[data-film-deck]') as HTMLElement, { key: 'End' });
    const filmPlay = screen.getByRole('button', { name: '播放棋局短片完整作品' });
    fireEvent.click(filmPlay);
    expect(onOpenProject).toHaveBeenLastCalledWith(
      expect.objectContaining({
        slug: 'film-2025-06-15',
        fullSrc: 'projects/long-form/film-2025-06-15/full-hevc.mp4',
        roles: [],
      }),
      filmPlay,
    );
  });

  it('switches immediately and keeps every card static when reduced motion is requested', () => {
    gsapMock.state.autoComplete = false;
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));

    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));

    expect(activeSlug(container)).toBe('narrative-film');
    enterObservedPreviews();
    expect(container.querySelector('.long-form-projects__card video')).not.toBeInTheDocument();
  });
});
