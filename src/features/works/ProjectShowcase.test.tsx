import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProjectShowcase } from './ProjectShowcase';

describe('ProjectShowcase', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('presents two independent four-film decks in source order without loading any full film early', () => {
    const onOpenProject = vi.fn();
    const { container } = render(
      <ProjectShowcase playerOpen={false} onOpenProject={onOpenProject} />,
    );

    const showcase = screen.getByRole('region', { name: '影像与调色作品' });
    expect(showcase).toHaveAttribute('id', 'works');
    expect(within(showcase).queryByRole('heading', { name: '净水器' })).not.toBeInTheDocument();

    const longFilms = within(showcase).getByRole('region', { name: '长片作品' });
    const decks = [...longFilms.querySelectorAll<HTMLElement>('[data-film-deck]')];
    expect(decks).toHaveLength(2);
    expect([...decks[0].querySelectorAll<HTMLElement>('[data-film-card]')]
      .map((card) => card.dataset.filmCard)).toEqual([
      'travel-vlog',
      'narrative-film',
      'dark-room',
      'film-2025-06-15',
    ]);
    expect([...decks[1].querySelectorAll<HTMLElement>('[data-film-card]')]
      .map((card) => card.dataset.filmCard)).toEqual([
      'grading-skate-workshop',
      'grading-percussion',
      'grading-dance',
      'grading-winter-aerial',
    ]);
    expect(within(longFilms).getByRole('heading', {
      level: 3,
      name: '旅拍 Vlog',
    })).toBeInTheDocument();
    expect(longFilms).not.toHaveTextContent(/待补|待确认|占位|内部说明/);

    const previews = longFilms.querySelectorAll('.lazy-preview');
    expect(previews).toHaveLength(8);
    expect(previews[0]).toHaveStyle({ aspectRatio: '2/1' });
    for (const preview of [...previews].slice(1)) {
      expect(preview).toHaveStyle({ aspectRatio: '16/9' });
    }
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

  it('introduces both selected-work groups without exposing internal editorial placeholders', () => {
    render(<ProjectShowcase playerOpen={false} onOpenProject={vi.fn()} />);

    const guide = screen.getByRole('region', { name: '作品区导览' });
    expect(guide).toHaveTextContent('两组精选作品');
    expect(guide).toHaveTextContent('8 项作品');
    expect(guide).not.toHaveTextContent('净水器');

    const longFilms = screen.getByRole('region', { name: '长片作品' });
    expect(within(longFilms).getByRole('heading', {
      level: 2,
      name: '影像作品与调色作品',
    })).toBeInTheDocument();
    expect(longFilms).not.toHaveTextContent(/排版占位|待补|待替换|待确认|当前不代填/);
    expect(longFilms.querySelector('.long-form-projects__heading > span')).toHaveTextContent(
      '02.01—02.02',
    );
    expect(longFilms).toHaveTextContent('02.01 / LONG-FORM');
    expect(longFilms).toHaveTextContent('02.02 / COLOR GRADING');
    expect(longFilms).toHaveTextContent('04:20');
    expect(longFilms).toHaveTextContent('剪辑 · 调色 · 配乐 · 人声');
  });

  it('reveals the selected-work decorative rule once when it enters the viewport', () => {
    const observed = new Map<Element, IntersectionObserverCallback>();
    const observedOptions = new Map<Element, IntersectionObserverInit>();
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn((callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => ({
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
      })),
    );

    const { container } = render(
      <ProjectShowcase playerOpen={false} onOpenProject={vi.fn()} />,
    );
    const rules = [...container.querySelectorAll('[data-reveal-rule]')];
    expect(rules).toHaveLength(1);
    expect(rules[0]).toHaveAttribute('data-revealed', 'false');
    expect(observedOptions.get(rules[0])).toEqual({
      rootMargin: '0px 0px -16% 0px',
      threshold: 0,
    });

    act(() => {
      observed.get(rules[0])?.(
        [{ isIntersecting: true, target: rules[0] } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(rules[0]).toHaveAttribute('data-revealed', 'true');

    act(() => {
      observed.get(rules[0])?.(
        [{ isIntersecting: false, target: rules[0] } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(rules[0]).toHaveAttribute('data-revealed', 'true');
  });

  it('shows the selected-work rule in its final state when reduced motion is requested', () => {
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
      <ProjectShowcase playerOpen={false} onOpenProject={vi.fn()} />,
    );

    const rules = [...container.querySelectorAll('[data-reveal-rule]')];
    expect(rules).toHaveLength(1);
    for (const rule of rules) {
      expect(rule).toHaveAttribute('data-revealed', 'true');
    }
  });
});
