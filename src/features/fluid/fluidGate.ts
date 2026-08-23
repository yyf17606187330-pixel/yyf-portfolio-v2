export interface FluidCapabilities {
  finePointer: boolean;
  reducedMotion: boolean;
  webglAvailable: boolean;
}

export type FluidMode = 'webgl' | 'static';

export interface FluidProbeConditions {
  enabled: boolean;
  finePointer: boolean;
  reducedMotion: boolean;
}

export function getFluidMode({
  finePointer,
  reducedMotion,
  webglAvailable,
}: FluidCapabilities): FluidMode {
  return finePointer && !reducedMotion && webglAvailable ? 'webgl' : 'static';
}

export function shouldProbeFluidWebGL({
  enabled,
  finePointer,
  reducedMotion,
}: FluidProbeConditions): boolean {
  return enabled && finePointer && !reducedMotion;
}
