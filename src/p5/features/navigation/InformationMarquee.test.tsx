import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InformationMarquee } from './InformationMarquee';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('InformationMarquee', () => {
  it('keeps one accessible copy and preserves manual pause across visibility and player changes', () => {
    let observerCallback: IntersectionObserverCallback;
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      observerCallback = callback;
      return { observe: vi.fn(), disconnect };
    }));
    const props = { label: '作品区导览', items: ['影像作品', '调色作品'] };
    const { rerender, unmount } = render(<InformationMarquee {...props} />);
    const region = screen.getByRole('region', { name: '作品区导览' });
    expect(within(region).getAllByRole('list')).toHaveLength(1);
    expect(within(region).getAllByRole('listitem')).toHaveLength(2);
    expect(region).toHaveAttribute('data-paused', 'true');
    const enter = (visible: boolean) => act(() => observerCallback(
      [{
        isIntersecting: visible, target: region, intersectionRatio: visible ? 1 : 0,
        boundingClientRect: region.getBoundingClientRect(), intersectionRect: region.getBoundingClientRect(),
        rootBounds: null, time: 0,
      }],
      {} as IntersectionObserver,
    ));
    enter(true);
    expect(region).toHaveAttribute('data-paused', 'false');
    fireEvent.click(screen.getByRole('button', { name: '暂停作品区导览轮播' }));
    enter(false);
    enter(true);
    expect(region).toHaveAttribute('data-paused', 'true');
    expect(screen.getByRole('button', { name: '继续作品区导览轮播' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '继续作品区导览轮播' }));
    rerender(<InformationMarquee {...props} paused />);
    expect(region).toHaveAttribute('data-paused', 'true');
    rerender(<InformationMarquee {...props} />);
    expect(region).toHaveAttribute('data-paused', 'false');
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    fireEvent(document, new Event('visibilitychange'));
    expect(region).toHaveAttribute('data-paused', 'true');
    visibility.mockReturnValue('visible');
    fireEvent(document, new Event('visibilitychange'));
    expect(region).toHaveAttribute('data-paused', 'false');
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('provides all information in static mode when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }));
    render(<InformationMarquee items={['影像作品', '调色作品']} label="作品区导览" />);
    const region = screen.getByRole('region', { name: '作品区导览' });
    expect(region).toHaveAttribute('data-reduced-motion', 'true');
    expect(region).toHaveAttribute('data-paused', 'true');
    expect(within(region).getAllByRole('listitem').map((item) => item.textContent))
      .toEqual(['影像作品', '调色作品']);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
