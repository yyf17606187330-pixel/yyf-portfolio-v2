import { useRef, useState } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
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
  const load = vi.fn();
  const requestFullscreen = vi.fn(() => Promise.resolve());
  let scrollTo: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    gsapMock.context.mockClear();
    gsapMock.timeline.mockClear();
    play.mockReset().mockResolvedValue();
    pause.mockClear();
    load.mockClear();
    requestFullscreen.mockReset().mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(load);
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

  it('switches to the compatibility source once, then offers retry if that source also fails', async () => {
    render(<PlayerOverlay
      project={{ ...playableProject, fallbackSrc: 'videos/film-a-h264.mp4' }}
      opener={null}
      onClose={vi.fn()}
    />);
    const primaryVideo = document.body.querySelector('video') as HTMLVideoElement;
    fireEvent.error(primaryVideo);

    await waitFor(() => expect(document.body.querySelector('video'))
      .toHaveAttribute('src', '/media/videos/film-a-h264.mp4'));
    const compatibleVideo = document.body.querySelector('video') as HTMLVideoElement;
    expect(compatibleVideo).not.toBe(primaryVideo);
    expect(screen.getByText(/兼容播放/)).toBeInTheDocument();

    fireEvent.error(compatibleVideo);
    expect(screen.getByRole('alert')).toHaveTextContent('暂时无法播放');
    expect(compatibleVideo).toHaveAttribute('src', '/media/videos/film-a-h264.mp4');
    fireEvent.click(screen.getByRole('button', { name: '重试播放' }));
    expect(load).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('explains blocked audible autoplay and lets a deliberate play click recover', async () => {
    play.mockRejectedValueOnce(new DOMException('A user gesture is required', 'NotAllowedError'));
    render(<PlayerOverlay project={playableProject} opener={null} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('点击下方“播放”'));
    fireEvent.click(screen.getByRole('button', { name: '播放' }));
    await waitFor(() => expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument());
    expect(screen.queryByText(/点击下方“播放”/)).not.toBeInTheDocument();
  });

  it('preserves an explicit mute choice when a decoding error switches the same work to its fallback', async () => {
    render(<PlayerOverlay
      project={{ ...playableProject, fallbackSrc: 'videos/film-a-h264.mp4' }}
      opener={null}
      onClose={vi.fn()}
    />);
    fireEvent.click(screen.getByRole('button', { name: '静音' }));
    fireEvent.error(document.body.querySelector('video') as HTMLVideoElement);

    await waitFor(() => expect(document.body.querySelector('video'))
      .toHaveAttribute('src', '/media/videos/film-a-h264.mp4'));
    expect((document.body.querySelector('video') as HTMLVideoElement).muted).toBe(true);
    expect(screen.getByRole('button', { name: '取消静音' })).toBeInTheDocument();
  });

  it('reflects native mute changes in the custom mute control', () => {
    render(<PlayerOverlay project={playableProject} opener={null} onClose={vi.fn()} />);
    const video = document.body.querySelector('video') as HTMLVideoElement;

    video.muted = true;
    fireEvent.volumeChange(video);
    expect(screen.getByRole('button', { name: '取消静音' })).toBeInTheDocument();

    video.muted = false;
    fireEvent.volumeChange(video);
    expect(screen.getByRole('button', { name: '静音' })).toBeInTheDocument();
  });

  it('preserves a native mute choice when the current work falls back to a compatible source', async () => {
    render(<PlayerOverlay
      project={{ ...playableProject, fallbackSrc: 'videos/film-a-h264.mp4' }}
      opener={null}
      onClose={vi.fn()}
    />);
    const primaryVideo = document.body.querySelector('video') as HTMLVideoElement;
    primaryVideo.muted = true;
    fireEvent.volumeChange(primaryVideo);
    fireEvent.error(primaryVideo);

    await waitFor(() => expect(document.body.querySelector('video'))
      .toHaveAttribute('src', '/media/videos/film-a-h264.mp4'));
    expect((document.body.querySelector('video') as HTMLVideoElement).muted).toBe(true);
  });

  it('keeps the custom controls in fullscreen by requesting fullscreen on the dialog when supported', async () => {
    render(<PlayerOverlay project={playableProject} opener={null} onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    const dialogFullscreen = vi.fn(() => Promise.resolve());
    Object.defineProperty(dialog, 'requestFullscreen', { configurable: true, value: dialogFullscreen });

    fireEvent.click(screen.getByRole('button', { name: '全屏' }));
    expect(dialogFullscreen).toHaveBeenCalledOnce();
    expect(requestFullscreen).not.toHaveBeenCalled();
  });

  it('ignores a fullscreen rejection from the previous project after another work opens', async () => {
    const pendingFullscreen = deferredPromise();
    requestFullscreen.mockImplementationOnce(() => pendingFullscreen.promise);
    const { rerender } = render(
      <PlayerOverlay project={playableProject} opener={null} onClose={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole('button', { name: '全屏' }));

    rerender(<PlayerOverlay project={secondPlayableProject} opener={null} onClose={vi.fn()} />);
    await act(async () => {
      pendingFullscreen.reject(new DOMException('Request no longer active', 'NotAllowedError'));
    });

    expect(screen.getByRole('dialog', { name: '播放作品：AI 项目 B' })).toBeInTheDocument();
    expect(screen.queryByText(/当前环境无法进入全屏/)).not.toBeInTheDocument();
  });

  it('ignores an older fullscreen rejection after a newer request succeeds for the same work', async () => {
    const pendingFullscreen = deferredPromise();
    requestFullscreen.mockImplementationOnce(() => pendingFullscreen.promise);
    render(<PlayerOverlay project={playableProject} opener={null} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '全屏' }));
    fireEvent.click(screen.getByRole('button', { name: '全屏' }));

    await act(async () => {
      pendingFullscreen.reject(new DOMException('Older request superseded', 'NotAllowedError'));
    });

    expect(screen.queryByText(/当前环境无法进入全屏/)).not.toBeInTheDocument();
  });

  it('clears an earlier fullscreen failure when a deliberate retry succeeds', async () => {
    requestFullscreen.mockRejectedValueOnce(new DOMException('Request denied', 'NotAllowedError'));
    render(<PlayerOverlay project={playableProject} opener={null} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '全屏' }));
    await screen.findByText(/当前环境无法进入全屏/);

    fireEvent.click(screen.getByRole('button', { name: '全屏' }));
    await waitFor(() => expect(screen.queryByText(/当前环境无法进入全屏/)).not.toBeInTheDocument());
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
