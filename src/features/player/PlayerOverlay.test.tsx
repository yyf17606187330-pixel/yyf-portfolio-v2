import { useRef, useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '../../types/portfolio';
import { PlayerOverlay } from './PlayerOverlay';

const gsapMock = vi.hoisted(() => {
  const timeline = vi.fn(() => {
    const api = { fromTo: vi.fn() };
    api.fromTo.mockReturnValue(api);
    return api;
  });
  const context = vi.fn((callback: () => void) => {
    callback();
    return { revert: vi.fn() };
  });

  return { context, timeline };
});

vi.mock('gsap', () => ({
  default: {
    context: gsapMock.context,
    timeline: gsapMock.timeline,
  },
}));

function setReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

const playableProject: Project = {
  slug: 'film-a',
  title: '影像项目 A',
  category: 'film',
  year: '2026',
  client: '客户 A',
  roles: ['导演'],
  featured: true,
  order: 1,
  poster: 'posters/film-a.webp',
  previewSrc: 'previews/film-a.mp4',
  fullSrc: 'videos/film-a.mp4',
  aspectRatio: '16/9',
};

const secondPlayableProject: Project = {
  ...playableProject,
  slug: 'ai-b',
  title: 'AI 项目 B',
  category: 'ai-video',
  order: 2,
  poster: 'posters/ai-b.webp',
  previewSrc: 'previews/ai-b.mp4',
  fullSrc: 'videos/ai-b.mp4',
};

function deferredPromise() {
  let resolve!: () => void;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function PlayerHarness({ project, onClose }: { project: Project; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={openerRef} type="button" onClick={() => setOpen(true)}>
        打开作品
      </button>
      <PlayerOverlay
        project={open ? project : null}
        opener={openerRef.current}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      />
    </>
  );
}

describe('PlayerOverlay', () => {
  const play = vi.fn(() => Promise.resolve());
  const pause = vi.fn();
  const requestFullscreen = vi.fn(() => Promise.resolve());
  let scrollTo: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    gsapMock.context.mockClear();
    gsapMock.timeline.mockClear();
    play.mockClear();
    pause.mockClear();
    requestFullscreen.mockClear();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    Object.defineProperty(HTMLVideoElement.prototype, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('attempts audible playback on open and exposes playback, mute, progress and fullscreen controls', async () => {
    render(<PlayerOverlay project={playableProject} opener={null} onClose={vi.fn()} />);
    const video = document.body.querySelector('video') as HTMLVideoElement;

    expect(video).toHaveAttribute('src', '/media/videos/film-a.mp4');
    expect(screen.getByRole('dialog', { name: '播放作品：影像项目 A' })).toHaveAttribute('data-lenis-prevent');
    await waitFor(() => expect(play).toHaveBeenCalledOnce());
    expect(video.muted).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: '暂停' }));
    expect(pause).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: '播放' }));
    expect(play).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button', { name: '静音' }));
    expect(video.muted).toBe(true);
    expect(screen.getByRole('button', { name: '取消静音' })).toBeInTheDocument();

    Object.defineProperty(video, 'duration', { configurable: true, value: 100 });
    fireEvent.loadedMetadata(video);
    fireEvent.change(screen.getByRole('slider', { name: '播放进度' }), { target: { value: '42' } });
    expect(video.currentTime).toBe(42);

    fireEvent.click(screen.getByRole('button', { name: '全屏' }));
    expect(requestFullscreen).toHaveBeenCalledOnce();
  });

  it('starts in a pending non-playing state and ignores a stale play promise after A closes and B opens', async () => {
    const firstPlay = deferredPromise();
    const secondPlay = deferredPromise();
    play
      .mockImplementationOnce(() => firstPlay.promise)
      .mockImplementationOnce(() => secondPlay.promise);

    const { rerender } = render(<PlayerOverlay project={playableProject} opener={null} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: '播放' })).toBeInTheDocument();
    await waitFor(() => expect(play).toHaveBeenCalledOnce());

    rerender(<PlayerOverlay project={null} opener={null} onClose={vi.fn()} />);
    rerender(<PlayerOverlay project={secondPlayableProject} opener={null} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: '播放' })).toBeInTheDocument();
    await waitFor(() => expect(play).toHaveBeenCalledTimes(2));

    firstPlay.resolve();
    await Promise.resolve();
    expect(screen.getByRole('button', { name: '播放' })).toBeInTheDocument();

    secondPlay.resolve();
    await waitFor(() => expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument());
  });

  it('replaces the video element between projects so stale media events cannot update the next project', async () => {
    const firstPlay = deferredPromise();
    const secondPlay = deferredPromise();
    play
      .mockImplementationOnce(() => firstPlay.promise)
      .mockImplementationOnce(() => secondPlay.promise);

    const { rerender } = render(
      <PlayerOverlay project={playableProject} opener={null} onClose={vi.fn()} />,
    );
    const firstVideo = document.body.querySelector('video') as HTMLVideoElement;
    await waitFor(() => expect(play).toHaveBeenCalledOnce());

    rerender(<PlayerOverlay project={secondPlayableProject} opener={null} onClose={vi.fn()} />);
    const secondVideo = document.body.querySelector('video') as HTMLVideoElement;
    await waitFor(() => expect(play).toHaveBeenCalledTimes(2));

    expect(secondVideo).not.toBe(firstVideo);
    fireEvent.play(firstVideo);
    fireEvent.timeUpdate(firstVideo, { target: { currentTime: 37 } });
    expect(screen.getByRole('button', { name: '播放' })).toBeInTheDocument();
    expect(screen.getAllByText('00:00')).toHaveLength(2);

    secondPlay.resolve();
    await waitFor(() => expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument());
  });

  it('uses the same bilingual category label as project cards instead of an internal slug', () => {
    render(<PlayerOverlay project={playableProject} opener={null} onClose={vi.fn()} />);

    expect(screen.getByText('01 / FILM / 影像')).toBeInTheDocument();
    expect(screen.queryByText('01 / film')).not.toBeInTheDocument();
  });

  it('renders a designed fallback and no empty video source when full media is missing', () => {
    render(
      <PlayerOverlay project={{ ...playableProject, fullSrc: '' }} opener={null} onClose={vi.fn()} />,
    );

    expect(screen.getByText('作品视频待替换')).toBeInTheDocument();
    expect(document.body.querySelector('video')).not.toBeInTheDocument();
    expect(document.body.querySelector('source')).not.toBeInTheDocument();
    expect(document.body.querySelector('[src=""]')).not.toBeInTheDocument();
  });

  it('closes on Escape, restores the originating project focus and restores the captured scroll position', async () => {
    const onClose = vi.fn();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 375 });
    render(<PlayerHarness project={playableProject} onClose={onClose} />);
    const opener = screen.getByRole('button', { name: '打开作品' });

    fireEvent.click(opener);
    await screen.findByRole('dialog', { name: '播放作品：影像项目 A' });
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
    expect(scrollTo).toHaveBeenCalledWith({ top: 375, left: 0, behavior: 'auto' });
  });

  it('skips its GSAP timeline for reduced motion while keeping player controls operable', async () => {
    setReducedMotion(true);

    render(<PlayerOverlay project={playableProject} opener={null} onClose={vi.fn()} />);

    expect(gsapMock.context).not.toHaveBeenCalled();
    expect(gsapMock.timeline).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: '播放作品：影像项目 A' })).toBeInTheDocument();
    await waitFor(() => expect(play).toHaveBeenCalledOnce());
    const video = document.body.querySelector('video') as HTMLVideoElement;
    fireEvent.click(screen.getByRole('button', { name: '静音' }));
    expect(video.muted).toBe(true);
  });
});
