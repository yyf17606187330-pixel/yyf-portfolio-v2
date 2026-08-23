import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FluidBackdrop } from './FluidBackdrop';

const canvasBehavior = vi.hoisted(() => ({ shouldThrow: false }));

vi.mock('./FluidCanvas', () => ({
  default: () => {
    if (canvasBehavior.shouldThrow) {
      throw new Error('Canvas initialization failed');
    }

    return <canvas data-testid="fluid-canvas" />;
  },
}));

const originalGetContext = HTMLCanvasElement.prototype.getContext;
const originalMatchMedia = window.matchMedia;

function installFinePointerMediaQueries() {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      addEventListener: vi.fn(),
      matches: query === '(pointer: fine)',
      removeEventListener: vi.fn(),
    }),
  });
}

beforeEach(() => {
  canvasBehavior.shouldThrow = false;
  installFinePointerMediaQueries();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    getExtension: vi.fn(),
  } as unknown as WebGLRenderingContext);
});

afterEach(() => {
  vi.restoreAllMocks();
  HTMLCanvasElement.prototype.getContext = originalGetContext;
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: originalMatchMedia,
  });
});

describe('FluidBackdrop failure fallback', () => {
  it('keeps the static fallback when the canvas subtree throws', async () => {
    canvasBehavior.shouldThrow = true;
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { container } = render(<FluidBackdrop />);

    await waitFor(() => {
      expect(screen.queryByTestId('fluid-canvas')).not.toBeInTheDocument();
    });

    expect(container.querySelector('.fluid-backdrop__static')).toBeInTheDocument();
  });

  it('unmounts the enhancement when its WebGL context is lost', async () => {
    const { container } = render(<FluidBackdrop />);
    const canvas = await screen.findByTestId('fluid-canvas');
    const contextLost = new Event('webglcontextlost', { bubbles: true, cancelable: true });

    fireEvent(canvas, contextLost);

    await waitFor(() => {
      expect(screen.queryByTestId('fluid-canvas')).not.toBeInTheDocument();
    });

    expect(contextLost.defaultPrevented).toBe(true);
    expect(container.querySelector('.fluid-backdrop__static')).toBeInTheDocument();
  });
});
