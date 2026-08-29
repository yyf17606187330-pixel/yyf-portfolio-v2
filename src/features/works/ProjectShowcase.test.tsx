import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { waterPurifierCopy, waterPurifierProject } from '../../content/showcase';
import { ProjectShowcase } from './ProjectShowcase';

describe('ProjectShowcase', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('presents a substantial, explicitly temporary editorial narrative with the real responsibilities', () => {
    render(
      <ProjectShowcase
        {...waterPurifierCopy}
        project={waterPurifierProject}
        playerOpen={false}
        onOpenProject={vi.fn()}
      />,
    );

    expect(screen.getByRole('region', { name: '精选作品' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '净水器' })).toBeInTheDocument();
    expect(screen.getByText('排版占位 · 正式文案待替换')).toBeInTheDocument();

    const narrative = screen.getByLabelText('作品说明占位文案');
    expect(narrative.textContent?.length).toBeGreaterThanOrEqual(350);
    expect(narrative.querySelectorAll('p')).toHaveLength(4);
    expect(screen.getAllByText(/排版占位 0[1-4]｜待替换/)).toHaveLength(4);

    const responsibilities = screen.getByRole('list', { name: '本项目职责' });
    expect(responsibilities).toHaveTextContent('策划');
    expect(responsibilities).toHaveTextContent('编导');
    expect(responsibilities).toHaveTextContent('拍摄');
    expect(responsibilities).toHaveTextContent('剪辑');
    expect(responsibilities).toHaveTextContent('调色');
    expect(responsibilities).toHaveTextContent('账号运营');
  });

  it('keeps the real 9:16 preview clickable without loading full media early', () => {
    const onOpenProject = vi.fn();
    const { container } = render(
      <ProjectShowcase
        {...waterPurifierCopy}
        project={waterPurifierProject}
        playerOpen={false}
        onOpenProject={onOpenProject}
      />,
    );
    const playButton = screen.getByRole('button', { name: '播放净水器完整作品' });

    expect(container.querySelector('.lazy-preview')).toHaveStyle({ aspectRatio: '9/16' });
    expect(container.querySelector('video[src*="full-"]')).not.toBeInTheDocument();
    expect(playButton).toHaveAttribute('aria-describedby', 'water-purifier-description');
    expect(screen.getByText(waterPurifierCopy.description)).toHaveAttribute(
      'id',
      'water-purifier-description',
    );
    fireEvent.click(playButton);
    expect(onOpenProject).toHaveBeenCalledWith(waterPurifierProject, playButton);
  });

  it('keeps the editorial lockup italic and the seamless ticker hidden from assistive tech', () => {
    const { container } = render(
      <ProjectShowcase
        {...waterPurifierCopy}
        project={waterPurifierProject}
        playerOpen={false}
        onOpenProject={vi.fn()}
      />,
    );

    const statement = screen.getByText(waterPurifierCopy.description);
    expect(statement.tagName).toBe('EM');

    const heading = screen.getByRole('heading', { level: 2, name: '净水器' });
    expect(heading).toHaveTextContent('净水器项目');

    const semanticMeta = screen.getByLabelText('作品信息');
    expect(semanticMeta).toHaveTextContent('COMMERCIAL FILM / 商业短视频');
    expect(semanticMeta).toHaveTextContent('01:16');
    expect(screen.getAllByRole('list', { name: '本项目职责' })).toHaveLength(1);

    const ticker = container.querySelector('.project-showcase__ticker');
    expect(ticker).toHaveAttribute('aria-hidden', 'true');
    expect(ticker?.querySelectorAll('.project-showcase__ticker-set')).toHaveLength(2);
  });

  it('organizes the project as a dated transition rail, process timeline, and factual vitals', () => {
    render(
      <ProjectShowcase
        {...waterPurifierCopy}
        project={waterPurifierProject}
        playerOpen={false}
        onOpenProject={vi.fn()}
      />,
    );

    const transition = screen.getByLabelText('作品区导览');
    expect(transition).toHaveTextContent("NOW · AUG '26");
    expect(transition).toHaveTextContent('净水器项目');
    expect(transition).toHaveTextContent('9 / 16');

    const process = screen.getByRole('list', { name: '创作过程占位' });
    expect(process.children).toHaveLength(4);
    expect(process).toHaveTextContent('01 / 项目背景');
    expect(process).toHaveTextContent('04 / 职责复盘');

    const vitals = screen.getByLabelText('项目关键信息');
    expect(vitals).toHaveTextContent("VOL. 01 · '26");
    expect(vitals).toHaveTextContent('COMMERCIAL FILM / 商业短视频');
    expect(vitals).toHaveTextContent('9 / 16 · 01:16');
    expect(vitals).toHaveTextContent('正式文案待替换');
  });

  it('presents the approved four-film deck in source order without loading any full film early', () => {
    const onOpenProject = vi.fn();
    const { container } = render(
      <ProjectShowcase
        {...waterPurifierCopy}
        project={waterPurifierProject}
        playerOpen={false}
        onOpenProject={onOpenProject}
      />,
    );

    const longFilms = screen.getByRole('region', { name: '长片作品' });
    const cards = [...longFilms.querySelectorAll<HTMLElement>('[data-film-card]')];
    expect(cards.map((card) => card.dataset.filmCard)).toEqual([
      'travel-vlog',
      'narrative-film',
      'dark-room',
      'film-2025-06-15',
    ]);
    expect(within(longFilms).getByRole('heading', {
      level: 3,
      name: '旅拍 Vlog',
    })).toBeInTheDocument();
    expect(longFilms).not.toHaveTextContent(/待补|待确认|占位|内部说明/);

    const previews = longFilms.querySelectorAll('.lazy-preview');
    expect(previews).toHaveLength(4);
    expect(previews[0]).toHaveStyle({ aspectRatio: '2/1' });
    expect(previews[1]).toHaveStyle({ aspectRatio: '16/9' });
    expect(previews[2]).toHaveStyle({ aspectRatio: '16/9' });
    expect(previews[3]).toHaveStyle({ aspectRatio: '16/9' });
    expect(container.querySelector('video[src*="full-hevc"]')).not.toBeInTheDocument();

    const travelButton = within(longFilms).getByRole('button', { name: '播放旅拍 Vlog完整作品' });
    fireEvent.click(travelButton);
    expect(onOpenProject).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'travel-vlog',
        aspectRatio: '2/1',
        roles: ['剪辑', '调色', '配乐', '人声'],
      }),
      travelButton,
    );
  });

  it('introduces the four-film chapter without exposing internal editorial placeholders', () => {
    const { container } = render(
      <ProjectShowcase
        {...waterPurifierCopy}
        project={waterPurifierProject}
        playerOpen={false}
        onOpenProject={vi.fn()}
      />,
    );

    const longFilms = screen.getByRole('region', { name: '长片作品' });
    expect(within(longFilms).getByRole('heading', {
      level: 2,
      name: '两种影像练习 关于行走与叙事',
    })).toBeInTheDocument();
    expect(longFilms).not.toHaveTextContent(/排版占位|待补|待替换|待确认|当前不代填/);
    expect(container.querySelector('.project-showcase__eyebrow p')).toHaveTextContent(
      '02.01 / SELECTED WORK',
    );
    expect(container.querySelector('.long-form-projects__heading > span')).toHaveTextContent(
      '02.02—02.05',
    );
    expect(longFilms).toHaveTextContent('02.02 / LONG-FORM');
    expect(longFilms).toHaveTextContent('04:20');
    expect(longFilms).toHaveTextContent('剪辑 · 调色 · 配乐 · 人声');
  });

  it('reveals decorative rules once when each rule enters the viewport', () => {
    const observed = new Map<Element, IntersectionObserverCallback>();
    const observedOptions = new Map<Element, IntersectionObserverInit>();
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn((callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
        return {
          observe: vi.fn((element: Element) => {
            observed.set(element, callback);
            observedOptions.set(element, options ?? {});
          }),
          disconnect: vi.fn(),
          unobserve: vi.fn(),
          takeRecords: vi.fn(),
          root: null,
          rootMargin: '',
          thresholds: [],
        };
      }),
    );

    const { container } = render(
      <ProjectShowcase
        {...waterPurifierCopy}
        project={waterPurifierProject}
        playerOpen={false}
        onOpenProject={vi.fn()}
      />,
    );
    const rules = [...container.querySelectorAll('[data-reveal-rule]')];
    expect(rules).toHaveLength(2);
    expect(rules.every((rule) => rule.getAttribute('data-revealed') === 'false')).toBe(true);
    expect(rules.map((rule) => observedOptions.get(rule))).toEqual([
      { rootMargin: '0px 0px -16% 0px', threshold: 0 },
      { rootMargin: '0px 0px -16% 0px', threshold: 0 },
    ]);

    const nowRule = rules[0];
    act(() => {
      observed.get(nowRule)?.(
        [{ isIntersecting: true, target: nowRule } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(nowRule).toHaveAttribute('data-revealed', 'true');

    act(() => {
      observed.get(nowRule)?.(
        [{ isIntersecting: false, target: nowRule } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(nowRule).toHaveAttribute('data-revealed', 'true');
  });

  it('shows decorative rules in their final state when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(
      <ProjectShowcase
        {...waterPurifierCopy}
        project={waterPurifierProject}
        playerOpen={false}
        onOpenProject={vi.fn()}
      />,
    );

    const rules = [...container.querySelectorAll('[data-reveal-rule]')];
    expect(rules).toHaveLength(2);
    expect(rules.every((rule) => rule.getAttribute('data-revealed') === 'true')).toBe(true);
  });
});
