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

## Fix round 1: review alignment

### Ruling and implementation

- Kept the three featured projects exclusive to the featured sequence. `WorkIndex` now defensively removes featured entries even when it receives the complete project collection, so the additional index, its filter counts, and its live result count are all based only on the nine supplemental projects.
- Replaced the misleading `ALL WORKS` label with `ADDITIONAL WORKS`; the live status now reads `索引中显示 N 项`.
- Added reduced-motion gates to both navigation and player overlays. When `prefers-reduced-motion: reduce` matches, neither component creates a GSAP context or timeline and the native final layout remains visible and operable.
- Restored the four approved capability groups and their exact concrete skill coverage: Film & Direction, Photography & Retouch, Visual Design, and AI & Creative Tech.
- Header CAPABILITIES / ABOUT / CONTACT and footer CONTACT now open the overlay with a typed initial target. The overlay sets its own `scrollTop` from the target section offset, exposes the selected location through `aria-describedby` and `aria-current`, and leaves initial focus on the close button. MENU still opens at the top; no `scrollIntoView` call was introduced.

### RED evidence

The four focused suites were extended before production changes. The required command failed for the five missing review behaviors:

```text
Test Files  3 failed | 1 passed (4)
Tests       5 failed | 11 passed (16)

- WorkIndex still exposed ALL WORKS / 12 items instead of a nine-item supplemental index.
- NavigationOverlay created a GSAP context in reduced motion.
- PlayerOverlay created a GSAP context in reduced motion.
- The four approved capability headings and skill strings were absent.
- The requested ABOUT target did not set the overlay scroll position or location semantics.
```

### GREEN and final verification

Focused component verification after implementation:

```text
✓ src/features/intro/IntroSequence.test.tsx (4 tests)
✓ src/features/player/PlayerOverlay.test.tsx (4 tests)
✓ src/features/works/WorkIndex.test.tsx (3 tests)
✓ src/features/navigation/NavigationOverlay.test.tsx (5 tests)
Test Files  4 passed (4)
Tests       16 passed (16)
```

Full verification:

```text
npm run test:run
Test Files  11 passed (11)
Tests       57 passed (57)

npm run typecheck  -> tsc -b, exit 0
npm run lint       -> eslint ., exit 0
npm run build      -> exit 0, 79 modules transformed
```

One full-suite attempt exposed a pre-existing asynchronous cleanup race in `FluidBackdrop.test.tsx` (duplicate test canvas and React concurrent-render stderr). Its isolated suite passed 3/3 immediately, and the complete suite then passed 57/57 without `act(...)`, React, or application console noise. No out-of-scope Fluid file was modified. Vite still reports only the known lazy `FluidCanvas` chunk-size advisory after a successful build.

### Compact identity band

- Desktop identity lead: `clamp(23rem, 46svh, 29rem)`.
- Up to 900 px: `clamp(23rem, 50svh, 28rem)`.
- Up to 640 px: `clamp(24rem, 51svh, 28.5rem)`.
- Featured work top spacing is reduced to `clamp(2.75rem, 6vw, 5rem)`, with a 3 rem mobile value and a tighter featured heading gap. This implements the requested first-viewport direction; Task 4 remains responsible for screenshot-based viewport confirmation and evidence-driven tuning.
