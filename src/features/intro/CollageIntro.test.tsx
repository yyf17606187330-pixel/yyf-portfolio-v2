import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CollageIntro } from './CollageIntro';
import { INTRO_SESSION_KEY, rememberIntro, shouldShowIntro } from './introSession';

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  sessionStorage.clear();
  window.history.replaceState(null, '', '/');
  vi.stubGlobal('matchMedia', () => ({
    matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  sessionStorage.clear();
  window.history.replaceState(null, '', '/');
});

describe('CollageIntro', () => {
  it('never waits indefinitely for a stalled video or hero poster, including StrictMode', async () => {
    const complete = vi.fn();
    const { unmount } = render(<StrictMode><CollageIntro heroPoster="/missing.webp" onComplete={complete} /></StrictMode>);
    expect(document.body.style.position).toBe('fixed');
    expect(document.querySelector('.collage-intro video')).toBeNull();
    expect(screen.getByRole('heading', { name: 'HELLO' })).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(5000); });
    await act(async () => { vi.advanceTimersByTime(1050); });
    expect(complete).toHaveBeenCalledOnce();
    unmount();
    expect(document.body.style.position).toBe('');
    await act(async () => { vi.advanceTimersByTime(10000); });
    expect(complete).toHaveBeenCalledOnce();
  });

  it('uses actual media readiness and a short intro before entering, even if the poster fails', async () => {
    const poster = document.createElement('img');
    vi.stubGlobal('Image', vi.fn(function () { return poster; }));
    const complete = vi.fn();
    render(<CollageIntro heroPoster="/hero.webp" onComplete={complete} />);
    fireEvent.error(poster);
    await act(async () => { vi.advanceTimersByTime(2399); });
    expect(screen.getByRole('status')).toHaveTextContent('正在准备首页');
    await act(async () => { vi.advanceTimersByTime(1); });
    expect(screen.getByRole('status')).toHaveTextContent('开始浏览');
    await act(async () => { vi.advanceTimersByTime(1050); });
    expect(complete).toHaveBeenCalledOnce();
  });

  it('supports Escape, keeps focus on the skip control and cancels work on unmount', async () => {
    const complete = vi.fn();
    const { unmount } = render(<CollageIntro heroPoster="/hero.webp" onComplete={complete} />);
    const skip = screen.getByRole('button', { name: '跳过片头' });
    expect(skip).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(skip).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    await act(async () => { vi.advanceTimersByTime(1050); });
    expect(complete).toHaveBeenCalledOnce();
    unmount();
    expect(document.body.style.overflow).toBe('');
    await act(async () => { vi.advanceTimersByTime(10000); });
    expect(complete).toHaveBeenCalledOnce();
  });

  it('keeps the opening up until the existing Hero video has its first frame ready', async () => {
    const poster = document.createElement('img');
    vi.stubGlobal('Image', vi.fn(function () { return poster; }));
    const complete = vi.fn();
    const { rerender } = render(<CollageIntro heroPoster="/hero.webp" heroVideoReady={false} onComplete={complete} />);
    fireEvent.load(poster);
    await act(async () => { vi.advanceTimersByTime(2400); });
    expect(screen.getByRole('status')).toHaveTextContent('正在准备首页');
    expect(complete).not.toHaveBeenCalled();
    rerender(<CollageIntro heroPoster="/hero.webp" heroVideoReady onComplete={complete} />);
    await act(async () => { vi.advanceTimersByTime(1050); });
    expect(complete).toHaveBeenCalledOnce();
  });

  it('hands off text during the lift while keeping scroll lock until completion', async () => {
    const reveal = vi.fn();
    const complete = vi.fn();
    const { unmount } = render(<CollageIntro heroPoster="/hero.webp" onReveal={reveal} onComplete={complete} />);
    fireEvent.click(screen.getByRole('button', { name: '跳过片头' }));
    await act(async () => { vi.advanceTimersByTime(399); });
    expect(reveal).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(1); });
    expect(reveal).toHaveBeenCalledOnce();
    expect(complete).not.toHaveBeenCalled();
    expect(document.body.style.position).toBe('fixed');
    await act(async () => { vi.advanceTimersByTime(650); });
    expect(complete).toHaveBeenCalledOnce();
    unmount();
    expect(document.body.style.position).toBe('');
  });

  it('cancels the completion callback when unmounted before the exit finishes', async () => {
    const complete = vi.fn();
    const { unmount } = render(<CollageIntro heroPoster="/hero.webp" onComplete={complete} />);
    fireEvent.click(screen.getByRole('button', { name: '跳过片头' }));
    unmount();
    await act(async () => { vi.advanceTimersByTime(10000); });
    expect(complete).not.toHaveBeenCalled();
  });

  it('skips repeat visits, deep links and reduced motion, with an explicit replay URL', () => {
    expect(shouldShowIntro()).toBe(true);
    rememberIntro();
    expect(sessionStorage.getItem(INTRO_SESSION_KEY)).toBe('1');
    expect(shouldShowIntro()).toBe(false);
    window.history.replaceState(null, '', '/?intro=1');
    expect(shouldShowIntro()).toBe(true);
    window.history.replaceState(null, '', '/?intro=1#works');
    expect(shouldShowIntro()).toBe(false);
    window.history.replaceState(null, '', '/?intro=1');
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(shouldShowIntro()).toBe(false);
  });
});
