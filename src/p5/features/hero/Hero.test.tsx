import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Hero } from './Hero';
import { SiteHeader } from '../navigation/SiteHeader';

const scroll = vi.hoisted(() => ({ create: vi.fn(() => ({ progress: 0 })), revert: vi.fn() }));
vi.mock('gsap', () => ({ default: {
  registerPlugin: vi.fn(), context: (fn: () => void) => { fn(); return { revert: scroll.revert }; },
} }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: scroll.create } }));

const props = {
  portrait: { objectPosition: '64% 43%', scale: 1, src: '/assets/hero/hero-candidate-03.webp', tone: 'light' as const },
  scrollVideo: { poster: '/media/hero/hero-poster.webp', source: '/media/hero/hero-scroll.mp4' },
};

describe('Hero poster and motion', () => {
  let intersect: IntersectionObserverCallback;
  const play = vi.fn(() => Promise.resolve());
  const pause = vi.fn();
  const enter = (visible: boolean) => act(() => intersect(
    [{ isIntersecting: visible } as IntersectionObserverEntry], {} as IntersectionObserver,
  ));

  beforeEach(() => {
    play.mockClear();
    pause.mockClear();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      intersect = callback;
      return { observe: vi.fn(), disconnect: vi.fn() };
    }));
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('exposes identity, navigation, work entry and accurately scoped metrics before video metadata', () => {
    render(<><SiteHeader /><Hero {...props} /></>);
    expect(screen.getByRole('heading', { name: '杨玉峰' })).toBeVisible();
    expect(screen.getByRole('link', { name: '查看作品' })).toHaveAttribute('href', '#works');
    expect(within(screen.getByRole('navigation', { name: '主导航' })).getAllByRole('link')).toHaveLength(3);
    const proof = screen.getByLabelText('经验与成果');
    expect([...proof.querySelectorAll('dt')].map((item) => item.textContent)).toEqual(['7年', '800万+', '100+', '0→1']);
    expect([...proof.querySelectorAll('dd')].map((item) => item.textContent)).toEqual([
      '内容／电商／直播运营经验', '项目年 GMV', '参与拍摄项目', '个人 IP 与电商起号',
    ]);
  });

  it('loads silent inline motion only in view and pauses when leaving', () => {
    const { container } = render(<Hero {...props} />);
    const video = container.querySelector('video')!;
    expect(video).not.toHaveAttribute('src');
    enter(true);
    expect(video).toHaveAttribute('src', props.scrollVideo.source);
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute('playsinline');
    expect(play).toHaveBeenCalled();
    enter(false);
    expect(pause).toHaveBeenCalled();
    expect(video).not.toHaveAttribute('src');
  });

  it('uses scroll seeking on desktop without autoplay or looping, and releases the pin on unmount', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('pointer: fine'),
      addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const { container, unmount } = render(<Hero {...props} />);
    const video = container.querySelector('video')!;
    await waitFor(() => expect(video).toHaveAttribute('src', props.scrollVideo.source));
    Object.defineProperty(video, 'duration', { value: 4, configurable: true });
    fireEvent.loadedMetadata(video);
    expect(play).not.toHaveBeenCalled();
    expect(video.loop).toBe(false);
    expect(screen.getByRole('link', { name: /滚动推进/ })).toHaveAttribute('href', '#about');
    expect(scroll.create).toHaveBeenCalled();
    unmount();
    expect(scroll.revert).toHaveBeenCalled();
  });

  it('honors manual pause across viewport changes', () => {
    render(<Hero {...props} />);
    enter(true);
    fireEvent.click(screen.getByRole('button', { name: '暂停肖像动效' }));
    const playCount = play.mock.calls.length;
    enter(false);
    enter(true);
    expect(play).toHaveBeenCalledTimes(playCount);
    expect(screen.getByRole('button', { name: '播放肖像动效' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '播放肖像动效' }));
    expect(play).toHaveBeenCalledTimes(playCount + 1);
  });

  it('suspends behind the player and while the document is hidden, then resumes when allowed', () => {
    const { rerender } = render(<Hero {...props} />);
    enter(true);
    rerender(<Hero {...props} paused />);
    const playCount = play.mock.calls.length;
    expect(pause).toHaveBeenCalled();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    fireEvent(document, new Event('visibilitychange'));
    rerender(<Hero {...props} />);
    expect(play).toHaveBeenCalledTimes(playCount);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    fireEvent(document, new Event('visibilitychange'));
    expect(play).toHaveBeenCalledTimes(playCount + 1);
  });

  it('uses a static, fully usable poster for reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const { container } = render(<Hero {...props} />);
    expect(container.querySelector('video')).toBeNull();
    expect(screen.getByRole('img', { name: '杨玉峰个人肖像' })).toBeVisible();
    expect(screen.getByRole('link', { name: '查看作品' })).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('keeps the poster after video failure and the committed portrait after poster failure', () => {
    const { container } = render(<Hero {...props} />);
    enter(true);
    fireEvent.error(container.querySelector('video')!);
    expect(container.querySelector('video')).toBeNull();
    const image = screen.getByRole('img', { name: '杨玉峰个人肖像' });
    expect(image).toHaveAttribute('src', props.scrollVideo.poster);
    fireEvent.error(image);
    expect(image).toHaveAttribute('src', props.portrait.src);
    expect(screen.getByRole('link', { name: '查看作品' })).toBeVisible();
  });

  it('allows reading and navigation when no motion source or observer is available', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Hero portrait={props.portrait} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', props.portrait.src);
    expect(screen.getByRole('link', { name: '查看作品' })).toHaveAttribute('href', '#works');
  });

  it('pauses the video and disconnects its observer on unmount', () => {
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      intersect = callback;
      return { observe: vi.fn(), disconnect };
    }));
    const { unmount } = render(<Hero {...props} />);
    enter(true);
    pause.mockClear();
    unmount();
    expect(pause).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
