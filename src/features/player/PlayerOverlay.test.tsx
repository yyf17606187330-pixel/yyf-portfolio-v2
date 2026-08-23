import { useRef, useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '../../types/portfolio';
import { PlayerOverlay } from './PlayerOverlay';

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
  });

  it('attempts audible playback on open and exposes playback, mute, progress and fullscreen controls', async () => {
    render(<PlayerOverlay project={playableProject} opener={null} onClose={vi.fn()} />);
    const video = document.body.querySelector('video') as HTMLVideoElement;

    expect(video).toHaveAttribute('src', '/media/videos/film-a.mp4');
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
});
