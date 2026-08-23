import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { projects } from '../../content/projects';
import type { Project } from '../../types/portfolio';
import { LazyPreview } from './LazyPreview';
import { WorkIndex } from './WorkIndex';

const projectFixtures: Project[] = [
  {
    slug: 'film-a',
    title: '影像项目 A',
    category: 'film',
    year: '2026',
    client: '客户 A',
    roles: ['导演'],
    featured: false,
    order: 1,
    poster: '',
    previewSrc: '',
    fullSrc: '',
    aspectRatio: '16/9',
  },
  {
    slug: 'film-b',
    title: '影像项目 B',
    category: 'film',
    year: '2025',
    client: '客户 B',
    roles: ['剪辑'],
    featured: false,
    order: 2,
    poster: '',
    previewSrc: '',
    fullSrc: '',
    aspectRatio: '16/9',
  },
  {
    slug: 'ai-a',
    title: 'AI 视频项目 A',
    category: 'ai-video',
    year: '2026',
    client: '客户 C',
    roles: ['AI 视觉'],
    featured: false,
    order: 3,
    poster: '',
    previewSrc: '',
    fullSrc: '',
    aspectRatio: '9/16',
  },
  {
    slug: 'photo-a',
    title: '摄影项目 A',
    category: 'photography',
    year: '2024',
    client: '客户 D',
    roles: ['摄影'],
    featured: false,
    order: 4,
    poster: '',
    previewSrc: '',
    fullSrc: '',
    aspectRatio: '4/5',
  },
  {
    slug: 'interactive-a',
    title: '设计与交互项目 A',
    category: 'design-interactive',
    year: '2026',
    client: '客户 E',
    roles: ['交互'],
    featured: false,
    order: 5,
    poster: '',
    previewSrc: '',
    fullSrc: '',
    aspectRatio: '1/1',
  },
];

describe('WorkIndex', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('shows exactly the nine additional index projects with index-only counts and filtering', () => {
    const onOpenProject = vi.fn();
    render(<WorkIndex projects={projects} onOpenProject={onOpenProject} />);

    expect(screen.getByRole('heading', { name: 'ADDITIONAL WORKS' })).toBeInTheDocument();
    expect(screen.getByText('索引中显示 9 项')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^打开项目：/ })).toHaveLength(9);
    expect(screen.queryByRole('button', { name: '打开项目：待补充影像项目 01' })).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'ALL / 全部 9' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'FILM / 影像 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AI VIDEO / AI视频 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PHOTOGRAPHY / 摄影 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'DESIGN + INTERACTIVE / 设计与交互 3' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'FILM / 影像 2' }));

    expect(screen.getByText('索引中显示 2 项')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '打开项目：待补充影像项目 02' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '打开项目：待补充影像项目 03' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '打开项目：待补充 AI 视频项目 02' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '打开项目：待补充影像项目 02' }));
    expect(onOpenProject).toHaveBeenCalledWith(projects[3], expect.any(HTMLElement));
  });

  it('does not attach a preview source until its frame approaches the viewport', () => {
    let intersectionCallback: IntersectionObserverCallback | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn((callback: IntersectionObserverCallback) => {
        intersectionCallback = callback;
        return { observe, disconnect, unobserve: vi.fn(), takeRecords: vi.fn(), root: null, rootMargin: '', thresholds: [] };
      }),
    );

    const previewProject = {
      ...projectFixtures[0],
      poster: 'posters/film-a.webp',
      previewSrc: 'previews/film-a.mp4',
    };
    const { container } = render(<LazyPreview project={previewProject} />);

    expect(container.querySelector('img')).toHaveAttribute('src', '/media/posters/film-a.webp');
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(observe).toHaveBeenCalledOnce();

    const frame = container.firstElementChild as Element;
    act(() => {
      intersectionCallback?.(
        [{ isIntersecting: true, target: frame } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(container.querySelector('video')).toHaveAttribute('src', '/media/previews/film-a.mp4');
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('renders an explicit placeholder without empty media requests when preview media is missing', () => {
    const { container } = render(<LazyPreview project={projectFixtures[0]} />);

    expect(within(container).getByText('作品封面 / 预览待替换')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(container.querySelector('[src=""]')).not.toBeInTheDocument();
  });
});
