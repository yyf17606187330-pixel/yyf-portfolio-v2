import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { aboutContent } from '../../content/about';
import { AboutSection, type AboutContent } from './AboutSection';

const fixture: AboutContent = {
  sectionNumber: '01',
  eyebrow: '关于我与工作方式',
  transition: {
    now: "NOW · AUG '26",
    items: [
      { id: 'position', label: 'POSITION', value: '新媒体内容运营', detail: '影像创作者' },
      { id: 'focus', label: 'FOCUS', value: '内容策略', detail: '人群分析 · 选题策划' },
      { id: 'production', label: 'PRODUCTION', value: '影像制作', detail: '编导 · 拍摄 · 剪辑 · 调色' },
      { id: 'method', label: 'METHOD', value: 'AI与协作', detail: 'AI应用 · 多Agent · 网站搭建' },
    ],
  },
  title: {
    primary: '内容策划与影像创作',
    accent: 'AI应用与运营实践',
  },
  capabilities: [
    '人群分析',
    '编导拍摄',
    '剪辑调色',
    'AI视觉',
    '千川投放',
    '多Agent协作',
    '网站搭建',
    '效率管理',
  ],
  intro: '我把内容判断、影像执行和AI工具放在同一条工作链路里，从人群需求出发，把选题、制作、发布与复盘组织成可落地的结果。',
  paragraphs: [
    '第一段正文用于说明内容运营、人群分析与影像制作能力，并保持参考版式所需的阅读密度。',
    '第二段正文用于说明AI环境、网站搭建、多Agent协作和管理效率，避免空泛口号。',
  ],
  signature: { name: '杨玉峰', role: '内容运营与影像创作者' },
  capabilityGroups: [
    { id: 'content-operations', title: '内容与运营', description: '人群分析与平台运营。' },
    { id: 'image-and-graphic', title: '影像与平面', description: '影像全流程与平面制作。' },
    { id: 'ai-visual-production', title: 'AI视觉制作', description: '生图、融合改图与海报。' },
    { id: 'ai-environment', title: 'AI环境搭建', description: '工具环境与账号订阅问题处理。' },
    { id: 'web-and-agents', title: '网站与多Agent协作', description: '前端、部署与任务分工。' },
    { id: 'management-and-efficiency', title: '管理与效率', description: '多维表格与结果导向协作。' },
  ],
  outcomes: [
    { id: 'commercial-content', label: '商业内容', value: '45万元', description: '单条素材单月最高投放消耗。' },
    { id: 'complete-creation', label: '完整创作', value: '全流程', description: '剧情短片主导编导到输出。' },
    { id: 'post-production', label: '后期组织', value: '800+', description: '旅拍素材筛选与后期组织。' },
  ],
  notes: ['数据口径以已确认事实为准。', '作品职责详见对应项目。'],
  worksLink: { label: '进入作品集', href: '#works' },
  portrait: {
    type: 'video',
    src: 'about/about-portrait.mp4',
    poster: 'about/about-portrait-poster.webp',
    alt: '杨玉峰个人肖像视频',
    position: 'center',
    hover: {
      src: 'about/about-portrait-hover.mp4',
      position: 'center',
      startAt: 0.25,
    },
  } as AboutContent['portrait'],
  portraitPlaceholder: '个人肖像／工作照待确认',
};

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query === '(hover: hover) and (pointer: fine)',
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('AboutSection', () => {
  it('uses the approved English primary title with the Chinese AI accent title', () => {
    expect(aboutContent.title).toEqual({
      primary: 'CONTENT STRATEGY & VISUAL PRODUCTION',
      accent: 'AI应用与运营实践',
    });
  });

  it('renders the approved 01 section with complete 8 / 6 / 3 information', () => {
    render(<AboutSection content={fixture} />);

    const section = screen.getByRole('region', { name: '关于我与工作方式' });
    expect(section).toHaveAttribute('id', 'about');
    expect(section.querySelector('.about-section__chapter span')).toHaveTextContent('01');
    expect(within(section).getByRole('heading', {
      level: 2,
      name: '内容策划与影像创作 AI应用与运营实践',
    })).toBeInTheDocument();
    expect(within(section).getAllByRole('listitem', { name: /能力：/ })).toHaveLength(8);
    expect(within(section).getByRole('list', { name: '能力范围' }).children).toHaveLength(6);
    expect(section.querySelectorAll('dl[aria-label="实践与成果"] > div')).toHaveLength(3);
    expect(section).not.toHaveTextContent('content-operations');
    expect(section).not.toHaveTextContent('commercial-content');
    expect(within(section).getByRole('link', { name: '进入作品集' })).toHaveAttribute('href', '#works');
  });

  it('places a four-part editorial transition rail before the About title', () => {
    const { container } = render(<AboutSection content={fixture} />);

    const transition = screen.getByRole('complementary', { name: '关于我导览' });
    expect(within(transition).getByText("NOW · AUG '26")).toBeInTheDocument();
    expect(transition.querySelectorAll('dl > div')).toHaveLength(4);
    expect(within(transition).getByText('新媒体内容运营')).toBeInTheDocument();
    expect(within(transition).getByText('影像制作')).toBeInTheDocument();
    expect(container.querySelector('[data-about-order="transition"]')?.nextElementSibling)
      .toHaveAttribute('data-about-order', 'title');
  });

  it('keeps the approved mobile reading order and stages two silent non-looping portrait videos', () => {
    const { container } = render(<AboutSection content={fixture} />);
    const order = [...container.querySelectorAll('[data-about-order]')]
      .map((element) => element.getAttribute('data-about-order'));

    expect(order).toEqual([
      'transition',
      'title',
      'capabilities',
      'intro',
      'portrait',
      'body',
      'scope',
      'outcomes',
      'link',
    ]);
    const poster = screen.getByRole('img', { name: '杨玉峰个人肖像视频' });
    expect(poster).toHaveAttribute('src', '/media/about/about-portrait-poster.webp');
    expect(container.querySelector('.about-section__portrait-frame'))
      .toHaveStyle({ aspectRatio: '2 / 3' });
    const video = container.querySelector('.about-section__portrait-video') as HTMLVideoElement;
    expect(video).toHaveAttribute('src', '/media/about/about-portrait.mp4');
    expect(video).toHaveAttribute('poster', '/media/about/about-portrait-poster.webp');
    expect(video).not.toHaveAttribute('autoplay');
    expect(video).not.toHaveAttribute('loop');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('preload', 'metadata');
    expect(video.muted).toBe(true);
    expect(video.controls).toBe(false);
    const hoverVideo = container.querySelector('.about-section__portrait-hover-video') as HTMLVideoElement;
    expect(hoverVideo).toHaveAttribute('src', '/media/about/about-portrait-hover.mp4');
    expect(hoverVideo).not.toHaveAttribute('autoplay');
    expect(hoverVideo).not.toHaveAttribute('loop');
    expect(hoverVideo).toHaveAttribute('playsinline');
    expect(hoverVideo).toHaveAttribute('preload', 'auto');
    expect(hoverVideo.muted).toBe(true);
    expect(hoverVideo.controls).toBe(false);
    expect(screen.getByText('杨玉峰')).toBeInTheDocument();
  });

  it('keeps only the static portrait poster when reduced motion is requested', () => {
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

    const { container } = render(<AboutSection content={fixture} />);
    expect(container.querySelector('.about-section__portrait-frame video')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: '杨玉峰个人肖像视频' }))
      .toHaveAttribute('src', '/media/about/about-portrait-poster.webp');
  });

  it('does not load the hover material on devices without hover', () => {
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

    const { container } = render(<AboutSection content={fixture} />);
    expect(container.querySelector('.about-section__portrait-video')).toBeInTheDocument();
    expect(container.querySelector('.about-section__portrait-hover-video')).not.toBeInTheDocument();
  });

  it('keeps the primary portrait when the hover material cannot decode', () => {
    const { container } = render(<AboutSection content={fixture} />);
    const hoverVideo = container.querySelector('.about-section__portrait-hover-video') as HTMLVideoElement;

    fireEvent.error(hoverVideo);

    expect(container.querySelector('.about-section__portrait-hover-video')).not.toBeInTheDocument();
    expect(container.querySelector('.about-section__portrait-video')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '杨玉峰个人肖像视频' })).toBeInTheDocument();
  });

  it('resumes the primary portrait immediately when an active hover video fails', () => {
    let intersect: IntersectionObserverCallback | undefined;
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      intersect = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    }));

    const { container } = render(<AboutSection content={fixture} />);
    act(() => intersect?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ));
    const frame = container.querySelector('.about-section__portrait-frame') as HTMLDivElement;
    const primaryVideo = container.querySelector('.about-section__portrait-video') as HTMLVideoElement;
    const hoverVideo = container.querySelector('.about-section__portrait-hover-video') as HTMLVideoElement;
    const primaryPlay = vi.fn().mockResolvedValue(undefined);
    const primaryPause = vi.fn();
    Object.defineProperty(primaryVideo, 'play', { configurable: true, value: primaryPlay });
    Object.defineProperty(primaryVideo, 'pause', { configurable: true, value: primaryPause });
    Object.defineProperty(hoverVideo, 'play', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(hoverVideo, 'readyState', { configurable: true, value: 4 });
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({
      bottom: 470,
      height: 450,
      left: 10,
      right: 310,
      top: 20,
      width: 300,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    });
    primaryVideo.currentTime = 1.75;

    fireEvent.pointerEnter(frame, { clientX: 110, clientY: 170, pointerType: 'mouse' });
    expect(primaryPause).toHaveBeenCalledTimes(1);

    fireEvent.error(hoverVideo);

    expect(container.querySelector('.about-section__portrait-hover-video')).not.toBeInTheDocument();
    expect(frame).toHaveAttribute('data-hover-reveal', 'inactive');
    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(primaryPlay).toHaveBeenCalledTimes(1);
    expect(primaryVideo.currentTime).toBe(1.75);
  });

  it('pauses the portrait video offscreen and falls back after a decoding error', () => {
    let intersect: IntersectionObserverCallback | undefined;
    const play = vi.mocked(HTMLMediaElement.prototype.play);
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      intersect = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    }));

    const { container } = render(<AboutSection content={fixture} />);
    expect(container.querySelector('video')).not.toBeInTheDocument();

    act(() => intersect?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ));
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toBeInTheDocument();
    expect(play).toHaveBeenCalled();

    act(() => intersect?.(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ));
    expect(pause).toHaveBeenCalled();

    fireEvent.error(video);
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: '杨玉峰个人肖像视频' })).toBeInTheDocument();
  });

  it('suspends both portrait layers while a global overlay is open and resumes afterward', () => {
    let intersect: IntersectionObserverCallback | undefined;
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      intersect = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    }));

    const { container, rerender } = render(<AboutSection content={fixture} />);
    act(() => intersect?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ));

    const frame = container.querySelector('.about-section__portrait-frame') as HTMLDivElement;
    const primaryVideo = container.querySelector('.about-section__portrait-video') as HTMLVideoElement;
    const hoverVideo = container.querySelector('.about-section__portrait-hover-video') as HTMLVideoElement;
    const primaryPlay = vi.fn().mockResolvedValue(undefined);
    const primaryPause = vi.fn();
    const hoverPause = vi.fn();
    Object.defineProperty(primaryVideo, 'play', { configurable: true, value: primaryPlay });
    Object.defineProperty(primaryVideo, 'pause', { configurable: true, value: primaryPause });
    Object.defineProperty(hoverVideo, 'play', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(hoverVideo, 'pause', { configurable: true, value: hoverPause });
    Object.defineProperty(hoverVideo, 'readyState', { configurable: true, value: 4 });

    fireEvent.pointerEnter(frame, { clientX: 10, clientY: 10, pointerType: 'mouse' });
    expect(frame).toHaveAttribute('data-hover-reveal', 'active');

    rerender(<AboutSection content={fixture} paused />);

    expect(primaryPause.mock.calls.length).toBeGreaterThan(1);
    expect(hoverPause).toHaveBeenCalledTimes(1);
    expect(frame).toHaveAttribute('data-hover-reveal', 'inactive');

    rerender(<AboutSection content={fixture} />);
    expect(primaryPlay).toHaveBeenCalledTimes(1);
  });

  it('plays one viewport-triggered cycle and does not restart after it ends', () => {
    let intersect: IntersectionObserverCallback | undefined;
    const play = vi.mocked(HTMLMediaElement.prototype.play);
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      intersect = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    }));

    const { container } = render(<AboutSection content={fixture} />);
    act(() => intersect?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ));

    const video = container.querySelector('.about-section__portrait-video') as HTMLVideoElement;
    expect(play).toHaveBeenCalledTimes(1);

    fireEvent.ended(video);
    act(() => intersect?.(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ));
    act(() => intersect?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ));

    expect(play).toHaveBeenCalledTimes(1);
  });

  it('reveals the hover video from the pointer entry point and retracts it on leave', () => {
    let intersect: IntersectionObserverCallback | undefined;
    let animationFrame: FrameRequestCallback | undefined;
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      animationFrame = callback;
      return 1;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      intersect = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    }));

    const { container } = render(<AboutSection content={fixture} />);
    act(() => intersect?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ));

    const frame = container.querySelector('.about-section__portrait-frame') as HTMLDivElement;
    const hoverVideo = container.querySelector('.about-section__portrait-hover-video') as HTMLVideoElement;
    const hoverPlay = vi.fn().mockResolvedValue(undefined);
    const hoverPause = vi.fn();
    Object.defineProperty(hoverVideo, 'play', { configurable: true, value: hoverPlay });
    Object.defineProperty(hoverVideo, 'pause', { configurable: true, value: hoverPause });
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({
      bottom: 470,
      height: 450,
      left: 10,
      right: 310,
      top: 20,
      width: 300,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    });

    const revealStartTime = performance.now();
    fireEvent.pointerEnter(frame, { clientX: 110, clientY: 170, pointerType: 'mouse' });
    fireEvent.canPlay(hoverVideo);
    act(() => animationFrame?.(revealStartTime + 700));

    const revealMidRadius = Number.parseFloat(
      frame.style.getPropertyValue('--about-portrait-reveal-radius'),
    );
    expect(revealMidRadius).toBeGreaterThan(0);

    act(() => animationFrame?.(revealStartTime + 1100));
    const revealFinalRadius = Number.parseFloat(
      frame.style.getPropertyValue('--about-portrait-reveal-radius'),
    );
    expect(revealFinalRadius).toBeGreaterThan(revealMidRadius);

    expect(frame).toHaveAttribute('data-hover-reveal', 'active');
    expect(frame.style.getPropertyValue('--about-portrait-reveal-x')).toBe('100px');
    expect(frame.style.getPropertyValue('--about-portrait-reveal-y')).toBe('150px');
    expect(revealFinalRadius).toBeGreaterThan(0);
    expect(hoverVideo.currentTime).toBeCloseTo(0.25);
    expect(hoverPlay).toHaveBeenCalledTimes(1);

    const retractStartTime = performance.now();
    fireEvent.pointerLeave(frame, { clientX: 160, clientY: 220, pointerType: 'mouse' });
    act(() => animationFrame?.(retractStartTime + 500));

    const retractMidRadius = Number.parseFloat(
      frame.style.getPropertyValue('--about-portrait-reveal-radius'),
    );
    expect(retractMidRadius).toBeGreaterThan(0);
    expect(retractMidRadius).toBeLessThan(revealFinalRadius);

    act(() => animationFrame?.(retractStartTime + 900));

    expect(frame).toHaveAttribute('data-hover-reveal', 'inactive');
    expect(frame.style.getPropertyValue('--about-portrait-reveal-radius')).toBe('0px');
    expect(hoverPause).toHaveBeenCalled();
  });

  it('keeps the portrait videos mutually exclusive and resumes the primary only after retraction', () => {
    let intersect: IntersectionObserverCallback | undefined;
    let nextAnimationFrameId = 0;
    const animationStartTime = 1_000;
    const animationFrames = new Map<number, FrameRequestCallback>();
    vi.spyOn(performance, 'now').mockReturnValue(animationStartTime);
    const cancelAnimationFrame = vi.fn((id: number) => animationFrames.delete(id));
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      nextAnimationFrameId += 1;
      animationFrames.set(nextAnimationFrameId, callback);
      return nextAnimationFrameId;
    }));
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      intersect = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    }));

    const runNextAnimationFrame = (time: number) => {
      const entry = animationFrames.entries().next().value as
        | [number, FrameRequestCallback]
        | undefined;
      expect(entry).toBeDefined();
      if (!entry) return;
      animationFrames.delete(entry[0]);
      entry[1](time);
    };

    const { container } = render(<AboutSection content={fixture} />);
    act(() => intersect?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ));

    const frame = container.querySelector('.about-section__portrait-frame') as HTMLDivElement;
    const primaryVideo = container.querySelector('.about-section__portrait-video') as HTMLVideoElement;
    const hoverVideo = container.querySelector('.about-section__portrait-hover-video') as HTMLVideoElement;
    const primaryPlay = vi.fn().mockResolvedValue(undefined);
    const primaryPause = vi.fn();
    const hoverPlay = vi.fn().mockResolvedValue(undefined);
    const hoverPause = vi.fn();
    Object.defineProperty(primaryVideo, 'play', { configurable: true, value: primaryPlay });
    Object.defineProperty(primaryVideo, 'pause', { configurable: true, value: primaryPause });
    Object.defineProperty(hoverVideo, 'play', { configurable: true, value: hoverPlay });
    Object.defineProperty(hoverVideo, 'pause', { configurable: true, value: hoverPause });
    Object.defineProperty(hoverVideo, 'readyState', { configurable: true, value: 4 });
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({
      bottom: 470,
      height: 450,
      left: 10,
      right: 310,
      top: 20,
      width: 300,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    });

    primaryVideo.currentTime = 1.75;
    fireEvent.pointerEnter(frame, { clientX: 110, clientY: 170, pointerType: 'mouse' });

    expect(primaryPause).toHaveBeenCalledTimes(1);
    expect(primaryPlay).not.toHaveBeenCalled();
    expect(hoverPlay).toHaveBeenCalledTimes(1);

    fireEvent.pointerLeave(frame, { pointerType: 'mouse' });
    expect(hoverPause).toHaveBeenCalledTimes(1);
    expect(primaryPlay).not.toHaveBeenCalled();

    act(() => runNextAnimationFrame(animationStartTime + 799));
    expect(primaryPlay).not.toHaveBeenCalled();

    act(() => runNextAnimationFrame(animationStartTime + 801));
    expect(primaryPlay).toHaveBeenCalledTimes(1);
    expect(primaryVideo.currentTime).toBe(1.75);

    fireEvent.pointerEnter(frame, { clientX: 130, clientY: 190, pointerType: 'mouse' });
    fireEvent.pointerLeave(frame, { pointerType: 'mouse' });
    const staleRetraction = animationFrames.entries().next().value as
      | [number, FrameRequestCallback]
      | undefined;
    expect(staleRetraction).toBeDefined();

    fireEvent.pointerEnter(frame, { clientX: 140, clientY: 200, pointerType: 'mouse' });
    expect(cancelAnimationFrame).toHaveBeenCalled();
    act(() => staleRetraction?.[1](performance.now() + 900));

    expect(primaryPlay).toHaveBeenCalledTimes(1);
  });

  it('resumes hover playback on ordinary re-entry and seeks to the start only initially or after ending', () => {
    let intersect: IntersectionObserverCallback | undefined;
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      intersect = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    }));

    const { container } = render(<AboutSection content={fixture} />);
    act(() => intersect?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ));

    const frame = container.querySelector('.about-section__portrait-frame') as HTMLDivElement;
    const hoverVideo = container.querySelector('.about-section__portrait-hover-video') as HTMLVideoElement;
    const hoverPlay = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(hoverVideo, 'play', { configurable: true, value: hoverPlay });
    Object.defineProperty(hoverVideo, 'pause', { configurable: true, value: vi.fn() });
    Object.defineProperty(hoverVideo, 'readyState', { configurable: true, value: 4 });
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({
      bottom: 470,
      height: 450,
      left: 10,
      right: 310,
      top: 20,
      width: 300,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    });

    fireEvent.pointerEnter(frame, { clientX: 110, clientY: 170, pointerType: 'mouse' });
    expect(hoverVideo.currentTime).toBeCloseTo(0.25);

    hoverVideo.currentTime = 1.5;
    fireEvent.pointerLeave(frame, { pointerType: 'mouse' });
    fireEvent.pointerEnter(frame, { clientX: 120, clientY: 180, pointerType: 'mouse' });
    expect(hoverVideo.currentTime).toBe(1.5);

    hoverVideo.currentTime = 3.9;
    fireEvent.ended(hoverVideo);
    fireEvent.pointerLeave(frame, { pointerType: 'mouse' });
    fireEvent.pointerEnter(frame, { clientX: 130, clientY: 190, pointerType: 'mouse' });

    expect(hoverVideo.currentTime).toBeCloseTo(0.25);
    expect(hoverPlay).toHaveBeenCalledTimes(3);
  });
});
