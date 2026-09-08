import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import gsap from 'gsap';
import { SiteHeader } from '../navigation/SiteHeader';
import { Hero } from './Hero';

const useScrollVideoMock = vi.hoisted(() => vi.fn());

vi.mock('../../hooks/useScrollVideo', () => ({
  useScrollVideo: useScrollVideoMock,
}));

describe('Hero', () => {
  beforeEach(() => {
    useScrollVideoMock.mockReset();
    useScrollVideoMock.mockImplementation(({
      enabled = true,
      poster,
      source,
    }: {
      enabled?: boolean;
      poster: string;
      source: string | null;
    }) => ({
      motionEligible: enabled && Boolean(source),
      motionEnabled: enabled && Boolean(source),
      videoProps: {
        autoPlay: false,
        muted: true,
        playsInline: true,
        poster,
        preload: source ? 'auto' : 'none',
        src: source ?? undefined,
      },
    }));
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the approved portfolio identity, narrative, and WeChat marker', () => {
    render(
      <Hero
        portrait={{
          objectPosition: '68% 45%',
          scale: 1,
          src: '/assets/hero/hero-candidate-02.webp',
          tone: 'light',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: '杨玉峰' })).toBeInTheDocument();
    expect(screen.getByText('新媒体内容运营 × 影像创作者')).toBeInTheDocument();
    expect(screen.getByText('懂运营，也能把内容从脚本拍到成片。')).toBeInTheDocument();
    expect(
      screen.getByText(
        '负责内容策划、拍摄剪辑与调色，也制作 AI 影像。商业项目中，我把内容制作、发布投放和数据复盘连起来。',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看作品' })).toHaveAttribute('href', '#top');
    expect(screen.getByLabelText('微信联系标识')).toBeInTheDocument();
    expect(screen.getByText('Y.')).toBeInTheDocument();
    expect(screen.getByAltText('微信')).toHaveAttribute(
      'src',
      '/assets/icons/wechat.svg',
    );
    expect(screen.queryByText('PORTFOLIO 2026')).not.toBeInTheDocument();
    expect(screen.queryByText(/nominee/i)).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: '杨玉峰个人肖像' })).toHaveAttribute(
      'src',
      '/assets/hero/hero-candidate-02.webp',
    );
  });

  it('keeps a complete static placeholder when the portrait is not ready', () => {
    render(
      <Hero
        portrait={{
          objectPosition: '50% 50%',
          scale: 1,
          src: '',
          tone: 'light',
        }}
      />,
    );

    expect(screen.getByText('肖像待替换')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: '杨玉峰个人肖像' })).not.toBeInTheDocument();
    expect(screen.getByAltText('微信')).toBeInTheDocument();
  });

  it('keeps the complete static narrative before the call to action', () => {
    render(
      <Hero
        portrait={{
          objectPosition: '64% 44%',
          scale: 1,
          src: '/assets/hero/hero-candidate-03.webp',
          tone: 'light',
        }}
      />,
    );
    const bio = screen.getByText(
      '负责内容策划、拍摄剪辑与调色，也制作 AI 影像。商业项目中，我把内容制作、发布投放和数据复盘连起来。',
    );
    const cta = screen.getByText('查看作品');

    expect(bio.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('uses the matching first-frame poster for both static and video layers', () => {
    const { container } = render(
      <Hero
        portrait={{
          objectPosition: '64% 44%',
          scale: 1,
          src: '/assets/hero/hero-candidate-03.webp',
          tone: 'light',
        }}
        scrollVideo={{
          poster: '/media/hero/hero-poster.webp',
          source: '/media/hero/hero-scroll.mp4',
        }}
      />,
    );

    const portrait = screen.getByRole('img', { name: '杨玉峰个人肖像' });
    const video = container.querySelector('video');

    expect(portrait).toHaveAttribute('src', '/media/hero/hero-poster.webp');
    expect(video).toHaveAttribute('poster', '/media/hero/hero-poster.webp');
    expect(video).toHaveAttribute('src', '/media/hero/hero-scroll.mp4');
    expect(video).toHaveClass('hero__scroll-video');
    expect(video).toHaveAttribute('aria-hidden', 'true');
    expect(video).toHaveAttribute('tabindex', '-1');
    expect(video).not.toHaveAttribute('controls');
    expect(useScrollVideoMock).toHaveBeenCalledWith(expect.objectContaining({
      poster: '/media/hero/hero-poster.webp',
      source: '/media/hero/hero-scroll.mp4',
    }));
  });

  it('falls back to the committed portrait if the local poster is unavailable', () => {
    const { container } = render(
      <Hero
        portrait={{ objectPosition: '64% 43%', scale: 1, src: '/assets/hero/hero-candidate-03.webp', tone: 'light' }}
        scrollVideo={{ poster: '/media/hero/hero-poster.webp', source: '/media/hero/hero-scroll.mp4' }}
      />,
    );
    const portrait = screen.getByRole('img', { name: '杨玉峰个人肖像' });

    fireEvent.error(portrait);

    expect(portrait).toHaveAttribute('src', '/assets/hero/hero-candidate-03.webp');
    expect(container.querySelector('video')).toHaveAttribute('poster', '/assets/hero/hero-candidate-03.webp');

    fireEvent.error(portrait);
    expect(portrait).toHaveAttribute('src', '/assets/hero/hero-candidate-03.webp');
  });

  it('opens with the complete introduction and reveals the four proof points at the end', () => {
    const { container } = render(
      <Hero
        portrait={{
          objectPosition: '64% 44%',
          scale: 1,
          src: '/assets/hero/hero-candidate-03.webp',
          tone: 'light',
        }}
        scrollVideo={{
          poster: '/media/hero/hero-poster.webp',
          source: '/media/hero/hero-scroll.mp4',
        }}
      />,
    );
    const hero = container.querySelector('.hero') as HTMLElement;
    const primary = container.querySelector('.hero__story-panel--primary') as HTMLElement;
    const secondary = container.querySelector('.hero__story-panel--secondary') as HTMLElement;
    const heading = screen.getByRole('heading', { name: '杨玉峰' });
    const emphasis = screen.getByText('懂运营，也能把内容从脚本拍到成片。');
    const cta = screen.getByText('查看作品');
    const options = useScrollVideoMock.mock.calls.at(-1)?.[0] as {
      onProgress?: (progress: number | null) => void;
    };

    expect(primary).toContainElement(heading);
    expect(primary).toContainElement(cta);
    expect(primary).toContainElement(emphasis);
    expect(primary.querySelector('.hero__bio')).not.toBeNull();
    expect(secondary.querySelectorAll('dl > div')).toHaveLength(4);
    expect(secondary).toHaveTextContent('7年');
    expect(secondary).toHaveTextContent('800万+');
    expect(secondary).toHaveTextContent('100+');
    expect(secondary).toHaveTextContent('0→1');
    expect(secondary).toHaveTextContent('参与拍摄项目');
    expect(options.onProgress).toEqual(expect.any(Function));
    expect(hero).toHaveClass('hero--scroll-story');

    act(() => options.onProgress?.(0));
    expect(secondary).toHaveStyle({ opacity: '0', visibility: 'hidden' });

    act(() => options.onProgress?.(0.9));
    expect(heading).toHaveStyle({ opacity: '0', visibility: 'hidden' });
    expect(emphasis).toHaveStyle({ opacity: '0', visibility: 'hidden' });
    expect(cta).toBeVisible();
    expect(secondary).toHaveStyle({ opacity: '1' });
    expect(secondary).not.toHaveStyle({ visibility: 'hidden' });
  });

  it('zooms only the media toward the face and reverses without moving the copy', () => {
    const { container } = render(
      <Hero
        portrait={{ objectPosition: '64% 43%', scale: 1, src: '/assets/hero/hero-candidate-03.webp', tone: 'light' }}
        scrollVideo={{ poster: '/media/hero/hero-poster.webp', source: '/media/hero/hero-scroll.mp4' }}
      />,
    );
    const media = container.querySelector('.hero__media') as HTMLElement;
    const copy = container.querySelector('.hero__copy') as HTMLElement;
    const options = useScrollVideoMock.mock.calls.at(-1)?.[0] as {
      onProgress: (progress: number | null) => void;
    };

    act(() => options.onProgress(1));
    expect(Number(gsap.getProperty(media, 'scaleX'))).toBeCloseTo(1.1, 3);
    expect(Number(gsap.getProperty(media, 'x'))).toBe(0);
    expect(copy.style.transform).toBe('');

    act(() => options.onProgress(0));
    expect(Number(gsap.getProperty(media, 'scaleX'))).toBe(1);
    expect(screen.getByText('查看作品')).not.toBeVisible();

    act(() => options.onProgress(null));
    expect(media.style.transform).toBe('');
  });

  it('returns to normal document flow when the story cannot fit the viewport', () => {
    let panelHeight = 420;
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('hero__story-panel') ? panelHeight : 0;
    });
    vi.stubGlobal('innerHeight', 800);
    const { container } = render(
      <Hero
        portrait={{ objectPosition: '64% 43%', scale: 1, src: '/assets/hero/hero-candidate-03.webp', tone: 'light' }}
        scrollVideo={{ poster: '/media/hero/hero-poster.webp', source: '/media/hero/hero-scroll.mp4' }}
      />,
    );
    const hero = container.querySelector('.hero');
    expect(hero).toHaveClass('hero--scroll-story');

    panelHeight = 900;
    fireEvent(window, new Event('resize'));

    expect(hero).not.toHaveClass('hero--scroll-story');
    expect(screen.getByRole('link', { name: '查看作品' })).toBeVisible();
    expect(screen.getByText('800万+')).toBeVisible();

    panelHeight = 420;
    fireEvent(window, new Event('resize'));
    expect(hero).toHaveClass('hero--scroll-story');
  });

  it('rechecks content-only resizes and disconnects the observer when unmounted', () => {
    let panelHeight = 420;
    let resizeContent: (() => void) | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('hero__story-panel') ? panelHeight : 0;
    });
    vi.stubGlobal('innerHeight', 800);
    vi.stubGlobal('ResizeObserver', class {
      observe = observe;
      disconnect = disconnect;

      constructor(callback: () => void) {
        resizeContent = callback;
      }
    });
    const { container, unmount } = render(
      <Hero
        portrait={{ objectPosition: '64% 43%', scale: 1, src: '/assets/hero/hero-candidate-03.webp', tone: 'light' }}
        scrollVideo={{ poster: '/media/hero/hero-poster.webp', source: '/media/hero/hero-scroll.mp4' }}
      />,
    );
    const hero = container.querySelector('.hero');
    expect(observe).toHaveBeenCalledWith(container.querySelector('.hero__story-panel--primary'));
    expect(observe).toHaveBeenCalledWith(container.querySelector('.hero__story-panel--secondary'));
    expect(hero).toHaveClass('hero--scroll-story');

    panelHeight = 900;
    act(() => resizeContent?.());
    expect(hero).not.toHaveClass('hero--scroll-story');
    expect(screen.getByText('800万+')).toBeVisible();

    panelHeight = 420;
    act(() => resizeContent?.());
    expect(hero).toHaveClass('hero--scroll-story');

    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('reveals navigation gradually and waits for the proof section before showing the CTA', () => {
    const headerRef = createRef<HTMLElement>();
    const { container } = render(
      <>
        <SiteHeader headerRef={headerRef} />
        <Hero
          headerRef={headerRef}
          portrait={{
            objectPosition: '64% 44%',
            scale: 1,
            src: '/assets/hero/hero-candidate-03.webp',
            tone: 'light',
          }}
          scrollVideo={{
            poster: '/media/hero/hero-poster.webp',
            source: '/media/hero/hero-scroll.mp4',
          }}
        />
      </>,
    );
    const header = container.querySelector('.site-header') as HTMLElement;
    const marker = screen.getByLabelText('微信联系标识');
    const cta = screen.getByText('查看作品');
    const chrome = [header, marker];
    const controls = [header, marker, cta];
    const options = useScrollVideoMock.mock.calls.at(-1)?.[0] as {
      onProgress?: (progress: number | null) => void;
    };

    for (const control of controls) {
      expect(control).toHaveStyle({ opacity: '0', visibility: 'hidden' });
    }
    expect(screen.queryByRole('link', { name: '查看作品' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '返回页面顶部' })).not.toBeInTheDocument();

    act(() => options.onProgress?.(0));
    for (const control of controls) {
      expect(control).not.toBeVisible();
    }

    act(() => options.onProgress?.(0.12));
    for (const control of controls) {
      expect(control).not.toBeVisible();
    }

    act(() => options.onProgress?.(0.3));
    const partialOpacity = chrome.map((control) => Number(control.style.opacity));
    for (const opacity of partialOpacity) {
      expect(opacity).toBeGreaterThan(0);
      expect(opacity).toBeLessThan(0.5);
    }
    expect(cta).not.toBeVisible();

    for (const progress of [0.6, 0.8]) {
      act(() => options.onProgress?.(progress));
      for (const control of chrome) {
        expect(control).toHaveStyle({ opacity: '1' });
        expect(control).toBeVisible();
      }
      expect(cta).not.toBeVisible();
    }
    expect(screen.getByText('800万+')).toBeVisible();

    act(() => options.onProgress?.(0.86));
    const partialCtaOpacity = Number(cta.style.opacity);
    expect(partialCtaOpacity).toBeGreaterThan(0);
    expect(partialCtaOpacity).toBeLessThan(0.25);

    act(() => options.onProgress?.(1));
    for (const control of controls) {
      expect(control).toHaveStyle({ opacity: '1' });
      expect(control).toBeVisible();
    }

    act(() => options.onProgress?.(0.86));
    expect(Number(cta.style.opacity)).toBeCloseTo(partialCtaOpacity, 4);
    act(() => options.onProgress?.(0.3));
    chrome.forEach((control, index) => {
      expect(Number(control.style.opacity)).toBeCloseTo(partialOpacity[index], 4);
    });
    expect(cta).not.toBeVisible();

    act(() => options.onProgress?.(0));
    for (const control of controls) {
      expect(control).toHaveStyle({ opacity: '0', visibility: 'hidden' });
    }
  });

  it('hides controls before video metadata arrives and restores them on static fallback', () => {
    let eligible = true;
    useScrollVideoMock.mockImplementation(({ poster }: { poster: string }) => ({
      motionEligible: eligible,
      motionEnabled: false,
      videoProps: { poster, muted: true, playsInline: true },
    }));
    const headerRef = createRef<HTMLElement>();
    const Page = () => (
      <>
        <SiteHeader headerRef={headerRef} />
        <Hero
          headerRef={headerRef}
          portrait={{ objectPosition: '64% 43%', scale: 1, src: '/assets/hero/hero-candidate-03.webp', tone: 'light' }}
          scrollVideo={{ poster: '/media/hero/hero-poster.webp', source: '/media/hero/hero-scroll.mp4' }}
        />
      </>
    );
    const { container, rerender, unmount } = render(<Page />);
    const controls = [
      container.querySelector('.site-header') as HTMLElement,
      screen.getByLabelText('微信联系标识'),
      screen.getByText('查看作品'),
    ];
    for (const control of controls) {
      expect(control).toHaveStyle({ opacity: '0', visibility: 'hidden' });
    }
    expect(container.querySelector('.hero')).not.toHaveClass('hero--scroll-story');

    eligible = false;
    rerender(<Page />);
    expect(screen.getByRole('link', { name: '查看作品' })).toBeVisible();
    expect(screen.getByRole('link', { name: '返回页面顶部' })).toBeVisible();
    expect(screen.getByLabelText('微信联系标识')).not.toBeVisible();

    unmount();
    for (const control of controls) {
      expect(control.style.opacity).toBe('');
      expect(control.style.visibility).toBe('');
    }
  });

  it('keeps the marker outside Hero and reveals it through static-page scrolling without losing its initial state', () => {
    let scrollPosition = 0;
    vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scrollPosition);
    const frames = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++frameId, callback);
      return frameId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
    const portrait = { objectPosition: '64% 43%', scale: 1, src: '/portrait.webp', tone: 'light' as const };
    const { container, rerender, unmount } = render(<Hero portrait={portrait} />);
    const marker = screen.getByLabelText('微信联系标识');
    expect(container.querySelector('.hero')).not.toContainElement(marker);
    expect(marker.parentElement).toBe(document.body);
    expect(marker).not.toBeVisible();
    const scroll = (position: number) => {
      scrollPosition = position;
      fireEvent.scroll(window);
      act(() => {
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach((callback) => callback(performance.now()));
      });
    };
    scroll(window.innerHeight * 0.36);
    expect(Number(marker.style.opacity)).toBeGreaterThan(0);
    expect(Number(marker.style.opacity)).toBeLessThan(1);
    scroll(window.innerHeight * 3);
    expect(marker).toHaveStyle({ opacity: '1' });
    rerender(<Hero paused portrait={portrait} />);
    expect(marker).toHaveAttribute('hidden');
    rerender(<Hero portrait={portrait} />);
    expect(marker).toBeVisible();
    scroll(0);
    expect(marker).not.toBeVisible();
    unmount();
    expect(document.body).not.toContainElement(marker);
  });

  it('keeps navigation visible before metadata when the page opened on a valid anchor after Hero', () => {
    const about = document.createElement('section');
    about.id = 'about';
    document.body.appendChild(about);
    window.history.replaceState({}, '', '/#about');
    useScrollVideoMock.mockImplementation(({ poster }: { poster: string }) => ({
      motionEligible: true,
      motionEnabled: false,
      videoProps: { poster, muted: true, playsInline: true },
    }));
    const headerRef = createRef<HTMLElement>();
    const { container, unmount } = render(
      <>
        <SiteHeader headerRef={headerRef} />
        <Hero
          headerRef={headerRef}
          portrait={{ objectPosition: '64% 43%', scale: 1, src: '/assets/hero/hero-candidate-03.webp', tone: 'light' }}
          scrollVideo={{ poster: '/media/hero/hero-poster.webp', source: '/media/hero/hero-scroll.mp4' }}
        />
      </>,
    );

    expect(container.querySelector('.site-header')).toBeVisible();
    expect(screen.getByLabelText('微信联系标识')).toBeVisible();
    expect(screen.getByRole('link', { name: '查看作品' })).toBeVisible();

    unmount();
    about.remove();
  });

  it('reserves the persistent CTA space before enabling the pinned story', () => {
    let metadataReady = false;
    useScrollVideoMock.mockImplementation(({ enabled, poster, source }: {
      enabled: boolean;
      poster: string;
      source: string | null;
    }) => ({
      motionEligible: enabled && Boolean(source),
      motionEnabled: enabled && metadataReady,
      videoProps: { autoPlay: false, muted: true, playsInline: true, poster, preload: 'none' },
    }));
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains('hero__story-panel')) return 740;
      return this.classList.contains('hero__cta') ? 80 : 0;
    });
    vi.stubGlobal('innerHeight', 800);
    const Page = () => (
      <Hero
        portrait={{ objectPosition: '64% 43%', scale: 1, src: '/assets/hero/hero-candidate-03.webp', tone: 'light' }}
        scrollVideo={{ poster: '/media/hero/hero-poster.webp', source: '/media/hero/hero-scroll.mp4' }}
      />
    );
    const { container, rerender } = render(<Page />);

    metadataReady = true;
    rerender(<Page />);

    expect(container.querySelector('.hero')).not.toHaveClass('hero--scroll-story');
    expect(screen.getByRole('link', { name: '查看作品' })).toBeVisible();
    expect(screen.getByText('800万+')).toBeVisible();
  });

  it('restores the complete static copy when scroll-driven motion stops', () => {
    const props = {
      portrait: {
        objectPosition: '64% 44%',
        scale: 1,
        src: '/assets/hero/hero-candidate-03.webp',
        tone: 'light' as const,
      },
      scrollVideo: {
        poster: '/media/hero/hero-poster.webp',
        source: '/media/hero/hero-scroll.mp4',
      },
    };
    const { container, rerender } = render(
      <Hero
        {...props}
      />,
    );
    const hero = container.querySelector('.hero') as HTMLElement;
    const heading = screen.getByRole('heading', { name: '杨玉峰' });
    const emphasis = screen.getByText('懂运营，也能把内容从脚本拍到成片。');
    const options = useScrollVideoMock.mock.calls.at(-1)?.[0] as {
      onProgress?: (progress: number | null) => void;
    };

    act(() => options.onProgress?.(0.7));
    expect(hero).toHaveClass('hero--scroll-story');

    act(() => options.onProgress?.(null));
    useScrollVideoMock.mockImplementation(({
      poster,
      source,
    }: {
      poster: string;
      source: string | null;
    }) => ({
      motionEligible: false,
      motionEnabled: false,
      videoProps: {
        autoPlay: false,
        muted: true,
        playsInline: true,
        poster,
        preload: source ? 'auto' : 'none',
        src: source ?? undefined,
      },
    }));
    rerender(<Hero {...props} />);

    expect(hero).not.toHaveClass('hero--scroll-story');
    expect(heading).not.toHaveStyle({ opacity: '0', visibility: 'hidden' });
    expect(emphasis).not.toHaveStyle({ opacity: '0', visibility: 'hidden' });
    expect(screen.getByRole('link', { name: '查看作品' })).toBeVisible();
    expect(screen.getByText('800万+')).toBeVisible();
  });
});
