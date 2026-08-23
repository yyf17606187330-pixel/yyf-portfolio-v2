import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FluidBackdrop } from './FluidBackdrop';

const canvasBehavior = vi.hoisted(() => ({
  creationEvent: null as Event | null,
  dispatchCreationOnLayout: false,
  shouldThrow: false,
}));

vi.mock('./FluidCanvas', async () => {
  const React = await import('react');

  return {
    default: () => {
      const canvasRef = React.useRef<HTMLCanvasElement>(null);

      React.useLayoutEffect(() => {
        if (!canvasBehavior.dispatchCreationOnLayout || !canvasRef.current) {
          return;
        }

        const creationEvent = new Event('webglcontextcreationerror', {
          bubbles: true,
          cancelable: true,
        });

        canvasBehavior.creationEvent = creationEvent;
        canvasRef.current.dispatchEvent(creationEvent);
      }, []);

    if (canvasBehavior.shouldThrow) {
      throw new Error('Canvas initialization failed');
    }

      return <canvas data-testid="fluid-canvas" ref={canvasRef} />;
    },
  };
});

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
  canvasBehavior.creationEvent = null;
  canvasBehavior.dispatchCreationOnLayout = false;
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

  it('catches a creation error dispatched during the canvas first layout phase', async () => {
    canvasBehavior.dispatchCreationOnLayout = true;
    const { container } = render(<FluidBackdrop />);

    await waitFor(() => {
      expect(screen.queryByTestId('fluid-canvas')).not.toBeInTheDocument();
    });

    expect(canvasBehavior.creationEvent?.defaultPrevented).toBe(true);
    expect(container.querySelector('.fluid-backdrop__static')).toBeInTheDocument();
  });
});
