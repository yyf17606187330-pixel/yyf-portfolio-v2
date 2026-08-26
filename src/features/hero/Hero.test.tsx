import { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
      poster,
      source,
    }: {
      poster: string;
      source: string | null;
    }) => ({
      motionEnabled: Boolean(source),
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
        '我以新媒体运营为核心，独立完成选题策划、脚本编导、拍摄剪辑、发布投放与数据复盘。既懂内容怎么做，也懂内容为什么有效；AI 则是我提升创意和生产效率的一部分。',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看作品' })).toHaveAttribute('href', '#top');
    expect(screen.getByLabelText('微信联系标识')).toBeInTheDocument();
    expect(screen.getByText('Y.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '微信' })).toHaveAttribute(
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
    expect(screen.getByRole('img', { name: '微信' })).toBeInTheDocument();
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
      '我以新媒体运营为核心，独立完成选题策划、脚本编导、拍摄剪辑、发布投放与数据复盘。既懂内容怎么做，也懂内容为什么有效；AI 则是我提升创意和生产效率的一部分。',
    );
    const cta = screen.getByRole('link', { name: '查看作品' });

    expect(bio.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('layers a silent decorative scroll video over the committed portrait fallback', () => {
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

    expect(portrait).toHaveAttribute('src', '/assets/hero/hero-candidate-03.webp');
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

  it('uses the shared scroll progress to replace the intro with the approved capability copy', () => {
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
    const cta = screen.getByRole('link', { name: '查看作品' });
    const options = useScrollVideoMock.mock.calls.at(-1)?.[0] as {
      onProgress?: (progress: number | null) => void;
    };

    expect(primary).toContainElement(heading);
    expect(primary).toContainElement(cta);
    expect(secondary).toContainElement(emphasis);
    expect(options.onProgress).toEqual(expect.any(Function));
    expect(hero).toHaveClass('hero--scroll-story');

    act(() => options.onProgress?.(0));
    expect(secondary).toHaveStyle({ opacity: '0', visibility: 'hidden' });

    act(() => options.onProgress?.(0.7));
    expect(heading).toHaveStyle({ opacity: '0', visibility: 'hidden' });
    expect(cta).toHaveStyle({ opacity: '0', visibility: 'hidden' });
    expect(secondary).toHaveStyle({ opacity: '1' });
    expect(secondary).not.toHaveStyle({ visibility: 'hidden' });
  });

  it('uses the shared scroll progress to hide and restore the surrounding navigation chrome', () => {
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
    const options = useScrollVideoMock.mock.calls.at(-1)?.[0] as {
      onProgress?: (progress: number | null) => void;
    };

    expect(header).not.toHaveStyle({ opacity: '0', visibility: 'hidden' });
    expect(marker).not.toHaveStyle({ opacity: '0', visibility: 'hidden' });

    act(() => options.onProgress?.(0.2));
    expect(header).toHaveStyle({ opacity: '0', visibility: 'hidden' });
    expect(marker).toHaveStyle({ opacity: '0', visibility: 'hidden' });

    act(() => options.onProgress?.(0));
    expect(header).not.toHaveStyle({ opacity: '0', visibility: 'hidden' });
    expect(marker).not.toHaveStyle({ opacity: '0', visibility: 'hidden' });
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
    const cta = screen.getByRole('link', { name: '查看作品' });
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
    expect(cta).not.toHaveStyle({ opacity: '0', visibility: 'hidden' });
  });
});
