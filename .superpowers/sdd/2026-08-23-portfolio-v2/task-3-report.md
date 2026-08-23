# Task 3 report: work-first portfolio interface

## Result

- Built the route-less work-first application: fixed identity/navigation, compact identity lead, three varied featured works, category filter with counts, nine-item work index, and a concise footer.
- Added the 1.65-second GSAP `HELLO.` → `YANG YUFENG` intro with session-once behavior, skip, reduced-motion instant completion, modal focus containment, and Escape support.
- Added exclusive portal layers for navigation and the project player. Both lock and restore scroll, trap focus, close with Escape, and return focus to the originating control.
- Added a real `<video>` player contract with initial audible `play()` attempt, playback, seek, mute, fullscreen, and an explicit missing-media state that never emits an empty media request.
- Added poster-first `LazyPreview`; the preview `src` is attached only after its frame enters the IntersectionObserver root margin.
- Added exact Syne/Manrope variable-font packages and centralized all provisional interface tokens in `src/styles/tokens.css`.

## RED evidence

Required focused command:

```text
npm run test:run -- src/features/intro/IntroSequence.test.tsx src/features/navigation/NavigationOverlay.test.tsx src/features/works/WorkIndex.test.tsx src/features/player/PlayerOverlay.test.tsx
```

Key raw output before implementation:

```text
FAIL  src/features/intro/IntroSequence.test.tsx
Error: Failed to resolve import "./IntroSequence"

FAIL  src/features/navigation/NavigationOverlay.test.tsx
Error: Failed to resolve import "./NavigationOverlay"

FAIL  src/features/player/PlayerOverlay.test.tsx
Error: Failed to resolve import "./PlayerOverlay"

FAIL  src/features/works/WorkIndex.test.tsx
Error: Failed to resolve import "./LazyPreview"

Test Files  4 failed (4)
Tests  no tests
```

Accessibility follow-up RED for the intro top layer:

```text
FAIL  IntroSequence > keeps focus in its modal layer and treats Escape as an accessible skip
Unable to find an accessible element with the role "dialog" and name "开场动画"
Test Files  1 failed (1)
Tests  1 failed | 3 passed (4)
```

## GREEN evidence

Focused component command after implementation:

```text
✓ src/features/intro/IntroSequence.test.tsx (3 tests)
✓ src/features/works/WorkIndex.test.tsx (3 tests)
✓ src/features/player/PlayerOverlay.test.tsx (3 tests)
✓ src/features/navigation/NavigationOverlay.test.tsx (2 tests)
Test Files  4 passed (4)
Tests  11 passed (11)
```

Intro accessibility follow-up:

```text
✓ src/features/intro/IntroSequence.test.tsx (4 tests)
Test Files  1 passed (1)
Tests  4 passed (4)
```

Final verification:

```text
npm run test:run && npm run typecheck && npm run lint && npm run build

Test Files  11 passed (11)
Tests  53 passed (53)
tsc -b       -> exit 0
eslint .     -> exit 0
vite build   -> exit 0, 79 modules transformed
```

Vitest output contained no React `act(...)` warnings and no application console noise. Vite retained its informational chunk-size warning for the already-lazy WebGL `FluidCanvas` chunk; the build completed successfully.

## Plan gap and scope

The Task 3 brief created `src/main.tsx` but originally excluded `index.html`, whose existing document had no module entry and would have rendered a blank runtime despite a successful build. The parent task explicitly expanded Task 3 ownership for one change only: add `<script type="module" src="/src/main.tsx"></script>` after `#root`. No other Task 1 file was changed.

All other changes stay within the Task 3 brief. Browser screenshots and viewport-specific visual evidence are intentionally left to Task 4, as assigned; Task 3 does not claim visual QA approval.
