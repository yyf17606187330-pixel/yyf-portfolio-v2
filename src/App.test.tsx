import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { aboutContent } from './content/about';

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
    vi.unstubAllEnvs();
  });

  it('connects the Hero works link to the real sample without exposing the placeholder index', () => {
    const { container } = render(<App />);

    expect(screen.getByRole('heading', { name: '杨玉峰' })).toBeInTheDocument();
    const hero = screen.getByRole('region', { name: '杨玉峰' });
    expect(within(hero).getByText('查看作品').closest('a')).toHaveAttribute('href', '#works');
    expect(screen.getByRole('region', { name: '影像与调色作品' })).toHaveAttribute('id', 'works');
    expect(screen.getByRole('heading', { name: '净水器' })).toBeInTheDocument();
    expect(screen.queryByText('待补充影像项目 01')).not.toBeInTheDocument();
    expect(container.querySelectorAll('main > section')).toHaveLength(6);
  });

  it('keeps only live navigation links after retiring the placeholder contact panel', () => {
    const { container } = render(<App />);
    const nav = container.querySelector<HTMLElement>('nav[aria-label="主导航"]')!;
    const links = within(nav).getAllByRole('link', { hidden: true });

    expect(links.map((link) => link.textContent)).toEqual(['WORK', 'ABOUT']);
    for (const link of links) {
      expect(container.querySelector(link.getAttribute('href')!)).toBeInTheDocument();
    }
    expect(within(nav).queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: '全站导航' })).not.toBeInTheDocument();
    expect(screen.queryByText(/待补充邮箱|待补充个人简介|微信二维码待替换/))
      .not.toBeInTheDocument();
  });

  it('pauses an active AI hover preview while the player obscures the page', async () => {
    const { container } = render(<App />);
    const card = container.querySelector<HTMLElement>(
      '[data-ai-video-card="ai-video-landscape"]',
    )!;
    const projectOpener = screen.getByRole('button', { name: '播放净水器短片 01' });
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);

    fireEvent.pointerEnter(card, { pointerType: 'mouse' });
    expect(card.querySelector('video')).toBeInTheDocument();

    fireEvent.click(projectOpener);
    await screen.findByRole('dialog', { name: '播放作品：净水器' });

    await waitFor(() => expect(card.querySelector('video')).not.toBeInTheDocument());
    expect(pause).toHaveBeenCalled();
  });

  it('keeps the interactive portrait before the compact work decks without a duplicate work wall', () => {
    const { container } = render(<App />);
    const sections = container.querySelectorAll('main > section');

    expect(sections).toHaveLength(6);
    expect([...sections].slice(1).map(section => section.id)).toEqual([
      'about', 'works', 'ai-video', 'web-projects', 'experience',
    ]);
    expect(screen.getByRole('region', { name: '影像与调色作品' })).toBe(sections[2]);
    expect(container.querySelector('[data-featured-project]')).not.toBeInTheDocument();
    const ai = screen.getByRole('region', { name: 'AI 创作与内容生产' });
    const website = screen.getByRole('region', { name: '网站与交互' });
    expect(website).not.toContainElement(ai);
    expect(ai).not.toContainElement(website);
    expect(website).toHaveTextContent('官网建设中 · 暂未公开');
    expect(website).toHaveTextContent('实景照片可随鼠标响应');
    expect(website.querySelector('a, button, video')).toBeNull();
    expect(screen.queryByRole('region', { name: '技能与工具' })).not.toBeInTheDocument();
    expect(screen.queryByText(/预留四张卡片|AI 视频媒体待接入/)).not.toBeInTheDocument();
    const about = sections[1] as HTMLElement;
    expect(about.querySelector('a[href="#works"]')).toBeInTheDocument();
    expect(within(about).getByRole('list', { name: '能力范围' }).children).toHaveLength(6);
    for (const group of aboutContent.capabilityGroups) {
      fireEvent.click(within(about).getByRole('button', { name: group.title }));
      const link = within(about).getByRole('link', { name: `${group.evidence!.label}：${group.title}` });
      expect(container.querySelector(link.getAttribute('href')!)).toBeInTheDocument();
    }
    expect(about).toHaveTextContent('单条素材单月最高投放消耗');
    expect(about).toHaveTextContent('投产比 1:5');
    expect(about).toHaveTextContent('UV 价值从 0 提升至约 6 元');
    expect(within(about).getByRole('img', { name: '杨玉峰个人肖像视频' })).toBeInTheDocument();
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
    expect(entries[1]).toHaveTextContent('2025.07—2025.11');
    expect(entries[1]).toHaveTextContent('80万元／1:7');
    expect(entries[1]).not.toHaveTextContent('45万元／1:5');
    expect(entries[2]).toHaveTextContent('2022.10—2025.06');
    expect(entries[2]).toHaveTextContent('45万元／1:5');
    expect(entries[2]).toHaveTextContent('0→约6元／BPM约6000');
    expect(section).not.toHaveTextContent(/四个月|2025\.07—11|约8个月/);
  });

  it('keeps the full commercial cases with their owning experience', () => {
    render(<App />);
    const works = screen.getByRole('region', { name: '影像与调色作品' });
    const experience = screen.getByRole('region', { name: '工作经历' });
    const entries = [...experience.querySelectorAll<HTMLElement>('[data-experience-entry]')];
    const waterHeadings = screen.getAllByRole('heading', { name: '净水器' });
    const teaHeadings = screen.getAllByRole('heading', { name: '茶具' });

    expect(waterHeadings).toHaveLength(1);
    expect(teaHeadings).toHaveLength(1);
    expect(within(works).queryByRole('heading', { name: '净水器' })).not.toBeInTheDocument();
    expect(within(works).queryByRole('heading', { name: '茶具' })).not.toBeInTheDocument();
    expect(entries[2]).toHaveAttribute('data-experience-id', 'kuwo');
    expect(within(entries[2]).getByRole('heading', { name: '净水器' })).toBe(waterHeadings[0]);
    expect(entries[1]).toHaveAttribute('data-experience-id', 'zhepin');
    expect(within(entries[1]).getByRole('heading', { name: '茶具' })).toBe(teaHeadings[0]);
    expect(within(entries[1]).getByRole('group', { name: '茶具媒体卡组' })
      .querySelectorAll('[data-project-media-card]')).toHaveLength(3);
    expect(experience.querySelectorAll('[data-experience-project]')).toHaveLength(2);
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

  it('uses the one shared player for AI work and restores the exact card button on close', async () => {
    render(<App />);
    const opener = screen.getByRole('button', { name: '打开时间线｜AI 剧情样片全屏预览' });

    fireEvent.click(opener);

    const dialogs = screen.getAllByRole('dialog', { name: '播放作品：时间线｜AI 剧情样片' });
    expect(dialogs).toHaveLength(1);
    expect(dialogs[0].querySelector('video')).toHaveAttribute(
      'src',
      '/media/ai-video/landscape-full-h264.mp4',
    );
    expect(document.body.style.position).toBe('fixed');

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
    expect(document.body.style.position).toBe('');
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

  it('resolves Hero media through the configured deployment media base', () => {
    vi.stubEnv('VITE_MEDIA_BASE_URL', 'https://cdn.example.com/portfolio');
    render(<App />);

    expect(useScrollVideoMock).toHaveBeenCalledWith(expect.objectContaining({
      poster: 'https://cdn.example.com/portfolio/hero/hero-poster.webp',
      source: 'https://cdn.example.com/portfolio/hero/hero-scroll.mp4',
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
