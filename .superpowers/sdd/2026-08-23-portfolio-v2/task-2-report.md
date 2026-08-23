# Task 2 report: configurable fluid enhancement and platform gates

## Result

- Added the pure `getFluidMode` platform gate with all eight capability combinations covered.
- Added `FluidBackdrop`, which paints the configured static fallback immediately and lazy-loads the WebGL canvas only for a fine pointer, motion-enabled, WebGL-capable environment.
- The canvas uses DPR `[1, 1.5]`; its frame loop is `never` whenever the document is hidden. Shader colors and intensity come only from `FluidEffectConfig`.

## RED evidence

Command:

```text
npm run test:run -- src/features/fluid/fluidGate.test.ts
```

Key raw output:

```text
FAIL  src/features/fluid/fluidGate.test.ts
Error: Failed to resolve import "./fluidGate" from "src/features/fluid/fluidGate.test.ts". Does the file exist?
Test Files  1 failed (1)
Tests  no tests
```

## GREEN evidence

Focused gate test:

```text
✓ src/features/fluid/fluidGate.test.ts (8 tests) 2ms
Test Files  1 passed (1)
Tests  8 passed (8)
```

Final verification:

```text
✓ 5 test files passed (32 tests)
npm run typecheck  -> exit 0
npm run lint       -> exit 0
npm run build      -> exit 0
vite v7.3.6 ... ✓ built in 21ms
```

## Scope

Created only the Task 2 fluid feature, its gate test, and the two shared hooks. No legacy demo UI, palette, glass panels, private R3F renderer hooks, or old-project files were copied.

## Fix round 1: hardened fallback paths

- Wrapped the lazy Canvas subtree in a local error boundary. A render or lazy-load failure now unmounts only the enhancement and leaves the static layer in place.
- Added capture-phase listeners for `webglcontextcreationerror` and `webglcontextlost`; cancellable events are prevented and WebGL state is disabled so the Canvas unmounts.
- `useMediaQuery` now treats a missing `window.matchMedia` as a safe false result.
- WebGL probing now occurs only for an enabled region with a fine pointer and no reduced-motion preference.

### RED evidence: fix round 1

Command:

```text
npm run test:run -- src/features/fluid/fluidGate.test.ts src/features/fluid/FluidBackdrop.test.tsx src/hooks/useMediaQuery.test.tsx
```

Key raw output:

```text
FAIL  src/hooks/useMediaQuery.test.tsx
TypeError: window.matchMedia is not a function

FAIL  src/features/fluid/FluidBackdrop.test.tsx
expected document not to contain element, found <canvas data-testid="fluid-canvas" />

FAIL  src/features/fluid/fluidGate.test.ts
TypeError: (0 , shouldProbeFluidWebGL) is not a function
Test Files  3 failed (3)
Tests  7 failed | 9 passed (16)
```

### GREEN evidence: fix round 1

Focused command result:

```text
✓ src/features/fluid/fluidGate.test.ts (13 tests) 2ms
✓ src/hooks/useMediaQuery.test.tsx (1 test) 6ms
✓ src/features/fluid/FluidBackdrop.test.tsx (2 tests) 30ms
Test Files  3 passed (3)
Tests  16 passed (16)
```

Final verification:

```text
✓ 7 test files passed (40 tests)
npm run typecheck  -> exit 0
npm run lint       -> exit 0
npm run build      -> exit 0
vite v7.3.6 ... ✓ built in 24ms
```

## Fix round 2: initial creation-error timing

- Moved native capture listeners for `webglcontextcreationerror` and `webglcontextlost` to the persistent outer `.fluid-backdrop`.
- The outer listener is registered in `useLayoutEffect`, before the passive WebGL probe can mount the Canvas; the late duplicate wrapper listener was removed.
- Added a regression case where the mocked Canvas dispatches a cancellable creation error during its first layout phase.

### RED evidence: fix round 2

Command:

```text
npm run test:run -- src/features/fluid/fluidGate.test.ts src/features/fluid/FluidBackdrop.test.tsx src/hooks/useMediaQuery.test.tsx
```

Key raw output:

```text
FAIL  src/features/fluid/FluidBackdrop.test.tsx
FluidBackdrop failure fallback > catches a creation error dispatched during the canvas first layout phase
expected document not to contain element, found <canvas data-testid="fluid-canvas" />
Test Files  1 failed | 2 passed (3)
Tests  1 failed | 16 passed (17)
```

### GREEN evidence: fix round 2

Focused command result:

```text
✓ src/features/fluid/fluidGate.test.ts (13 tests) 2ms
✓ src/hooks/useMediaQuery.test.tsx (1 test) 6ms
✓ src/features/fluid/FluidBackdrop.test.tsx (3 tests) 36ms
Test Files  3 passed (3)
Tests  17 passed (17)
```

Final verification:

```text
✓ 7 test files passed (41 tests)
npm run typecheck  -> exit 0
npm run lint       -> exit 0
npm run build      -> exit 0
vite v7.3.6 ... ✓ built in 21ms
```
