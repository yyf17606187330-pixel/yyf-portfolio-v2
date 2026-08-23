import { describe, expect, it } from 'vitest';
import { getFluidMode, shouldProbeFluidWebGL } from './fluidGate';

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

describe('shouldProbeFluidWebGL', () => {
  it.each([
    [{ enabled: false, finePointer: false, reducedMotion: false }, false],
    [{ enabled: false, finePointer: true, reducedMotion: false }, false],
    [{ enabled: true, finePointer: false, reducedMotion: false }, false],
    [{ enabled: true, finePointer: true, reducedMotion: true }, false],
    [{ enabled: true, finePointer: true, reducedMotion: false }, true],
  ] as const)('returns %s for %o', (conditions, shouldProbe) => {
    expect(shouldProbeFluidWebGL(conditions)).toBe(shouldProbe);
  });
});
