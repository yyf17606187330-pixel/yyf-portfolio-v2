import { describe, expect, it } from 'vitest';
import { getFluidMode } from './fluidGate';

describe('getFluidMode', () => {
  it.each([
    [{ finePointer: false, reducedMotion: false, webglAvailable: false }, 'static'],
    [{ finePointer: false, reducedMotion: false, webglAvailable: true }, 'static'],
    [{ finePointer: false, reducedMotion: true, webglAvailable: false }, 'static'],
    [{ finePointer: false, reducedMotion: true, webglAvailable: true }, 'static'],
    [{ finePointer: true, reducedMotion: false, webglAvailable: false }, 'static'],
    [{ finePointer: true, reducedMotion: false, webglAvailable: true }, 'webgl'],
    [{ finePointer: true, reducedMotion: true, webglAvailable: false }, 'static'],
    [{ finePointer: true, reducedMotion: true, webglAvailable: true }, 'static'],
  ] as const)('uses %s for %o', (capabilities, expectedMode) => {
    expect(getFluidMode(capabilities)).toBe(expectedMode);
  });
});
