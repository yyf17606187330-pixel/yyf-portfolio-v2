import { useRef } from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mapScrollProgressToTime, useScrollVideo } from './useScrollVideo';

const gsapMock = vi.hoisted(() => {
  const revert = vi.fn();
  const context = vi.fn((callback: () => void) => {
    callback();
    return { revert };
  });

  return {
    context,
    registerPlugin: vi.fn(),
    revert,
  };
});

const scrollTriggerMock = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock('gsap', () => ({
  default: {
    context: gsapMock.context,
    registerPlugin: gsapMock.registerPlugin,
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: scrollTriggerMock.create,
  },
}));

const DESKTOP_MEDIA_QUERY = '(min-width: 768px) and (pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

interface MockScrollTriggerConfig {
  end: () => string;
  invalidateOnRefresh: boolean;
  onUpdate: (trigger: { progress: number }) => void;
  pin: Element;
  scrub: boolean;
  start: string;
  toggleActions?: string;
  trigger: Element;
}

function setMediaPreferences({ desktop = true, reducedMotion = false } = {}) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === DESKTOP_MEDIA_QUERY
      ? desktop
      : query === REDUCED_MOTION_QUERY && reducedMotion,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function ScrollVideoHarness({
  enabled = true,
  onProgress,
}: {
  enabled?: boolean;
  onProgress?: (progress: number | null) => void;
}) {
  const triggerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { motionEnabled, videoProps } = useScrollVideo({
    enabled,
    onProgress,
    poster: '/media/hero/hero-poster.webp',
    source: '/media/hero/hero-scroll.mp4',
    triggerRef,
    videoRef,
  });

  return (
    <section data-scroll-motion={motionEnabled ? 'enabled' : 'static'} ref={triggerRef}>
      <video data-testid="scroll-video" ref={videoRef} {...videoProps} />
    </section>
  );
}

describe('mapScrollProgressToTime', () => {
  it('maps scroll progress to the matching point in the video duration', () => {
    expect(mapScrollProgressToTime(0.5, 6)).toBe(3);
  });

  it('clamps progress to the playable range', () => {
    expect(mapScrollProgressToTime(-0.25, 6)).toBe(0);
    expect(mapScrollProgressToTime(1.25, 6)).toBe(6);
  });

  it('returns the poster frame time for an unavailable duration', () => {
    expect(mapScrollProgressToTime(0.5, Number.NaN)).toBe(0);
    expect(mapScrollProgressToTime(0.5, 0)).toBe(0);
    expect(mapScrollProgressToTime(0.5, -6)).toBe(0);
  });
});

