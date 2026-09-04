import { act, cleanup, createEvent, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waterPurifierProject } from '../../content/showcase';
import { waterPurifierMediaDeck } from '../../content/waterPurifierMedia';
import { createProjectMediaDeckItems, ProjectMediaDeck } from './ProjectMediaDeck';

const gsapMock = vi.hoisted(() => {
  const state = {
    autoComplete: true,
    completionCallbacks: [] as Array<() => void>,
    completionActiveSlugs: [] as Array<string | null>,
  };
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
      return { kill: vi.fn() };
    }),
    set: vi.fn(),
    state,
    to: vi.fn((_target: unknown, vars: { onComplete?: () => void }) => {
      if (vars.onComplete) {
        const complete = () => {
          vars.onComplete?.();
          state.completionActiveSlugs.push(
            document
              .querySelector('[data-project-media-card][aria-current="true"]')
              ?.getAttribute('data-project-media-card') ?? null,
          );
        };
        if (state.autoComplete) complete();
        else state.completionCallbacks.push(complete);
      }
      return { kill: vi.fn() };
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

describe('ProjectMediaDeck', () => {
  const observed = new Map<Element, IntersectionObserverCallback>();
  const animationFrames: FrameRequestCallback[] = [];
  const pause = vi.fn();
  const play = vi.fn(() => Promise.resolve());
  const enterObservedPreviews = () => {
    act(() => {
      for (const [target, callback] of [...observed]) {
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
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the existing project followed by the five supplied media records without mounting full video', () => {
    const { container } = render(
      <ProjectMediaDeck
        baseDescription="既有净水器代表作"
        mediaItems={waterPurifierMediaDeck}
        onOpenProject={vi.fn()}
        playerOpen={false}
        project={waterPurifierProject}
      />,
    );
    const cards = [...container.querySelectorAll<HTMLElement>('[data-project-media-card]')];

    expect(cards.map((card) => card.dataset.projectMediaCard)).toEqual([
      'water-purifier',
      'water-purifier-g7s-multi-temperature',
      'water-purifier-summer-ice-drinks',
      'water-purifier-ice-workshop-demo',
      'water-purifier-modular-ice-system',
      'water-purifier-g7s-cabinet-brew',
    ]);
    expect(cards.map((card) => card.querySelector('img')?.getAttribute('src'))).toEqual([
      '/media/projects/water-purifier/poster.webp',
      '/media/projects/water-purifier/deck/g7s-multi-temperature/poster-card.webp',
      '/media/projects/water-purifier/deck/summer-ice-drinks/poster-card.webp',
      '/media/projects/water-purifier/deck/ice-workshop-demo/poster-card.webp',
      '/media/projects/water-purifier/deck/modular-ice-system/poster-card.webp',
      '/media/projects/water-purifier/deck/g7s-cabinet-brew/poster-card.webp',
    ]);
    expect(screen.getByText('01 / 06')).toBeInTheDocument();
    expect(container.querySelector('video[src*="full-"]')).not.toBeInTheDocument();
    expect(createProjectMediaDeckItems(
      waterPurifierProject,
      '既有净水器代表作',
      waterPurifierMediaDeck,
    ).map((item) => item.project.fullSrc)).toEqual([
      'projects/water-purifier/full-hevc.mp4',
      'projects/water-purifier/deck/g7s-multi-temperature/full-h264.mp4',
      'projects/water-purifier/deck/summer-ice-drinks/full-h264.mp4',
      'projects/water-purifier/deck/ice-workshop-demo/full-h264.mp4',
      'projects/water-purifier/deck/modular-ice-system/full-h264.mp4',
      'projects/water-purifier/deck/g7s-cabinet-brew/full-h264.mp4',
    ]);
  });

  it('marks the deck for the spacious desktop treatment', () => {
    render(
      <ProjectMediaDeck
        baseDescription="既有净水器代表作"
        mediaItems={waterPurifierMediaDeck}
        onOpenProject={vi.fn()}
        playerOpen={false}
        project={waterPurifierProject}
      />,
    );

    const stack = screen.getByRole('group', { name: '净水器媒体卡组' });
    const deck = stack.closest('.project-media-deck');

    expect(deck).toHaveClass('project-media-deck--spacious');
  });

  it('keeps the neutral counter and player project aligned without publishing internal descriptions', () => {
    const onOpenProject = vi.fn();
    const { container } = render(
      <ProjectMediaDeck
        baseDescription="既有净水器代表作"
        mediaItems={waterPurifierMediaDeck}
        onOpenProject={onOpenProject}
        playerOpen={false}
        project={waterPurifierProject}
      />,
    );

    const previous = screen.getByRole('button', { name: '上一张净水器作品' });
    const next = screen.getByRole('button', { name: '下一张净水器作品' });
    expect(previous).toBeDisabled();
    expect(screen.queryByText('既有净水器代表作')).not.toBeInTheDocument();
    const firstCard = container.querySelector('[data-project-media-card="water-purifier"]');
    expect(firstCard?.querySelector('.project-media-deck__card-number')).toHaveTextContent('01');
    expect(firstCard?.querySelector('.project-media-deck__play-label')).toHaveTextContent('播放正片');

    fireEvent.click(next);

    expect(screen.getByText('02 / 06')).toBeInTheDocument();
    expect(screen.queryByText(
      '触控操作后连续展示出水、饮用与泡茶，产品主体清晰，首尾均处于稳定镜头。',
    )).not.toBeInTheDocument();
    expect(createProjectMediaDeckItems(
      waterPurifierProject,
      '既有净水器代表作',
      waterPurifierMediaDeck,
    )[1].description).toBe(
      '触控操作后连续展示出水、饮用与泡茶，产品主体清晰，首尾均处于稳定镜头。',
    );
    const playButton = screen.getByRole('button', { name: '播放净水器短片 02' });
    fireEvent.click(playButton);
    expect(onOpenProject).toHaveBeenCalledWith(
      expect.objectContaining({
        fallbackSrc: undefined,
        fullSrc: 'projects/water-purifier/deck/g7s-multi-temperature/full-h264.mp4',
        slug: 'water-purifier-g7s-multi-temperature',
      }),
      playButton,
    );
  });

  it('supports direction and page keys while keeping only the current card interactive', () => {
    const { container } = render(
      <ProjectMediaDeck
        baseDescription="既有净水器代表作"
        mediaItems={waterPurifierMediaDeck}
        onOpenProject={vi.fn()}
        playerOpen={false}
        project={waterPurifierProject}
      />,
    );
    const deck = screen.getByRole('group', { name: '净水器媒体卡组' });
    const activeSlug = () => container
      .querySelector('[data-project-media-card][aria-current="true"]')
      ?.getAttribute('data-project-media-card');

    fireEvent.keyDown(deck, { key: 'ArrowDown' });
    expect(activeSlug()).toBe('water-purifier-g7s-multi-temperature');
    fireEvent.keyDown(deck, { key: 'PageDown' });
    expect(activeSlug()).toBe('water-purifier-summer-ice-drinks');
    fireEvent.keyDown(deck, { key: 'ArrowUp' });
    expect(activeSlug()).toBe('water-purifier-g7s-multi-temperature');
    fireEvent.keyDown(deck, { key: 'PageUp' });
    expect(activeSlug()).toBe('water-purifier');

    const enabledPlayButtons = [...container.querySelectorAll<HTMLButtonElement>(
      '[data-project-media-card] > button:not(:disabled)',
    )];
    expect(enabledPlayButtons).toHaveLength(1);
    expect(enabledPlayButtons[0]).toHaveAccessibleName('播放净水器短片 01');
  });

  it('captures one wheel step inside the deck while releasing page scroll at both boundaries', () => {
    vi.useFakeTimers();
    const { container } = render(
      <ProjectMediaDeck
        baseDescription="既有净水器代表作"
        mediaItems={waterPurifierMediaDeck}
        onOpenProject={vi.fn()}
        playerOpen={false}
        project={waterPurifierProject}
      />,
    );
    const deck = screen.getByRole('group', { name: '净水器媒体卡组' });
    const activeSlug = () => container
      .querySelector('[data-project-media-card][aria-current="true"]')
      ?.getAttribute('data-project-media-card');

    const firstUp = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -120 });
    act(() => deck.dispatchEvent(firstUp));
    expect(firstUp.defaultPrevented).toBe(false);

    const firstDown = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 });
    act(() => deck.dispatchEvent(firstDown));
    expect(firstDown.defaultPrevented).toBe(true);
    expect(activeSlug()).toBe('water-purifier-g7s-multi-temperature');

    const sameGesture = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 });
    act(() => deck.dispatchEvent(sameGesture));
    expect(sameGesture.defaultPrevented).toBe(true);
    expect(activeSlug()).toBe('water-purifier-g7s-multi-temperature');

    for (let index = 0; index < 4; index += 1) {
      act(() => vi.advanceTimersByTime(600));
      act(() => deck.dispatchEvent(new WheelEvent(
        'wheel',
        { bubbles: true, cancelable: true, deltaY: 120 },
      )));
    }
    expect(activeSlug()).toBe('water-purifier-g7s-cabinet-brew');

    act(() => vi.advanceTimersByTime(600));
    const lastDown = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 });
    act(() => deck.dispatchEvent(lastDown));
    expect(lastDown.defaultPrevented).toBe(false);
  });

  it('captures one mobile swipe while releasing the page gesture at the first and last card', () => {
    const { container } = render(
      <ProjectMediaDeck
        baseDescription="既有净水器代表作"
        mediaItems={waterPurifierMediaDeck}
        onOpenProject={vi.fn()}
        playerOpen={false}
        project={waterPurifierProject}
      />,
    );
    const deck = screen.getByRole('group', { name: '净水器媒体卡组' });
    const activeSlug = () => container
      .querySelector('[data-project-media-card][aria-current="true"]')
      ?.getAttribute('data-project-media-card');

    fireEvent.touchStart(deck, { touches: [{ clientY: 500 }] });
    const firstSwipe = createEvent.touchMove(deck, {
      bubbles: true,
      cancelable: true,
      touches: [{ clientY: 390 }],
    });
    fireEvent(deck, firstSwipe);
    expect(firstSwipe.defaultPrevented).toBe(true);
    expect(activeSlug()).toBe('water-purifier-g7s-multi-temperature');

    const sameSwipe = createEvent.touchMove(deck, {
      bubbles: true,
      cancelable: true,
      touches: [{ clientY: 300 }],
    });
    fireEvent(deck, sameSwipe);
    expect(sameSwipe.defaultPrevented).toBe(true);
    expect(activeSlug()).toBe('water-purifier-g7s-multi-temperature');
    fireEvent.touchEnd(deck);

    fireEvent.keyDown(deck, { key: 'PageUp' });
    fireEvent.touchStart(deck, { touches: [{ clientY: 390 }] });
    const firstBoundary = createEvent.touchMove(deck, {
      bubbles: true,
      cancelable: true,
      touches: [{ clientY: 500 }],
    });
    fireEvent(deck, firstBoundary);
    expect(firstBoundary.defaultPrevented).toBe(false);

    for (let index = 0; index < 5; index += 1) fireEvent.keyDown(deck, { key: 'PageDown' });
    fireEvent.touchStart(deck, { touches: [{ clientY: 500 }] });
    const lastBoundary = createEvent.touchMove(deck, {
      bubbles: true,
      cancelable: true,
      touches: [{ clientY: 390 }],
    });
    fireEvent(deck, lastBoundary);
    expect(lastBoundary.defaultPrevented).toBe(false);
    expect(activeSlug()).toBe('water-purifier-g7s-cabinet-brew');
  });

  it('plays only the current preview, preheats its neighbor behind the poster and retains warmed nodes', () => {
    const { container } = render(
      <ProjectMediaDeck
        baseDescription="既有净水器代表作"
        mediaItems={waterPurifierMediaDeck}
        onOpenProject={vi.fn()}
        playerOpen={false}
        project={waterPurifierProject}
      />,
    );
    enterObservedPreviews();

    let videos = [...container.querySelectorAll<HTMLVideoElement>('video')];
    expect(videos).toHaveLength(2);
    expect(videos[0]).toHaveAttribute('src', '/media/projects/water-purifier/preview.mp4');
    expect(videos[0]).not.toHaveAttribute('data-preview-preload');
    expect(videos[1]).toHaveAttribute(
      'src',
      '/media/projects/water-purifier/deck/g7s-multi-temperature/preview-h264.mp4',
    );
    expect(videos[1]).toHaveAttribute('data-preview-preload', 'true');
    expect(videos[1]).toHaveAttribute('data-preview-ready', 'false');
    const firstVideo = videos[0];
    const secondVideo = videos[1];

    fireEvent.loadedData(firstVideo);
    fireEvent.loadedData(secondVideo);
    fireEvent.click(screen.getByRole('button', { name: '下一张净水器作品' }));

    videos = [...container.querySelectorAll<HTMLVideoElement>('video')];
    expect(videos).toHaveLength(3);
    expect(videos).toContain(firstVideo);
    expect(videos).toContain(secondVideo);
    expect(firstVideo).toHaveAttribute('data-preview-preload', 'true');
    expect(secondVideo).not.toHaveAttribute('data-preview-preload');
    expect(secondVideo).toHaveAttribute('data-preview-ready', 'true');
    expect(videos[2]).toHaveAttribute('data-preview-preload', 'true');
    expect(container.querySelector('video[src*="full-"]')).not.toBeInTheDocument();
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('keeps warmed preview nodes mounted but pauses every preview while the full player is open', () => {
    const props = {
      baseDescription: '既有净水器代表作',
      mediaItems: waterPurifierMediaDeck,
      onOpenProject: vi.fn(),
      project: waterPurifierProject,
    };
    const { container, rerender } = render(
      <ProjectMediaDeck {...props} playerOpen={false} />,
    );
    enterObservedPreviews();
    const warmedVideos = [...container.querySelectorAll<HTMLVideoElement>('video')];
    const playCallsBeforePlayer = play.mock.calls.length;
    pause.mockClear();

    rerender(<ProjectMediaDeck {...props} playerOpen />);

    const retainedVideos = [...container.querySelectorAll<HTMLVideoElement>('video')];
    expect(retainedVideos).toEqual(warmedVideos);
    expect(play).toHaveBeenCalledTimes(playCallsBeforePlayer);
    expect(pause).toHaveBeenCalledTimes(2);
  });

  it('commits the decoded incoming card before releasing the outgoing card after a painted frame', () => {
    gsapMock.state.autoComplete = false;
    const { container } = render(
      <ProjectMediaDeck
        baseDescription="既有净水器代表作"
        mediaItems={waterPurifierMediaDeck}
        onOpenProject={vi.fn()}
        playerOpen={false}
        project={waterPurifierProject}
      />,
    );
    enterObservedPreviews();
    const firstCard = container.querySelector('[data-project-media-card="water-purifier"]');
    const secondCard = container.querySelector(
      '[data-project-media-card="water-purifier-g7s-multi-temperature"]',
    );
    const incomingVideo = secondCard?.querySelector('video') as HTMLVideoElement;
    fireEvent.loadedData(incomingVideo);
    const playCallsBeforeTransition = play.mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: '下一张净水器作品' }));

    expect(firstCard).toHaveAttribute('aria-current', 'true');
    expect(incomingVideo).toHaveAttribute('data-preview-ready', 'true');
    expect(play).toHaveBeenCalledTimes(playCallsBeforeTransition + 1);
    expect(gsapMock.set).toHaveBeenCalledWith([firstCard, secondCard], {
      willChange: 'transform, opacity',
    });
    expect(gsapMock.to).toHaveBeenCalledWith(firstCard, expect.not.objectContaining({
      clearProps: expect.anything(),
    }));

    const completeTransition = gsapMock.state.completionCallbacks.shift();
    expect(completeTransition).toBeTypeOf('function');
    act(() => completeTransition?.());
    expect(secondCard).toHaveAttribute('aria-current', 'true');
    expect(gsapMock.state.completionActiveSlugs).toEqual([
      'water-purifier-g7s-multi-temperature',
    ]);
    expect(gsapMock.set).not.toHaveBeenCalledWith(firstCard, {
      clearProps: 'transform,opacity,visibility,willChange',
    });

    act(() => animationFrames.shift()?.(16));
    expect(gsapMock.set).not.toHaveBeenCalledWith(firstCard, {
      clearProps: 'transform,opacity,visibility,willChange',
    });
    act(() => animationFrames.shift()?.(32));
    expect(gsapMock.set).toHaveBeenCalledWith(firstCard, {
      clearProps: 'transform,opacity,visibility,willChange',
    });
  });

  it('uses static covers and switches directly when reduced motion is requested', () => {
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
    const { container } = render(
      <ProjectMediaDeck
        baseDescription="既有净水器代表作"
        mediaItems={waterPurifierMediaDeck}
        onOpenProject={vi.fn()}
        playerOpen={false}
        project={waterPurifierProject}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '下一张净水器作品' }));
    enterObservedPreviews();

    expect(container.querySelector(
      '[data-project-media-card="water-purifier-g7s-multi-temperature"]',
    )).toHaveAttribute('aria-current', 'true');
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(gsapMock.context).not.toHaveBeenCalled();
  });

  it('keeps every decoded node ready through the full 01 to 06 to 01 traversal', () => {
    const { container } = render(
      <ProjectMediaDeck
        baseDescription="既有净水器代表作"
        mediaItems={waterPurifierMediaDeck}
        onOpenProject={vi.fn()}
        playerOpen={false}
        project={waterPurifierProject}
      />,
    );
    enterObservedPreviews();
    const deck = screen.getByRole('group', { name: '净水器媒体卡组' });
    const next = screen.getByRole('button', { name: '下一张净水器作品' });
    const previous = screen.getByRole('button', { name: '上一张净水器作品' });
    const firstVideo = deck.querySelector<HTMLVideoElement>(
      'video[src="/media/projects/water-purifier/preview.mp4"]',
    )!;
    const secondVideo = deck.querySelector<HTMLVideoElement>(
      'video[src*="/g7s-multi-temperature/preview-h264.mp4"]',
    )!;
    fireEvent.loadedData(firstVideo);
    fireEvent.loadedData(secondVideo);

    for (let index = 1; index < 6; index += 1) {
      fireEvent.click(next);
      const currentVideo = deck.querySelector<HTMLVideoElement>(
        '[data-project-media-card][aria-current="true"] video',
      );
      expect(currentVideo).toBeInTheDocument();
      fireEvent.loadedData(currentVideo as HTMLVideoElement);
    }
    expect(screen.getByText('06 / 06')).toBeInTheDocument();
    expect(deck.querySelectorAll('video')).toHaveLength(6);

    for (let index = 5; index > 0; index -= 1) fireEvent.click(previous);

    expect(screen.getByText('01 / 06')).toBeInTheDocument();
    expect(deck.querySelectorAll('video')).toHaveLength(6);
    expect(deck.querySelector('video[src="/media/projects/water-purifier/preview.mp4"]'))
      .toBe(firstVideo);
    expect(deck.querySelector('video[src*="/g7s-multi-temperature/preview-h264.mp4"]'))
      .toBe(secondVideo);
    for (const video of deck.querySelectorAll('video')) {
      expect(video).toHaveAttribute('data-preview-ready', 'true');
    }
    expect(container.querySelector('video[src*="full-"]')).not.toBeInTheDocument();
  });

  it('caps the visual stack at three depth layers without changing source order', () => {
    const { container } = render(
      <ProjectMediaDeck
        baseDescription="既有净水器代表作"
        mediaItems={waterPurifierMediaDeck}
        onOpenProject={vi.fn()}
        playerOpen={false}
        project={waterPurifierProject}
      />,
    );
    const cards = [...container.querySelectorAll<HTMLElement>('[data-project-media-card]')];

    expect(cards.map((card) => card.style.getPropertyValue('--card-depth'))).toEqual([
      '0', '1', '2', '3', '3', '3',
    ]);
    expect(cards.map((card) => card.dataset.cardState)).toEqual([
      'active', 'future', 'future', 'future', 'future', 'future',
    ]);
  });
});
