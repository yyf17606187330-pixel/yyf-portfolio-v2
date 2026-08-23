import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react';
import { fluidEffectConfig } from '../../content/profile';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePageVisibility } from '../../hooks/usePageVisibility';
import type { FluidEffectConfig } from '../../types/portfolio';
import { getFluidMode } from './fluidGate';
import './fluid.css';

const FluidCanvas = lazy(() => import('./FluidCanvas'));

export type FluidRegion = FluidEffectConfig['enabledRegions'][number];

interface FluidBackdropProps {
  className?: string;
  config?: FluidEffectConfig;
  region?: FluidRegion;
}

function canCreateWebGL(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const canvas = document.createElement('canvas');

  try {
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');

    if (!context) {
      return false;
    }

    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function FluidBackdrop({
  className,
  config = fluidEffectConfig,
  region = 'hero',
}: FluidBackdropProps) {
  const finePointer = useMediaQuery('(pointer: fine)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isPageVisible = usePageVisibility();
  const [webglAvailable, setWebglAvailable] = useState(false);
  const enabled = config.enabledRegions.includes(region);
  const mode = getFluidMode({ finePointer, reducedMotion, webglAvailable });
  const canEnhance = enabled && mode === 'webgl';
  const cssVariables = {
    '--fluid-color-a': config.colors[0],
    '--fluid-color-b': config.colors[1],
    '--fluid-color-c': config.colors[2],
    '--fluid-intensity': config.intensity,
  } as CSSProperties;

  useEffect(() => {
    setWebglAvailable(canCreateWebGL());
  }, []);

  return (
    <div
      aria-hidden="true"
      className={[
        'fluid-backdrop',
        `fluid-backdrop--${config.fallback}`,
        className,
      ].filter(Boolean).join(' ')}
      style={cssVariables}
    >
      <div className="fluid-backdrop__static" />
      {canEnhance ? (
        <Suspense fallback={null}>
          <FluidCanvas config={config} isPageVisible={isPageVisible} />
        </Suspense>
      ) : null}
    </div>
  );
}
