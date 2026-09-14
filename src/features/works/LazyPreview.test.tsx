import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '../../types/portfolio';
import { LazyPreview } from './LazyPreview';

const project: Project = {
  slug: 'portrait', title: '竖屏作品', category: 'film', year: '', client: '',
  roles: ['剪辑'], featured: true, order: 1, aspectRatio: '9/16',
  poster: 'poster.webp', previewSrc: 'preview.mp4', fullSrc: 'full-hevc.mp4',
};

describe('LazyPreview playback lifecycle', () => {
  let intersect: IntersectionObserverCallback | undefined;
  const pause = vi.fn();
  const play = vi.fn(() => Promise.resolve());

  function setVisibility(visible: boolean) {
    act(() => intersect?.(
      [{ isIntersecting: visible } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ));
  }

  beforeEach(() => {
    intersect = undefined;
    play.mockClear();
    pause.mockClear();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      intersect = callback;
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(), takeRecords: vi.fn(), root: null, rootMargin: '', thresholds: [] };
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(document, 'visibilityState');
  });

  it('keeps the poster and original ratio, then loads only the silent preview on entering the viewport', () => {
    const { container } = render(<LazyPreview project={project} />);
    expect(container.firstElementChild).toHaveStyle({ aspectRatio: '9/16' });
    expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy');
    expect(container.querySelector('video')).not.toBeInTheDocument();

    setVisibility(true);
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toHaveAttribute('src', '/media/preview.mp4');
    expect(video).toHaveAttribute('loop');
    expect(video.muted).toBe(true);
    expect(play).toHaveBeenCalledOnce();
    expect(container.querySelector('[src*="full-hevc"]')).not.toBeInTheDocument();
  });

  it('pauses offscreen and does not resume while the page is hidden or the full player is open', () => {
    const { rerender } = render(<LazyPreview project={project} />);
    setVisibility(true);
    pause.mockClear();
    setVisibility(false);
    expect(pause).toHaveBeenCalled();

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    fireEvent(document, new Event('visibilitychange'));
    play.mockClear();
    setVisibility(true);
    expect(play).not.toHaveBeenCalled();

    rerender(<LazyPreview project={project} enabled={false} />);
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    fireEvent(document, new Event('visibilitychange'));
    expect(play).not.toHaveBeenCalled();

    rerender(<LazyPreview project={project} enabled />);
    expect(play).toHaveBeenCalledOnce();
  });

  it('leaves a static poster for reduced motion without attaching a video', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)', media: query,
      onchange: null, addEventListener: vi.fn(), removeEventListener: vi.fn(),
      addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
    }));
    const { container } = render(<LazyPreview project={project} />);
    setVisibility(true);
    expect(container.querySelector('img')).toHaveAttribute('src', '/media/poster.webp');
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(play).not.toHaveBeenCalled();
  });

  it('falls back to the poster after a preview decoding error', () => {
    const { container } = render(<LazyPreview project={project} />);
    setVisibility(true);
    fireEvent.error(container.querySelector('video') as HTMLVideoElement);
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('keeps an entered preview poster-only until the card becomes active', () => {
    const { container, rerender } = render(<LazyPreview enabled={false} project={project} />);
    setVisibility(true);

    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(play).not.toHaveBeenCalled();

    rerender(<LazyPreview enabled project={project} />);
    expect(container.querySelector('video')).toHaveAttribute('src', '/media/preview.mp4');
    expect(play).toHaveBeenCalledOnce();
  });
});
