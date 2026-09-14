import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { aiVideoCapabilityItems } from '../../content/aiVideoCapability';
import { AiVideoCapabilitySection } from './AiVideoCapabilitySection';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('AiVideoCapabilitySection', () => {
  it('groups the real AI projects and delivery work without attaching unrelated media', () => {
    const { container } = render(
      <AiVideoCapabilitySection items={aiVideoCapabilityItems} onOpenProject={vi.fn()} />,
    );
    const section = screen.getByRole('region', { name: 'AI 创作与内容生产' });
    expect(section).toHaveAttribute('id', 'ai-video');
    expect(within(section).getByRole('heading', { name: 'AI 创作与内容生产' })).toBeInTheDocument();
    expect(section.querySelectorAll('[data-ai-video-card]')).toHaveLength(3);
    expect(within(section).getByRole('heading', { name: '图片制作与资料交付' })).toBeInTheDocument();
    expect(within(section).getAllByRole('button')).toHaveLength(3);
    const sports = within(section).getByRole('article', { name: '产品 TVC｜运动场景样片' });
    expect(sports).toHaveTextContent('滑雪、骑行、攀岩');
    expect(sports.querySelector('img')).toHaveAttribute('src', '/media/ai-video/ski-poster.webp');
    expect(sports.querySelector('.ai-video-capability__media')).toHaveStyle({ aspectRatio: '1472/632' });
    expect(sports).not.toHaveTextContent('完整成片');
    expect(within(section).getByRole('img', { name: '时间线｜AI 剧情样片封面' }))
      .toHaveAttribute('src', '/media/ai-video/landscape-poster.webp');
    expect(section).not.toHaveTextContent(/待接入|FORMAT TBD|预留/);
    expect(container.querySelectorAll('video')).toHaveLength(0);
  });
  it('retains confirmed project text and delivery work when their media is not yet supplied', () => {
    const { container } = render(
      <AiVideoCapabilitySection items={aiVideoCapabilityItems.slice(1).map((item) => ({
        ...item, poster: null, previewSrc: null, fullSrc: null, aspectRatio: null,
      }))} onOpenProject={vi.fn()} />,
    );
    expect(screen.getByRole('region', { name: 'AI 创作与内容生产' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '产品 TVC｜运动场景样片' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '复古拼贴影像' })).toBeInTheDocument();
    expect(container.querySelector('img, video, button')).toBeNull();
  });
  it('mounts only the hovered preview and stops it when the pointer leaves', () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    const items = aiVideoCapabilityItems.map((item, index) => (
      index < 2 ? { ...item, poster: `ai-poster-${index}.webp`, previewSrc: `ai-preview-${index}.mp4`, fullSrc: `ai-full-${index}.mp4` } : item
    ));
    const { container } = render(
      <AiVideoCapabilitySection items={items} onOpenProject={vi.fn()} />,
    );
    const cards = [...container.querySelectorAll<HTMLElement>('[data-ai-video-card][data-has-preview="true"]')];

    expect(container.querySelectorAll('video')).toHaveLength(0);

    fireEvent.pointerEnter(cards[0], { pointerType: 'mouse' });
    expect(container.querySelectorAll('video')).toHaveLength(1);
    expect(play).toHaveBeenCalledTimes(1);

    fireEvent.pointerEnter(cards[1], { pointerType: 'mouse' });
    expect(container.querySelectorAll('video')).toHaveLength(1);
    expect(pause).toHaveBeenCalled();
    expect(play).toHaveBeenCalledTimes(2);

    fireEvent.pointerLeave(cards[1], { pointerType: 'mouse' });
    expect(container.querySelectorAll('video')).toHaveLength(0);
    expect(pause).toHaveBeenCalled();
  });

  it('stops the hovered preview while a global overlay obscures the page', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);
    const { container, rerender } = render(
      <AiVideoCapabilitySection
        items={aiVideoCapabilityItems}
        onOpenProject={vi.fn()}
        paused={false}
      />,
    );
    const card = container.querySelector<HTMLElement>(
      '[data-ai-video-card="ai-video-landscape"]',
    )!;

    fireEvent.pointerEnter(card, { pointerType: 'mouse' });
    expect(card.querySelector('video')).toBeInTheDocument();

    rerender(
      <AiVideoCapabilitySection
        items={aiVideoCapabilityItems}
        onOpenProject={vi.fn()}
        paused
      />,
    );

    expect(card.querySelector('video')).not.toBeInTheDocument();
    expect(pause).toHaveBeenCalled();
    fireEvent.pointerEnter(card, { pointerType: 'mouse' });
    expect(card.querySelector('video')).not.toBeInTheDocument();
  });

  it('delegates full-screen playback to the shared app player with separate preview and full media', () => {
    const onOpenProject = vi.fn();
    const items = aiVideoCapabilityItems.map((item, index) => (
      index === 0
        ? {
          ...item,
          previewSrc: 'ai-preview-landscape.mp4',
          fullSrc: 'ai-full-landscape.mp4',
        }
        : item
    ));
    render(<AiVideoCapabilitySection items={items} onOpenProject={onOpenProject} />);

    const openButton = screen.getByRole('button', { name: '打开时间线｜AI 剧情样片全屏预览' });
    fireEvent.click(openButton);

    expect(onOpenProject).toHaveBeenCalledTimes(1);
    expect(onOpenProject).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '时间线｜AI 剧情样片',
        previewSrc: 'ai-preview-landscape.mp4',
        fullSrc: 'ai-full-landscape.mp4',
      }),
      openButton,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens a full-only work without mounting a hover preview', () => {
    const onOpenProject = vi.fn();
    const items = aiVideoCapabilityItems.map((item, index) => (
      index === 0
        ? { ...item, previewSrc: null, fullSrc: 'ai-full-only.mp4' }
        : item
    ));
    const { container } = render(
      <AiVideoCapabilitySection items={items} onOpenProject={onOpenProject} />,
    );
    const card = container.querySelector<HTMLElement>(
      '[data-ai-video-card="ai-video-landscape"]',
    )!;

    fireEvent.pointerEnter(card, { pointerType: 'mouse' });
    expect(card.querySelector('video')).not.toBeInTheDocument();
    const openButton = screen.getByRole('button', { name: '打开时间线｜AI 剧情样片全屏预览' });
    fireEvent.click(openButton);

    expect(onOpenProject).toHaveBeenCalledWith(
      expect.objectContaining({ fullSrc: 'ai-full-only.mp4', previewSrc: '' }),
      openButton,
    );
  });

  it('resolves poster and hover preview through the configured media base', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.stubEnv('VITE_MEDIA_BASE_URL', 'https://cdn.example.com/portfolio');
    const { container } = render(
      <AiVideoCapabilitySection items={aiVideoCapabilityItems} onOpenProject={vi.fn()} />,
    );
    const card = container.querySelector<HTMLElement>('[data-ai-video-card="ai-video-landscape"]');

    expect(card?.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/portfolio/ai-video/landscape-poster.webp',
    );
    fireEvent.pointerEnter(card as HTMLElement, { pointerType: 'mouse' });
    expect(card?.querySelector('video')).toHaveAttribute(
      'src',
      'https://cdn.example.com/portfolio/ai-video/landscape-preview-h264.mp4',
    );
  });
});
