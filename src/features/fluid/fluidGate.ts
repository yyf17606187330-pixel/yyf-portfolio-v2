export interface FluidCapabilities {
  finePointer: boolean;
  reducedMotion: boolean;
  webglAvailable: boolean;
}

export type FluidMode = 'webgl' | 'static';

export function getFluidMode({
  finePointer,
  reducedMotion,
  webglAvailable,
}: FluidCapabilities): FluidMode {
  return finePointer && !reducedMotion && webglAvailable ? 'webgl' : 'static';
}
