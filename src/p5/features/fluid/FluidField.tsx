import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Color, MathUtils, Vector2, type IUniform, type ShaderMaterial } from 'three';
import type { FluidEffectConfig } from '../../types/portfolio';

interface PointerSample {
  speed: number;
  x: number;
  y: number;
}

interface FluidFieldProps {
  config: FluidEffectConfig;
}

interface FluidUniforms extends Record<string, IUniform> {
  uAspect: IUniform<number>;
  uColorA: IUniform<Color>;
  uColorB: IUniform<Color>;
  uColorC: IUniform<Color>;
  uEnergy: IUniform<number>;
  uPointer: IUniform<Vector2>;
  uPointerSpeed: IUniform<number>;
  uTime: IUniform<number>;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uAspect;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uEnergy;
  uniform vec2 uPointer;
  uniform float uPointerSpeed;
  uniform float uTime;

  varying vec2 vUv;

  float hash21(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    return mix(
      mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), local.x),
      mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + vec2(1.0, 1.0)), local.x),
      local.y
    );
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int index = 0; index < 5; index++) {
      value += amplitude * noise(point);
      point = mat2(1.55, 1.08, -1.08, 1.55) * point + 0.17;
      amplitude *= 0.48;
    }

    return value;
  }

  void main() {
    vec2 point = vUv * 2.0 - 1.0;
    point.x *= uAspect;

    vec2 pointer = uPointer * 2.0 - 1.0;
    pointer.x *= uAspect;

    float time = uTime * (0.08 + uEnergy * 0.12);
    vec2 firstWarp = vec2(
      fbm(point * 0.82 + vec2(time, -time * 0.7)),
      fbm(point * 0.88 + vec2(-time * 0.55, time) + 4.7)
    );
    vec2 secondWarp = vec2(
      fbm(point * 1.15 + 2.1 * firstWarp + vec2(1.8, 7.2)),
      fbm(point * 1.08 + 2.4 * firstWarp + vec2(8.1, 2.6))
    );

    float field = fbm(point * 0.72 + 2.7 * firstWarp + 1.25 * secondWarp);
    float pointerDistance = length(point - pointer);
    float pointerGlow = exp(-pointerDistance * 3.2);
    float ripple = sin(pointerDistance * 24.0 - uTime * 2.7)
      * exp(-pointerDistance * 5.2)
      * (0.025 + uPointerSpeed * 0.065);

    field += pointerGlow * (0.06 + uEnergy * 0.08) + ripple;

    float body = smoothstep(0.30, 0.72, field);
    float edge = smoothstep(0.57, 0.73, field) - smoothstep(0.73, 0.86, field);
    vec3 color = mix(uColorA, uColorB, body * (0.52 + uEnergy * 0.24));
    color = mix(color, uColorC, edge * (0.42 + uEnergy * 0.22));
    color += uColorC * pointerGlow * (0.025 + uPointerSpeed * 0.045);

    float vignette = smoothstep(1.5, 0.18, length(point * vec2(0.72, 0.88)));
    color *= mix(0.42, 1.0, vignette);
    color += (hash21(gl_FragCoord.xy + uTime) - 0.5) * 0.018;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function normalizePointer(event: PointerEvent): Pick<PointerSample, 'x' | 'y'> {
  return {
    x: MathUtils.clamp(event.clientX / window.innerWidth, 0, 1),
    y: MathUtils.clamp(1 - event.clientY / window.innerHeight, 0, 1),
  };
}

export function FluidField({ config }: FluidFieldProps) {
  const viewport = useThree((state) => state.viewport);
  const materialRef = useRef<ShaderMaterial>(null);
  const pointerRef = useRef<PointerSample>({ speed: 0, x: 0.68, y: 0.56 });
  const lastPointerRef = useRef({ time: 0, x: 0.68, y: 0.56 });
  const targetPointer = useMemo(() => new Vector2(0.68, 0.56), []);
  const initialUniforms = useMemo<FluidUniforms>(
    () => ({
      uAspect: { value: 1 },
      uColorA: { value: new Color(config.colors[0]) },
      uColorB: { value: new Color(config.colors[1]) },
      uColorC: { value: new Color(config.colors[2]) },
      uEnergy: { value: config.intensity },
      uPointer: { value: new Vector2(0.68, 0.56) },
      uPointerSpeed: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const normalized = normalizePointer(event);
      const now = performance.now();
      const previous = lastPointerRef.current;
      const elapsed = Math.max(now - previous.time, 16);
      const distance = Math.hypot(normalized.x - previous.x, normalized.y - previous.y);

      pointerRef.current = {
        ...normalized,
        speed: MathUtils.clamp((distance * 1000) / elapsed, 0, 1),
      };
      lastPointerRef.current = { time: now, ...normalized };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useFrame((_, delta) => {
    const material = materialRef.current;

    if (!material) {
      return;
    }

    const uniforms = material.uniforms as FluidUniforms;
    const frameDelta = Math.min(delta, 0.05);
    const pointer = pointerRef.current;

    targetPointer.set(pointer.x, pointer.y);
    uniforms.uPointer.value.lerp(targetPointer, 1 - Math.exp(-frameDelta * 6.5));
    uniforms.uPointerSpeed.value = MathUtils.damp(
      uniforms.uPointerSpeed.value,
      pointer.speed,
      7,
      frameDelta,
    );
    uniforms.uEnergy.value = MathUtils.damp(uniforms.uEnergy.value, config.intensity, 3.2, frameDelta);
    uniforms.uColorA.value.set(config.colors[0]);
    uniforms.uColorB.value.set(config.colors[1]);
    uniforms.uColorC.value.set(config.colors[2]);
    uniforms.uAspect.value = viewport.aspect;
    uniforms.uTime.value += frameDelta;
    pointerRef.current.speed *= 0.9;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        fragmentShader={fragmentShader}
        toneMapped={false}
        uniforms={initialUniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}
