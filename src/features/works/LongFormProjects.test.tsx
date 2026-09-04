import { act, cleanup, createEvent, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '../../types/portfolio';
import { LongFormProjects } from './LongFormProjects';

const gsapMock = vi.hoisted(() => {
  const state = {
    autoComplete: true,
    completionCallbacks: [] as Array<() => void>,
    completionActiveSlugs: [] as Array<string | null>,
  };
  const tween = { kill: vi.fn() };
  return {
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: vi.fn() };
    }),
    fromTo: vi.fn((_target: unknown, _from: unknown, to: { onComplete?: () => void }) => {
      if (to.onComplete) {
        if (state.autoComplete) to.onComplete();
        else state.completionCallbacks.push(to.onComplete);
      }
      return tween;
    }),
    set: vi.fn(),
    state,
    to: vi.fn((_target: unknown, vars: { onComplete?: () => void }) => {
      if (vars.onComplete) {
        const complete = () => {
          vars.onComplete?.();
          state.completionActiveSlugs.push(
            document
              .querySelector('[data-film-card][aria-current="true"]')
              ?.getAttribute('data-film-card') ?? null,
          );
        };
        if (state.autoComplete) complete();
        else state.completionCallbacks.push(complete);
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
  const animationFrames: FrameRequestCallback[] = [];
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
    animationFrames.length = 0;
    pause.mockClear();
    play.mockClear();
    gsapMock.context.mockClear();
    gsapMock.fromTo.mockClear();
    gsapMock.set.mockClear();
    gsapMock.to.mockClear();
    gsapMock.state.autoComplete = true;
    gsapMock.state.completionCallbacks.length = 0;
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
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
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
    const firstDeck = container.querySelector<HTMLElement>('[data-film-deck="selected-films-02-01"]');
    const cards = [...firstDeck!.querySelectorAll<HTMLElement>('[data-film-card]')];

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
    expect(container.querySelectorAll('.long-form-projects__preview-bar > span')).toHaveLength(2);
    expect(firstDeck?.closest('[data-card-feature]')
      ?.querySelector('.long-form-projects__preview-bar > span'))
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

  it('mounts two independent four-card decks without combining their active state', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const decks = [...container.querySelectorAll<HTMLElement>('[data-film-deck]')];

    expect(decks).toHaveLength(2);
    expect([...decks[0].querySelectorAll<HTMLElement>('[data-film-card]')]
      .map((card) => card.dataset.filmCard)).toEqual([
      'travel-vlog',
      'narrative-film',
      'dark-room',
      'film-2025-06-15',
    ]);
    expect([...decks[1].querySelectorAll<HTMLElement>('[data-film-card]')]
      .map((card) => card.dataset.filmCard)).toEqual([
      'grading-skate-workshop',
      'grading-percussion',
      'grading-dance',
      'grading-winter-aerial',
    ]);

    const secondFeature = decks[1].closest<HTMLElement>('[data-card-feature]')!;
    fireEvent.click(within(secondFeature).getByRole('button', { name: '下一张调色练习' }));
    expect(activeSlug(decks[0])).toBe('travel-vlog');
    expect(activeSlug(decks[1])).toBe('grading-percussion');
    expect(decks[0].closest('[data-card-feature]')).toHaveTextContent('旅拍 Vlog');
    expect(secondFeature).toHaveTextContent('民族器乐');
    expect(secondFeature).toHaveTextContent('00:03');

    fireEvent.keyDown(decks[0], { key: 'ArrowDown' });
    expect(activeSlug(decks[0])).toBe('narrative-film');
    expect(activeSlug(decks[1])).toBe('grading-percussion');

    const secondWheel = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 });
    act(() => decks[1].dispatchEvent(secondWheel));
    expect(secondWheel.defaultPrevented).toBe(true);
    expect(activeSlug(decks[0])).toBe('narrative-film');
    expect(activeSlug(decks[1])).toBe('grading-dance');

    fireEvent.touchStart(decks[1], { touches: [{ clientY: 500 }] });
    const secondSwipe = createEvent.touchMove(decks[1], {
      bubbles: true,
      cancelable: true,
      touches: [{ clientY: 390 }],
    });
    fireEvent(decks[1], secondSwipe);
    expect(secondSwipe.defaultPrevented).toBe(true);
    expect(activeSlug(decks[0])).toBe('narrative-film');
    expect(activeSlug(decks[1])).toBe('grading-winter-aerial');

    const secondBoundary = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 });
    act(() => decks[1].dispatchEvent(secondBoundary));
    expect(secondBoundary.defaultPrevented).toBe(false);
  });

  it('keeps every stacked card at its source ratio without a filler frame', () => {
    const { container } = render(
      <LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />,
    );
    const decks = [...container.querySelectorAll<HTMLElement>('[data-film-deck]')];

    expect([...decks[0].querySelectorAll<HTMLElement>('[data-film-card]')]
      .map((card) => card.style.aspectRatio)).toEqual([
      '2 / 1',
      '16 / 9',
      '16 / 9',
      '16 / 9',
    ]);
    expect([...decks[1].querySelectorAll<HTMLElement>('[data-film-card]')]
      .map((card) => card.style.aspectRatio)).toEqual([
      '16 / 9',
      '16 / 9',
      '16 / 9',
      '16 / 9',
    ]);
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

  it('keeps the first deck in the original travel slot and replaces the lower repeat with grading deck 02.02', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const staggeredLayout = container.querySelector('[data-long-form-staggered-layout]');
    const deckFeature = container.querySelector('[data-card-feature="selected-films-02-01"]');
    const gradingFeature = container.querySelector('[data-card-feature="color-grading-02-02"]');

    expect(staggeredLayout).toBeInTheDocument();
    expect(deckFeature).toContainElement(container.querySelector('[data-film-deck="selected-films-02-01"]'));
    expect(gradingFeature).toContainElement(container.querySelector('[data-film-deck="color-grading-02-02"]'));
    expect(gradingFeature).toHaveTextContent('滑板工坊');
    expect(gradingFeature).toHaveTextContent('00:05');
    expect(gradingFeature).toHaveTextContent('调色');
    expect(within(gradingFeature as HTMLElement).getByRole('button', {
      name: '滑板工坊完整视频暂不可用',
    })).toBeDisabled();
    expect(gradingFeature?.querySelector('img')).toHaveAttribute(
      'src',
      '/media/projects/long-form/grading-skate-workshop/poster-card.webp',
    );
    expect(gradingFeature?.querySelector('video')).not.toBeInTheDocument();

    const preservedGradingFeature = gradingFeature;
    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));
    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));

    expect(container.querySelector('[data-card-feature="color-grading-02-02"]'))
      .toBe(preservedGradingFeature);
    expect(preservedGradingFeature).toHaveTextContent('滑板工坊');
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
      duration: 0.68,
    }));
    expect(gsapMock.to).toHaveBeenCalledWith(currentCard, expect.not.objectContaining({
      clearProps: expect.anything(),
    }));
  });

  it('commits the incoming card before the completed tween can expose cleared outgoing styles', () => {
    render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));

    expect(gsapMock.state.completionActiveSlugs).toEqual(['narrative-film']);
  });

  it('keeps the outgoing card hidden through one paint before releasing its tween styles', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const outgoingCard = container.querySelector('[data-film-card="travel-vlog"]');

    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));

    expect(gsapMock.to).toHaveBeenCalledWith(outgoingCard, expect.not.objectContaining({
      clearProps: expect.anything(),
    }));
    expect(gsapMock.set).not.toHaveBeenCalledWith(outgoingCard, {
      clearProps: 'transform,opacity,visibility,willChange',
    });

    act(() => animationFrames.shift()?.(16));
    expect(gsapMock.set).not.toHaveBeenCalledWith(outgoingCard, {
      clearProps: 'transform,opacity,visibility,willChange',
    });

    act(() => animationFrames.shift()?.(32));
    expect(gsapMock.set).toHaveBeenCalledWith(outgoingCard, {
      clearProps: 'transform,opacity,visibility,willChange',
    });
  });

  it('applies the same painted-frame handoff to the independent grading deck', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const gradingDeck = container.querySelector<HTMLElement>(
      '[data-film-deck="color-grading-02-02"]',
    )!;
    const gradingFeature = gradingDeck.closest<HTMLElement>('[data-card-feature]')!;
    const outgoingCard = gradingDeck.querySelector('[data-film-card="grading-skate-workshop"]');

    fireEvent.click(within(gradingFeature).getByRole('button', { name: '下一张调色练习' }));

    expect(activeSlug(container.querySelector('[data-film-deck="selected-films-02-01"]')!))
      .toBe('travel-vlog');
    expect(activeSlug(gradingDeck)).toBe('grading-percussion');
    expect(gsapMock.to).toHaveBeenCalledWith(outgoingCard, expect.not.objectContaining({
      clearProps: expect.anything(),
    }));

    act(() => animationFrames.shift()?.(16));
    expect(gsapMock.set).not.toHaveBeenCalledWith(outgoingCard, {
      clearProps: 'transform,opacity,visibility,willChange',
    });
    act(() => animationFrames.shift()?.(32));
    expect(gsapMock.set).toHaveBeenCalledWith(outgoingCard, {
      clearProps: 'transform,opacity,visibility,willChange',
    });
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

  it('plays only the current preview while progressively retaining warmed previews', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    enterObservedPreviews();
    const firstDeck = container.querySelector<HTMLElement>('[data-film-deck="selected-films-02-01"]')!;
    const secondDeck = container.querySelector<HTMLElement>('[data-film-deck="color-grading-02-02"]')!;

    let videos = firstDeck.querySelectorAll<HTMLVideoElement>('.long-form-projects__card video');
    expect(videos).toHaveLength(2);
    expect(videos[0]).toHaveAttribute('src', '/media/projects/long-form/travel/preview-h264.mp4');
    expect(videos[0]).not.toHaveAttribute('data-preview-preload');
    expect(videos[1]).toHaveAttribute('src', '/media/projects/long-form/narrative/preview-h264.mp4');
    expect(videos[1]).toHaveAttribute('data-preview-preload', 'true');
    const secondDeckVideos = secondDeck.querySelectorAll<HTMLVideoElement>(
      '.long-form-projects__card video',
    );
    expect(secondDeckVideos).toHaveLength(2);
    expect(secondDeckVideos[0]).toHaveAttribute(
      'src',
      '/media/projects/long-form/grading-skate-workshop/preview-h264.mp4',
    );
    expect(secondDeckVideos[1]).toHaveAttribute('data-preview-preload', 'true');

    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));
    videos = firstDeck.querySelectorAll<HTMLVideoElement>('.long-form-projects__card video');
    expect(videos).toHaveLength(3);
    expect(videos[0]).toHaveAttribute('src', '/media/projects/long-form/travel/preview-h264.mp4');
    expect(videos[0]).toHaveAttribute('data-preview-preload', 'true');
    expect(videos[1]).toHaveAttribute('src', '/media/projects/long-form/narrative/preview-h264.mp4');
    expect(videos[1]).not.toHaveAttribute('data-preview-preload');
    expect(videos[2]).toHaveAttribute('src', '/media/projects/long-form/dark-room/preview-h264.mp4');
    expect(videos[2]).toHaveAttribute('data-preview-preload', 'true');
    expect(secondDeck.querySelectorAll('.long-form-projects__card video')).toHaveLength(2);
    expect(pause).toHaveBeenCalled();
    expect(container.querySelector('video[src*="full-hevc"]')).not.toBeInTheDocument();
  });

  it('composites and starts the decoded incoming frame before its tween, then keeps it playing', () => {
    gsapMock.state.autoComplete = false;
    const { container } = render(
      <LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />,
    );
    enterObservedPreviews();
    const firstDeck = container.querySelector<HTMLElement>(
      '[data-film-deck="selected-films-02-01"]',
    )!;
    const secondDeck = container.querySelector<HTMLElement>(
      '[data-film-deck="color-grading-02-02"]',
    )!;
    let firstDeckVideos = [...firstDeck.querySelectorAll<HTMLVideoElement>('video')];
    expect(firstDeckVideos).toHaveLength(2);
    expect(secondDeck.querySelectorAll('video')).toHaveLength(2);
    const incomingVideo = firstDeckVideos.find((video) => (
      video.getAttribute('src')?.includes('/narrative/preview-h264.mp4')
    ));
    expect(incomingVideo).toHaveAttribute('preload', 'auto');
    expect(incomingVideo).toHaveAttribute('data-preview-preload', 'true');
    expect(incomingVideo).toHaveAttribute('data-preview-ready', 'false');

    fireEvent.loadedData(incomingVideo as HTMLVideoElement);
    expect(incomingVideo).toHaveAttribute('data-preview-ready', 'true');
    const playCallsBeforeTransition = play.mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));

    firstDeckVideos = [...firstDeck.querySelectorAll<HTMLVideoElement>('video')];
    expect(firstDeckVideos).toHaveLength(2);
    expect(firstDeckVideos).toContain(incomingVideo);
    expect(play).toHaveBeenCalledTimes(playCallsBeforeTransition + 1);

    const completeTransition = gsapMock.state.completionCallbacks.shift();
    expect(completeTransition).toBeTypeOf('function');
    act(() => completeTransition?.());

    firstDeckVideos = [...firstDeck.querySelectorAll<HTMLVideoElement>('video')];
    expect(firstDeckVideos).toHaveLength(3);
    expect(firstDeckVideos).toContain(incomingVideo);
    expect(incomingVideo).not.toHaveAttribute('data-preview-preload');
    expect(incomingVideo).toHaveAttribute('data-preview-ready', 'true');
    expect(firstDeckVideos[0]).toHaveAttribute('data-preview-preload', 'true');
    expect(firstDeckVideos[2]).toHaveAttribute('src', '/media/projects/long-form/dark-room/preview-h264.mp4');
    expect(firstDeckVideos[2]).toHaveAttribute('data-preview-preload', 'true');
    expect(play).toHaveBeenCalledTimes(playCallsBeforeTransition + 1);
  });

  it('retains every decoded preview node after traversal so reverse navigation stays warm', () => {
    const { container } = render(
      <LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />,
    );
    enterObservedPreviews();
    const deck = container.querySelector<HTMLElement>(
      '[data-film-deck="selected-films-02-01"]',
    )!;
    const feature = deck.closest<HTMLElement>('[data-card-feature]')!;
    const next = within(feature).getByRole('button', { name: '下一张作品' });
    const previous = within(feature).getByRole('button', { name: '上一张作品' });
    const travelVideo = deck.querySelector<HTMLVideoElement>(
      'video[src="/media/projects/long-form/travel/preview-h264.mp4"]',
    )!;
    const narrativeVideo = deck.querySelector<HTMLVideoElement>(
      'video[src="/media/projects/long-form/narrative/preview-h264.mp4"]',
    )!;

    fireEvent.loadedData(travelVideo);
    fireEvent.loadedData(narrativeVideo);
    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next);

    expect(activeSlug(deck)).toBe('film-2025-06-15');
    expect(deck.querySelectorAll('video')).toHaveLength(4);

    fireEvent.click(previous);
    fireEvent.click(previous);
    fireEvent.click(previous);

    expect(activeSlug(deck)).toBe('travel-vlog');
    expect(deck.querySelector<HTMLVideoElement>(
      'video[src="/media/projects/long-form/travel/preview-h264.mp4"]',
    )).toBe(travelVideo);
    expect(deck.querySelector<HTMLVideoElement>(
      'video[src="/media/projects/long-form/narrative/preview-h264.mp4"]',
    )).toBe(narrativeVideo);
    expect(travelVideo).toHaveAttribute('data-preview-ready', 'true');
    expect(narrativeVideo).toHaveAttribute('data-preview-ready', 'true');
  });

  it('keeps warmed preview nodes mounted but paused while the global player is open', () => {
    const onOpenProject = vi.fn();
    const { container, rerender } = render(
      <LongFormProjects playerOpen={false} onOpenProject={onOpenProject} />,
    );
    enterObservedPreviews();
    const deck = container.querySelector<HTMLElement>(
      '[data-film-deck="selected-films-02-01"]',
    )!;
    const activeVideo = deck.querySelector<HTMLVideoElement>(
      'video[src="/media/projects/long-form/travel/preview-h264.mp4"]',
    )!;
    const warmedVideo = deck.querySelector<HTMLVideoElement>(
      'video[src="/media/projects/long-form/narrative/preview-h264.mp4"]',
    )!;
    fireEvent.loadedData(activeVideo);
    fireEvent.loadedData(warmedVideo);
    const playCallsBeforeOpen = play.mock.calls.length;

    rerender(<LongFormProjects playerOpen onOpenProject={onOpenProject} />);

    expect(deck.querySelector('video[src="/media/projects/long-form/travel/preview-h264.mp4"]'))
      .toBe(activeVideo);
    expect(deck.querySelector('video[src="/media/projects/long-form/narrative/preview-h264.mp4"]'))
      .toBe(warmedVideo);
    expect(pause).toHaveBeenCalled();
    expect(play).toHaveBeenCalledTimes(playCallsBeforeOpen);

    rerender(<LongFormProjects playerOpen={false} onOpenProject={onOpenProject} />);

    expect(deck.querySelector('video[src="/media/projects/long-form/travel/preview-h264.mp4"]'))
      .toBe(activeVideo);
    expect(deck.querySelector('video[src="/media/projects/long-form/narrative/preview-h264.mp4"]'))
      .toBe(warmedVideo);
    expect(activeVideo).toHaveAttribute('data-preview-ready', 'true');
    expect(warmedVideo).toHaveAttribute('data-preview-ready', 'true');
  });

  it('pauses one deck preview without stopping or remounting the other deck preview', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    enterObservedPreviews();
    const firstDeck = container.querySelector<HTMLElement>('[data-film-deck="selected-films-02-01"]')!;
    const secondDeck = container.querySelector<HTMLElement>('[data-film-deck="color-grading-02-02"]')!;
    const secondFeature = secondDeck.closest<HTMLElement>('[data-card-feature]')!;
    const firstVideo = firstDeck.querySelector('video');

    fireEvent.click(within(secondFeature).getByRole('button', { name: '暂停预览' }));

    expect(firstDeck.querySelector('video')).toBe(firstVideo);
    expect(secondDeck.querySelector('video')).not.toBeInTheDocument();
    expect(within(secondFeature).getByRole('button', { name: '继续预览' }))
      .toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps each newly warmed preview behind its poster and retains readiness on return', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    enterObservedPreviews();
    const activeVideo = () => container.querySelector<HTMLVideoElement>(
      '.long-form-projects__card[aria-current="true"] video',
    );

    let video = activeVideo();
    expect(video).toHaveAttribute('src', '/media/projects/long-form/travel/preview-h264.mp4');
    expect(video).toHaveAttribute('data-preview-ready', 'false');
    const travelVideo = video;

    fireEvent.loadedData(video as HTMLVideoElement);
    expect(video).toHaveAttribute('data-preview-ready', 'true');

    fireEvent.click(screen.getByRole('button', { name: '下一张作品' }));
    video = activeVideo();
    expect(video).toHaveAttribute('src', '/media/projects/long-form/narrative/preview-h264.mp4');
    expect(video).toHaveAttribute('data-preview-ready', 'false');

    fireEvent.loadedData(video as HTMLVideoElement);
    expect(video).toHaveAttribute('data-preview-ready', 'true');

    fireEvent.click(screen.getByRole('button', { name: '上一张作品' }));
    video = activeVideo();
    expect(video).toHaveAttribute('src', '/media/projects/long-form/travel/preview-h264.mp4');
    expect(video).toBe(travelVideo);
    expect(video).toHaveAttribute('data-preview-ready', 'true');
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
