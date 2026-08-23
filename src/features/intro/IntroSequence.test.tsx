import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INTRO_SESSION_KEY } from '../../lib/sessionIntro';
import { IntroSequence } from './IntroSequence';

function setReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('IntroSequence', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    setReducedMotion(false);
  });

  afterEach(() => {
    cleanup();
    window.sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it('marks the intro as played and completes when the visitor skips it', () => {
    const onComplete = vi.fn();

    render(<IntroSequence onComplete={onComplete} />);

    expect(screen.getByText('HELLO.')).toBeInTheDocument();
    expect(screen.getByText('YANG YUFENG')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '跳过开场' }));

    expect(window.sessionStorage.getItem(INTRO_SESSION_KEY)).toBe('true');
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('keeps focus in its modal layer and treats Escape as an accessible skip', async () => {
    const onComplete = vi.fn();
    render(
      <>
        <a href="#outside">外部链接</a>
        <IntroSequence onComplete={onComplete} />
      </>,
    );

    const dialog = screen.getByRole('dialog', { name: '开场动画' });
    const skip = screen.getByRole('button', { name: '跳过开场' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(skip).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(skip).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('completes immediately without rendering the animated layer for reduced motion', async () => {
    setReducedMotion(true);
    const onComplete = vi.fn();

    render(<IntroSequence onComplete={onComplete} />);

    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
    expect(screen.queryByText('HELLO.')).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(INTRO_SESSION_KEY)).toBe('true');
  });

  it('does not replay after the intro has completed in the current session', async () => {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
    const onComplete = vi.fn();

    render(<IntroSequence onComplete={onComplete} />);

    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
    expect(screen.queryByRole('button', { name: '跳过开场' })).not.toBeInTheDocument();
  });
});
