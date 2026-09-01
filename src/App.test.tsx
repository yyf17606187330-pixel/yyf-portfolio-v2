import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./hooks/useLenis', () => ({ useLenis: vi.fn() }));
const useScrollVideoMock = vi.hoisted(() => vi.fn());
vi.mock('./hooks/useScrollVideo', () => ({ useScrollVideo: useScrollVideoMock }));

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    useScrollVideoMock.mockReset();
    useScrollVideoMock.mockImplementation(({
      poster,
      source,
    }: {
      poster: string;
      source: string | null;
    }) => ({
      motionEligible: Boolean(source),
      motionEnabled: Boolean(source),
      videoProps: {
        muted: true,
        playsInline: true,
        poster,
        src: source ?? undefined,
      },
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('connects the Hero works link to the real sample without exposing the placeholder index', () => {
    const { container } = render(<App />);

    expect(screen.getByRole('heading', { name: '杨玉峰' })).toBeInTheDocument();
    const hero = screen.getByRole('region', { name: '杨玉峰' });
    expect(within(hero).getByText('查看作品').closest('a')).toHaveAttribute('href', '#works');
    expect(screen.getByRole('region', { name: '精选作品' })).toHaveAttribute('id', 'works');
    expect(screen.getByRole('heading', { name: '净水器' })).toBeInTheDocument();
    expect(screen.queryByText('待补充影像项目 01')).not.toBeInTheDocument();
    expect(container.querySelectorAll('main > section')).toHaveLength(4);
  });

  it('places About, Works and Experience after the Hero in document order', () => {
    const { container } = render(<App />);
    const sections = container.querySelectorAll('main > section');

    expect(sections).toHaveLength(4);
    expect(sections[1]).toHaveAttribute('id', 'about');
    expect(sections[2]).toHaveAttribute('id', 'works');
    expect(sections[3]).toHaveAttribute('id', 'experience');
    expect(sections[1].querySelector('a[href="#works"]')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '关于我与工作方式' })).toBe(sections[1]);
    expect(screen.getByRole('region', { name: '工作经历' })).toBe(sections[3]);
    expect(within(sections[1] as HTMLElement).getByText('45万元')).toBeInTheDocument();
    expect(sections[1]).toHaveTextContent('单条素材单月最高投放消耗');
    expect(sections[1]).toHaveTextContent('投产比 1:5');
    expect(sections[1]).toHaveTextContent('UV 价值从 0 提升至约 6 元');
    expect(within(sections[1] as HTMLElement).getByRole('img', {
      name: '杨玉峰个人肖像视频',
    })).toBeInTheDocument();
  });

  it('renders the complete verified experience source without crossing metric ownership', () => {
    render(<App />);
    const section = screen.getByRole('region', { name: '工作经历' });
    const entries = section.querySelectorAll('[data-experience-entry]');

    expect(entries).toHaveLength(3);
    expect([...entries].map((entry) => entry.querySelector('h3')?.textContent)).toEqual([
      '兴海集团',
      '广州哲品家居用品有限公司',
      '酷我贸易（徐州）有限公司',
    ]);
    expect(entries[0]).toHaveTextContent('2025.11—至今');
    expect(entries[0]).toHaveTextContent('约1周→3天');
    expect(entries[1]).toHaveTextContent('2025 · 短期项目');
    expect(entries[1]).toHaveTextContent('80万元／1:7');
    expect(entries[1]).not.toHaveTextContent('45万元／1:5');
    expect(entries[2]).toHaveTextContent('2022.10—2025.06');
    expect(entries[2]).toHaveTextContent('45万元／1:5');
    expect(entries[2]).toHaveTextContent('0→约6元／BPM约6000');
    expect(section).not.toHaveTextContent(/四个月|2025\.07—11|约8个月/);
  });

  it('places the only water-purifier case inside the Kuwo experience and outside selected work', () => {
    render(<App />);
    const works = screen.getByRole('region', { name: '精选作品' });
    const experience = screen.getByRole('region', { name: '工作经历' });
    const entries = [...experience.querySelectorAll<HTMLElement>('[data-experience-entry]')];
    const waterHeadings = screen.getAllByRole('heading', { name: '净水器' });

    expect(waterHeadings).toHaveLength(1);
    expect(within(works).queryByRole('heading', { name: '净水器' })).not.toBeInTheDocument();
    expect(entries[2]).toHaveAttribute('data-experience-id', 'kuwo');
    expect(within(entries[2]).getByRole('heading', { name: '净水器' })).toBe(waterHeadings[0]);
    expect(experience.querySelectorAll('[data-experience-project]')).toHaveLength(1);
  });

  it('loads full media only after a click and restores the opener after closing', async () => {
    render(<App />);
    const opener = screen.getByRole('button', { name: '播放净水器短片 01' });

    expect(document.querySelector('video[src*="full-"]')).not.toBeInTheDocument();
    expect(opener.querySelector('.lazy-preview')).toHaveStyle({ aspectRatio: '9/16' });
    fireEvent.click(opener);

    const dialog = await screen.findByRole('dialog', { name: '播放作品：净水器' });
    expect(dialog.querySelector('video')).toHaveAttribute('src', '/media/projects/water-purifier/full-hevc.mp4');
    expect((dialog.querySelector('video') as HTMLVideoElement).muted).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: '关闭播放器' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
    expect(document.querySelector('video[src*="full-"]')).not.toBeInTheDocument();
    expect(document.body.style.position).not.toBe('fixed');
  });

  it('keeps the opening player focusable while its real entrance animation is still running', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '播放净水器短片 01' }));

    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(window.getComputedStyle(dialog).visibility).not.toBe('hidden');
    expect(screen.getByRole('button', { name: '关闭播放器' })).toHaveFocus();
  });

  it('configures the ignored Hero video while retaining the committed portrait fallback', () => {
    const { container } = render(<App />);
    const portrait = screen.getByRole('img', { name: '杨玉峰个人肖像' });
    const video = container.querySelector('video');

    expect(portrait).toHaveAttribute('src', '/media/hero/hero-poster.webp');
    expect(video).toHaveAttribute('poster', '/media/hero/hero-poster.webp');
    expect(useScrollVideoMock).toHaveBeenCalledWith(expect.objectContaining({
      source: '/media/hero/hero-scroll.mp4',
    }));
  });

  it('keeps the video as the only ending media throughout forward and reverse scrolling', () => {
    const { container } = render(<App />);
    const video = container.querySelector('video');
    const options = useScrollVideoMock.mock.calls.at(-1)?.[0] as {
      onProgress: (progress: number | null) => void;
    };

    for (const progress of [0, 0.92, 1, 0.3]) {
      act(() => options.onProgress(progress));
      expect(video).toHaveAttribute('src', '/media/hero/hero-scroll.mp4');
      expect(video).toBeVisible();
      expect(container.querySelector('img[src="/media/hero/hero-ending.webp"]'))
        .not.toBeInTheDocument();
    }
  });
});
