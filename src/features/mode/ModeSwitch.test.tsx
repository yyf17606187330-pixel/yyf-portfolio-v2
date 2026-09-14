import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModeSwitch } from './ModeSwitch';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); sessionStorage.clear(); });

function motion(reduced = false) {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
}

describe('portfolio mode navigation', () => {
  it('offers real links in both directions without changing the default page', () => {
    motion();
    const { rerender } = render(<ModeSwitch mode="minimal" />);
    expect(screen.getByRole('link', { name: '解锁隐藏模式' })).toHaveAttribute('href', '/p5/');
    rerender(<ModeSwitch mode="p5" />);
    expect(screen.getByRole('link', { name: '返回简约模式' })).toHaveAttribute('href', '/');
  });

  it('covers the current page before navigating and ignores repeat clicks', () => {
    motion(); vi.useFakeTimers();
    const navigate = vi.fn();
    render(<ModeSwitch mode="minimal" navigate={navigate} />);
    const link = screen.getByRole('link', { name: '解锁隐藏模式' });
    fireEvent.click(link); fireEvent.click(link);
    expect(screen.getByRole('status')).toHaveTextContent('隐藏模式');
    expect(navigate).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(450));
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/p5/');
  });

  it('skips motion for reduced motion preferences', () => {
    motion(true);
    const navigate = vi.fn();
    render(<ModeSwitch mode="p5" navigate={navigate} />);
    fireEvent.click(screen.getByRole('link', { name: '返回简约模式' }));
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/');
  });

  it('preserves modified clicks and cancels delayed navigation on unmount', () => {
    motion(); vi.useFakeTimers();
    const navigate = vi.fn();
    const { unmount } = render(<ModeSwitch mode="minimal" navigate={navigate} />);
    const link = screen.getByRole('link', { name: '解锁隐藏模式' });
    document.addEventListener('click', event => {
      expect(event.defaultPrevented).toBe(false);
      event.preventDefault(); // jsdom cannot open another browser tab.
    }, { once: true });
    fireEvent.click(link, { ctrlKey: true });
    expect(navigate).not.toHaveBeenCalled();
    fireEvent.click(link);
    unmount();
    act(() => vi.advanceTimersByTime(1000));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('removes the trigger while media or intro overlays are open', () => {
    motion();
    render(<ModeSwitch mode="minimal" hidden />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('reveals the destination and leaves history-restored pages usable', () => {
    motion(); vi.useFakeTimers();
    sessionStorage.setItem('yyf-mode-transition', JSON.stringify({ target: '/p5/', time: Date.now() }));
    const navigate = vi.fn();
    render(<ModeSwitch mode="p5" navigate={navigate} />);
    expect(screen.getByRole('status')).toHaveTextContent('隐藏模式');
    act(() => vi.advanceTimersByTime(650));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: '返回简约模式' }));
    act(() => vi.advanceTimersByTime(450));
    const restored = new Event('pageshow');
    Object.defineProperty(restored, 'persisted', { value: true });
    fireEvent(window, restored);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: '返回简约模式' }));
    act(() => vi.advanceTimersByTime(450));
    expect(navigate).toHaveBeenCalledTimes(2);
  });
});