describe('useScrollVideo', () => {
  const frameCallbacks = new Map<number, FrameRequestCallback>();
  let nextFrameId = 1;

  beforeEach(() => {
    gsapMock.context.mockClear();
    gsapMock.revert.mockClear();
    scrollTriggerMock.create.mockClear();
    setMediaPreferences();
    frameCallbacks.clear();
    nextFrameId = 1;
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      const frameId = nextFrameId;
      nextFrameId += 1;
      frameCallbacks.set(frameId, callback);
      return frameId;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn((frameId: number) => {
      frameCallbacks.delete(frameId);
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function flushAnimationFrame() {
    act(() => {
      const callbacks = [...frameCallbacks.values()];
      frameCallbacks.clear();
      callbacks.forEach((callback) => callback(16));
    });
  }

  it('renders the poster first, then attaches a silent desktop video after the first frame', () => {
    const { getByTestId } = render(<ScrollVideoHarness />);
    const video = getByTestId('scroll-video') as HTMLVideoElement;

    expect(video).toHaveAttribute('poster', '/media/hero/hero-poster.webp');
    expect(video).not.toHaveAttribute('src');
    expect(video).toHaveAttribute('preload', 'none');
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video.autoplay).toBe(false);
    expect(video.parentElement).toHaveAttribute('data-scroll-motion', 'enabled');

    flushAnimationFrame();

    expect(video).toHaveAttribute('src', '/media/hero/hero-scroll.mp4');
    expect(video).toHaveAttribute('preload', 'auto');
  });

  it.each([
    ['a mobile or coarse-pointer viewport', { desktop: false, reducedMotion: false }],
    ['reduced motion', { desktop: true, reducedMotion: true }],
  ])('keeps a static poster for %s', (_label, preferences) => {
    setMediaPreferences(preferences);
    const { getByTestId } = render(<ScrollVideoHarness />);
    const video = getByTestId('scroll-video');

    flushAnimationFrame();

    expect(video).toHaveAttribute('poster', '/media/hero/hero-poster.webp');
    expect(video).not.toHaveAttribute('src');
    expect(video).toHaveAttribute('preload', 'none');
    expect(video.parentElement).toHaveAttribute('data-scroll-motion', 'static');
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('removes a failed video source while retaining the poster fallback', () => {
    const { getByTestId } = render(<ScrollVideoHarness />);
    const video = getByTestId('scroll-video') as HTMLVideoElement;
    flushAnimationFrame();
    Object.defineProperty(video, 'duration', { configurable: true, value: 6 });
    fireEvent.loadedMetadata(video);

    fireEvent.error(video);

    expect(video).toHaveAttribute('poster', '/media/hero/hero-poster.webp');
    expect(video).not.toHaveAttribute('src');
    expect(video).toHaveAttribute('preload', 'none');
    expect(video.parentElement).toHaveAttribute('data-scroll-motion', 'static');
    expect(gsapMock.revert).toHaveBeenCalledOnce();
  });

  it('pins and scrubs the ready video in both scroll directions without toggle actions', () => {
    const { getByTestId } = render(<ScrollVideoHarness />);
    const video = getByTestId('scroll-video') as HTMLVideoElement;
    const trigger = video.parentElement as HTMLElement;
    flushAnimationFrame();
    Object.defineProperty(video, 'duration', { configurable: true, value: 6 });

    fireEvent.loadedMetadata(video);

    expect(scrollTriggerMock.create).toHaveBeenCalledOnce();
    const config = scrollTriggerMock.create.mock.calls[0]?.[0] as MockScrollTriggerConfig;
    expect(config.trigger).toBe(trigger);
    expect(config.pin).toBe(trigger);
    expect(config.start).toBe('top top');
    expect(config.end()).toBe('+=1600');
    expect(config.scrub).toBe(true);
    expect(config.invalidateOnRefresh).toBe(true);
    expect(config).not.toHaveProperty('toggleActions');

    act(() => config.onUpdate({ progress: 0.75 }));
    flushAnimationFrame();
    expect(video.currentTime).toBe(4.5);

    act(() => config.onUpdate({ progress: 0.25 }));
    flushAnimationFrame();
    expect(video.currentTime).toBe(1.5);
  });

  it('coalesces rapid scroll updates into one seek per animation frame', () => {
    const { getByTestId } = render(<ScrollVideoHarness />);
    const video = getByTestId('scroll-video') as HTMLVideoElement;
    flushAnimationFrame();
    Object.defineProperty(video, 'duration', { configurable: true, value: 6 });
    fireEvent.loadedMetadata(video);
    const config = scrollTriggerMock.create.mock.calls[0]?.[0] as MockScrollTriggerConfig;
    const requestCountBeforeScroll = vi.mocked(window.requestAnimationFrame).mock.calls.length;

    act(() => {
      config.onUpdate({ progress: 0.25 });
      config.onUpdate({ progress: 0.75 });
      config.onUpdate({ progress: 0.5 });
    });

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(requestCountBeforeScroll + 1);
    flushAnimationFrame();
    expect(video.currentTime).toBe(3);
  });

  it('publishes the latest scroll progress in the same frame as the video seek', () => {
    const onProgress = vi.fn();
    const { getByTestId } = render(<ScrollVideoHarness onProgress={onProgress} />);
    const video = getByTestId('scroll-video') as HTMLVideoElement;
    flushAnimationFrame();
    Object.defineProperty(video, 'duration', { configurable: true, value: 6 });
    fireEvent.loadedMetadata(video);
    const config = scrollTriggerMock.create.mock.calls[0]?.[0] as MockScrollTriggerConfig;
    onProgress.mockClear();

    act(() => {
      config.onUpdate({ progress: 0.25 });
      config.onUpdate({ progress: 0.75 });
      config.onUpdate({ progress: 0.5 });
    });

    expect(video.currentTime).toBe(0);
    expect(onProgress).not.toHaveBeenCalled();

    flushAnimationFrame();

    expect(video.currentTime).toBe(3);
    expect(onProgress).toHaveBeenCalledOnce();
    expect(onProgress).toHaveBeenCalledWith(0.5);
  });

  it('resets the shared scroll progress when scrubbing is disabled', () => {
    const onProgress = vi.fn();
    const { getByTestId, rerender } = render(
      <ScrollVideoHarness onProgress={onProgress} />,
    );
    const video = getByTestId('scroll-video') as HTMLVideoElement;
    flushAnimationFrame();
    Object.defineProperty(video, 'duration', { configurable: true, value: 6 });
    fireEvent.loadedMetadata(video);
    const config = scrollTriggerMock.create.mock.calls[0]?.[0] as MockScrollTriggerConfig;
    act(() => config.onUpdate({ progress: 0.75 }));
    flushAnimationFrame();
    onProgress.mockClear();

    rerender(<ScrollVideoHarness enabled={false} onProgress={onProgress} />);

    expect(video).not.toHaveAttribute('src');
    expect(onProgress).toHaveBeenCalledWith(null);
  });

  it('cancels a pending seek and reverts the GSAP context when unmounted', () => {
    const { getByTestId, unmount } = render(<ScrollVideoHarness />);
    const video = getByTestId('scroll-video') as HTMLVideoElement;
    flushAnimationFrame();
    Object.defineProperty(video, 'duration', { configurable: true, value: 6 });
    fireEvent.loadedMetadata(video);
    const config = scrollTriggerMock.create.mock.calls[0]?.[0] as MockScrollTriggerConfig;

    act(() => config.onUpdate({ progress: 0.5 }));
    const pendingSeekFrame = vi.mocked(window.requestAnimationFrame).mock.results.at(-1)?.value;
    unmount();
    flushAnimationFrame();

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(pendingSeekFrame);
    expect(gsapMock.revert).toHaveBeenCalledOnce();
    expect(video.currentTime).toBe(0);
  });

  it('requires fresh metadata after disabling and re-enabling the same source', () => {
    const { getByTestId, rerender } = render(<ScrollVideoHarness />);
    const video = getByTestId('scroll-video') as HTMLVideoElement;
    flushAnimationFrame();
    Object.defineProperty(video, 'duration', { configurable: true, value: 6 });
    fireEvent.loadedMetadata(video);
    const firstConfig = scrollTriggerMock.create.mock.calls[0]?.[0] as MockScrollTriggerConfig;
    act(() => firstConfig.onUpdate({ progress: 0.5 }));
    const pendingSeekFrame = vi.mocked(window.requestAnimationFrame).mock.results.at(-1)?.value;

    rerender(<ScrollVideoHarness enabled={false} />);

    expect(video).not.toHaveAttribute('src');
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(pendingSeekFrame);
    expect(gsapMock.revert).toHaveBeenCalledOnce();

    rerender(<ScrollVideoHarness />);
    flushAnimationFrame();

    expect(video).toHaveAttribute('src', '/media/hero/hero-scroll.mp4');
    expect(scrollTriggerMock.create).toHaveBeenCalledOnce();

    fireEvent.loadedMetadata(video);
    expect(scrollTriggerMock.create).toHaveBeenCalledTimes(2);
  });
});
