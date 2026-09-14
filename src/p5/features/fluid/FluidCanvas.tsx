import { Canvas } from '@react-three/fiber';
import type { FluidEffectConfig } from '../../types/portfolio';
import { FluidField } from './FluidField';

interface FluidCanvasProps {
  config: FluidEffectConfig;
  isPageVisible: boolean;
}

export default function FluidCanvas({ config, isPageVisible }: FluidCanvasProps) {
  return (
    <Canvas
      aria-hidden="true"
      className="fluid-backdrop__canvas"
      dpr={[1, 1.5]}
      frameloop={isPageVisible ? 'always' : 'never'}
      gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
      orthographic
      camera={{ far: 10, near: 0.1, position: [0, 0, 1], zoom: 1 }}
    >
      <FluidField config={config} />
    </Canvas>
  );
}
