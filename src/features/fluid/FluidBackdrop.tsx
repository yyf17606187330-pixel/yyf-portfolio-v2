import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { fluidEffectConfig } from '../../content/profile';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePageVisibility } from '../../hooks/usePageVisibility';
import type { FluidEffectConfig } from '../../types/portfolio';
import { getFluidMode, shouldProbeFluidWebGL } from './fluidGate';
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

interface FluidEnhancementBoundaryProps {
  children: ReactNode;
  onFailure: () => void;
}

interface FluidEnhancementBoundaryState {
  hasFailed: boolean;
}

class FluidEnhancementBoundary extends Component<
  FluidEnhancementBoundaryProps,
  FluidEnhancementBoundaryState
> {
  state: FluidEnhancementBoundaryState = { hasFailed: false };

  static getDerivedStateFromError(): FluidEnhancementBoundaryState {
    return { hasFailed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.hasFailed ? null : this.props.children;
  }
}

interface FluidWebglEnhancementProps {
  config: FluidEffectConfig;
  isPageVisible: boolean;
  onFailure: () => void;
}

function FluidWebglEnhancement({
  config,
  isPageVisible,
  onFailure,
}: FluidWebglEnhancementProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper) {
      return undefined;
    }

    const disableEnhancement = (event: Event) => {
      if (event.cancelable) {
        event.preventDefault();
      }

      onFailure();
    };

    wrapper.addEventListener('webglcontextcreationerror', disableEnhancement, true);
    wrapper.addEventListener('webglcontextlost', disableEnhancement, true);

    return () => {
      wrapper.removeEventListener('webglcontextcreationerror', disableEnhancement, true);
      wrapper.removeEventListener('webglcontextlost', disableEnhancement, true);
    };
  }, [onFailure]);

  return (
    <div className="fluid-backdrop__webgl" ref={wrapperRef}>
      <FluidEnhancementBoundary onFailure={onFailure}>
        <Suspense fallback={null}>
          <FluidCanvas config={config} isPageVisible={isPageVisible} />
        </Suspense>
      </FluidEnhancementBoundary>
    </div>
  );
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
    if (!shouldProbeFluidWebGL({ enabled, finePointer, reducedMotion })) {
      setWebglAvailable(false);
      return;
    }

    setWebglAvailable(canCreateWebGL());
  }, [enabled, finePointer, reducedMotion]);

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
        <FluidWebglEnhancement
          config={config}
          isPageVisible={isPageVisible}
          onFailure={() => setWebglAvailable(false)}
        />
      ) : null}
    </div>
  );
}
