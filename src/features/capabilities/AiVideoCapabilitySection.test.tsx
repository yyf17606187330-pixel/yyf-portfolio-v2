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
  it('renders four rounded-card slots without inventing media requests', () => {
    const { container } = render(
      <AiVideoCapabilitySection items={aiVideoCapabilityItems} onOpenProject={vi.fn()} />,
    );
    const section = screen.getByRole('region', { name: 'AI 视频能力' });

    expect(section).toHaveAttribute('id', 'ai-video');
    expect(within(section).getByRole('heading', { name: '横竖两种画幅独立 AI 视频能力' }))
      .toBeInTheDocument();
    expect(section.querySelectorAll('[data-ai-video-card]')).toHaveLength(4);
    expect(section.querySelector('[data-ai-video-card="ai-video-landscape"] .ai-video-capability__media'))
      .toHaveAttribute('data-media-ratio', '16/9');
    expect(section.querySelector('[data-ai-video-card="ai-video-landscape"] img'))
      .toHaveAttribute('src', '/media/ai-video/landscape-poster.webp');
    expect(section.querySelector('[data-ai-video-card="ai-video-portrait"] .ai-video-capability__media'))
      .toHaveAttribute('data-media-ratio', '9/16');
    expect(section.querySelector('[data-ai-video-card="ai-video-reserved-03"] .ai-video-capability__media'))
      .toHaveAttribute('data-media-ratio', 'pending');
    expect(section.querySelector('[data-ai-video-card="ai-video-reserved-04"] .ai-video-capability__media'))
      .not.toHaveAttribute('style');
    expect(container.querySelectorAll('video')).toHaveLength(0);
    expect(section).toHaveTextContent('AI 视频媒体待接入');
    expect(section).toHaveTextContent('FORMAT TBD');
  });

  it('keeps the supplied titles and format labels visible for later media replacement', () => {
    render(<AiVideoCapabilitySection items={aiVideoCapabilityItems} onOpenProject={vi.fn()} />);

    expect(screen.getByRole('heading', { name: '横版 AI 视频' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '竖版复古拼贴' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '待接入 AI 作品 03' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '待接入 AI 作品 04' })).toBeInTheDocument();
    expect(screen.getByText('AI VIDEO / LANDSCAPE')).toBeInTheDocument();
    expect(screen.getByText('AI VIDEO / PORTRAIT')).toBeInTheDocument();
  });

  it('mounts only the hovered preview and stops it when the pointer leaves', () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    const items = aiVideoCapabilityItems.map((item, index) => (
      index < 2 ? { ...item, previewSrc: `ai-preview-${index}.mp4` } : item
    ));
    const { container } = render(
      <AiVideoCapabilitySection items={items} onOpenProject={vi.fn()} />,
    );
    const cards = [...container.querySelectorAll<HTMLElement>('[data-ai-video-card]')];

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

    const openButton = screen.getByRole('button', { name: '打开横版 AI 视频全屏预览' });
    fireEvent.click(openButton);

    expect(onOpenProject).toHaveBeenCalledTimes(1);
    expect(onOpenProject).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '横版 AI 视频',
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
    const openButton = screen.getByRole('button', { name: '打开横版 AI 视频全屏预览' });
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
