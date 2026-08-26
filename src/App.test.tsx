import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./hooks/useLenis', () => ({ useLenis: vi.fn() }));
const useScrollVideoMock = vi.hoisted(() => vi.fn());
vi.mock('./hooks/useScrollVideo', () => ({ useScrollVideo: useScrollVideoMock }));

describe('App', () => {
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
        muted: true,
        playsInline: true,
        poster,
        src: source ?? undefined,
      },
    }));
  });

  it('renders the approved single-screen hero without the works index', () => {
    const { container } = render(<App />);

    expect(screen.getByRole('heading', { name: '杨玉峰' })).toBeInTheDocument();
    expect(screen.queryByText('SELECTED WORK / 重点作品')).not.toBeInTheDocument();
    expect(container.querySelectorAll('main > section')).toHaveLength(1);
  });

  it('configures the ignored Hero video while retaining the committed portrait fallback', () => {
    const { container } = render(<App />);
    const portrait = screen.getByRole('img', { name: '杨玉峰个人肖像' });
    const video = container.querySelector('video');

    expect(portrait).toHaveAttribute('src', '/assets/hero/hero-candidate-03.webp');
    expect(video).toHaveAttribute('poster', '/media/hero/hero-poster.webp');
    expect(useScrollVideoMock).toHaveBeenCalledWith(expect.objectContaining({
      source: '/media/hero/hero-scroll.mp4',
    }));
  });
});
