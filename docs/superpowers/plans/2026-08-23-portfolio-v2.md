# Portfolio v2 Implementation Plan

> Historical build plan. Current GitHub branch, ownership and merge rules are defined by `PROJECT.md` and `CONTRIBUTING.md`; those rules supersede the original no-push instruction below.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an independent, tested portfolio frontend for Yang Yufeng with a cinematic intro, work-first index, overlay navigation, full-screen player, and configurable fluid accent.

**Architecture:** A Vite React application keeps portfolio content in typed data modules, media URL/session/player behavior in pure testable helpers, and interaction surfaces in focused React features. GSAP owns cinematic transitions, Lenis owns optional smooth scrolling, and a lazily loaded React Three Fiber field progressively enhances a static CSS fallback.

**Tech Stack:** Vite, React 19, TypeScript, Vitest, Testing Library, GSAP 3, Lenis 1, Three.js, React Three Fiber, ESLint 9, Playwright Core for screenshot QA.

**Spec:** `docs/superpowers/specs/portfolio-v2-spec.md`

## Global Constraints

- Work only in `/Users/yangyufeng/Desktop/前端/yyf-portfolio-v2`; never modify `/Users/yangyufeng/Desktop/前端/src` or its existing project files.
- Positioning copy is `杨玉峰` / `YANG YUFENG` / `影像导演 × AI 视觉创作者`.
- Intro is `HELLO.` → `YANG YUFENG` → works in 1.5–1.8 seconds, skippable, reduced-motion safe, once per browser session.
- Categories are exactly `FILM / 影像`, `AI VIDEO / AI视频`, `PHOTOGRAPHY / 摄影`, `DESIGN + INTERACTIVE / 设计与交互`.
- Runtime content has 12 configurable projects with exactly 3 featured projects.
- No project detail route, CMS, analytics, social links, deployment, copied third-party media, invented client claims, or invented performance numbers.
- Missing real portrait, contact details, QR and videos render explicit local placeholders without remote requests or 404s.
- Media paths resolve through `VITE_MEDIA_BASE_URL`; video binaries remain ignored by Git.
- Use GSAP for intro/menu/player transitions and Lenis without scroll hijacking.
- Fluid WebGL is lazy, configurable, fine-pointer desktop only, capped at DPR 1.5, paused while hidden, and replaced by CSS for touch/reduced-motion/WebGL failure.
- Provisional neutral visual tokens must stay centralized in CSS custom properties so a later design task can replace them.
- Follow TDD for behavior: add a focused failing test, record the expected failure, implement, then record the passing run.
- Commits must stay on `feature/portfolio-v2`; do not merge, push, publish, or deploy.

---

### Task 1: Project scaffold and typed content foundation

**Files:**
- Create: `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`
- Create: `src/types/portfolio.ts`, `src/content/categories.ts`, `src/content/projects.ts`, `src/content/profile.ts`, `src/lib/media.ts`, `src/lib/sessionIntro.ts`, `src/features/player/playerState.ts`
- Create: `src/test/setup.ts`, `src/lib/media.test.ts`, `src/lib/sessionIntro.test.ts`, `src/features/player/playerState.test.ts`, `src/content/projects.test.ts`
- Create: `README.md`, `.env.example`, `public/media/README.md`

**Interfaces:**
- Produces: the four public types from the spec; `categories`; `projects`; `profile`; `fluidEffectConfig`; `resolveMediaUrl(path, baseUrl?)`; `shouldPlayIntro(storage, reduceMotion)`; `markIntroPlayed(storage)`; `playerReducer(state, event)`.
- Consumes: no application code from later tasks.

- [ ] **Step 1: Create the test/build configuration and focused failing tests**

Tests must prove unsafe/empty media values fall back without a request, base URLs join safely, intro state is session-scoped and reduced-motion aware, player open/close/toggle state is deterministic, category labels are exact, slugs/orders are unique, and runtime content contains 12 projects with exactly 3 featured items.

- [ ] **Step 2: Run the focused tests and preserve RED evidence**

Run: `npm install && npm run test:run -- src/lib/media.test.ts src/lib/sessionIntro.test.ts src/features/player/playerState.test.ts src/content/projects.test.ts`

Expected: FAIL because the referenced production modules do not exist.

- [ ] **Step 3: Implement the smallest typed foundation that passes**

Use deliberate strings such as `待补充邮箱` and empty media paths for missing user-supplied values. `resolveMediaUrl` must return `null` for empty paths, `javascript:` values, protocol-relative URLs, traversal segments, and unsupported protocols; it may preserve `https:` and `data:image/` poster values.

- [ ] **Step 4: Verify focused and full tests, typecheck and lint**

Run: `npm run test:run && npm run typecheck && npm run lint`

- [ ] **Step 5: Commit**

Commit subject: `feat: scaffold typed portfolio content`

### Task 2: Configurable fluid enhancement and platform gates

**Files:**
- Create: `src/features/fluid/fluidGate.ts`, `src/features/fluid/fluidGate.test.ts`, `src/features/fluid/FluidField.tsx`, `src/features/fluid/FluidCanvas.tsx`, `src/features/fluid/FluidBackdrop.tsx`, `src/features/fluid/fluid.css`
- Create: `src/hooks/useMediaQuery.ts`, `src/hooks/usePageVisibility.ts`

**Interfaces:**
- Consumes: `FluidEffectConfig` and `fluidEffectConfig` from Task 1.
- Produces: `getFluidMode({ finePointer, reducedMotion, webglAvailable }): 'webgl' | 'static'`; default `FluidCanvas`; named `FluidBackdrop`.

- [ ] **Step 1: Write a failing gate test**

Cover all eight boolean combinations and require `webgl` only when fine pointer and WebGL are true and reduced motion is false.

- [ ] **Step 2: Run the test and preserve RED evidence**

Run: `npm run test:run -- src/features/fluid/fluidGate.test.ts`

Expected: FAIL because `fluidGate.ts` does not exist.

- [ ] **Step 3: Implement the gate, shader field, lazy canvas and CSS fallback**

Port only the old shader/noise and normalized pointer-energy behavior. Colors come from `FluidEffectConfig`; render loop becomes `never` while the document is hidden; Canvas DPR is `[1, 1.5]`; capability detection uses a disposable canvas and catches failures. `FluidBackdrop` must render the static layer immediately and lazy-load WebGL only after the gate selects it.

- [ ] **Step 4: Verify focused tests, full tests, typecheck and lint**

Run: `npm run test:run && npm run typecheck && npm run lint`

- [ ] **Step 5: Commit**

Commit subject: `feat: add configurable fluid enhancement`

### Task 3: Work-first portfolio interface and interactions

**Files:**
- Modify: `package.json`, `package-lock.json` to add `@fontsource-variable/manrope@5.3.0` and `@fontsource-variable/syne@5.3.0`
- Modify: `index.html` to mount `/src/main.tsx`
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles/index.css`, `src/styles/tokens.css`
- Create: `src/features/intro/IntroSequence.tsx`, `src/features/intro/IntroSequence.test.tsx`
- Create: `src/features/navigation/SiteHeader.tsx`, `src/features/navigation/NavigationOverlay.tsx`, `src/features/navigation/NavigationOverlay.test.tsx`
- Create: `src/features/works/CategoryFilter.tsx`, `src/features/works/ProjectCard.tsx`, `src/features/works/WorkIndex.tsx`, `src/features/works/WorkIndex.test.tsx`, `src/features/works/LazyPreview.tsx`
- Create: `src/features/player/PlayerOverlay.tsx`, `src/features/player/PlayerOverlay.test.tsx`
- Create: `src/hooks/useFocusTrap.ts`, `src/hooks/useScrollLock.ts`, `src/hooks/useLenis.ts`

**Interfaces:**
- Consumes: content/types/helpers from Task 1 and `FluidBackdrop` from Task 2.
- Produces: the complete route-less application mounted from `main.tsx`.

- [ ] **Step 1: Write failing component tests**

Tests must cover intro skip/marking, reduced-motion instant completion, category counts/filtering, menu focus trap and Esc close, player unmuted open attempt, play/mute/progress controls, missing-media fallback, Esc close, and focus restoration to the originating project control.

- [ ] **Step 2: Run the component tests and preserve RED evidence**

Run: `npm run test:run -- src/features/intro/IntroSequence.test.tsx src/features/navigation/NavigationOverlay.test.tsx src/features/works/WorkIndex.test.tsx src/features/player/PlayerOverlay.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement accessible components and interaction state**

Use semantic buttons, `aria-modal`, named dialog regions, visible focus, body scroll restoration, and portal-based top layers. Keep the home flow continuous: fixed header, compact identity lead, featured works, filter row, index grid and concise footer. Do not add resume-style sections to the page body.

- [ ] **Step 4: Apply the provisional design system and motion**

Use centralized neutral tokens, Syne for display and Manrope for body, square media frames with borders instead of rounded cards, CSS grid variation for the three featured projects, GSAP transitions, and responsive states at 900px and 640px. Avoid orange, percentage loaders, loading logos, heavy gradients, excessive pills and repeated full-screen headings.

- [ ] **Step 5: Verify component/full tests, typecheck, lint and build**

Run: `npm run test:run && npm run typecheck && npm run lint && npm run build`

- [ ] **Step 6: Commit**

Commit subject: `feat: build work-first portfolio interface`

### Task 4: Visual QA, browser interaction QA and handoff documentation

**Files:**
- Modify: `package.json`, `package-lock.json` to add `playwright-core@1.62.1` and the `qa:visual` script
- Create: `scripts/visual-qa.mjs`, `docs/content-inventory.md`
- Modify: UI/style/test files only when a QA finding requires a fix.
- Create locally and keep ignored: `artifacts/qa/desktop-1440.png`, `artifacts/qa/desktop-1280.png`, `artifacts/qa/mobile-390.png`, `artifacts/qa/qa-report.json`

**Interfaces:**
- Consumes: the complete application from Task 3.
- Produces: reproducible local visual evidence and an exact real-media handoff checklist.

- [ ] **Step 1: Add browser QA script and content inventory**

The script must start from a supplied preview URL, capture 1440×900, 1280×800 and 390×844, collect console/page errors, measure horizontal overflow, exercise intro skip, every category, menu open/Esc close, one available-media fixture when tests supply it, missing-media fallback and mobile navigation. The inventory must specify filenames and required poster/preview/full-video/aspect metadata for 3 featured and 9 index slots plus portrait, email and WeChat QR.

- [ ] **Step 2: Run production preview and QA**

Run the production build, start `vite preview -- --host 127.0.0.1 --port 4173`, then run `npm run qa:visual -- http://127.0.0.1:4173`.

Expected: three screenshots, no app console errors, no page errors, and horizontal overflow at most 1 CSS pixel.

- [ ] **Step 3: Inspect all three screenshots and fix actual visual defects**

Verify hierarchy, Chinese title wrapping, landscape/portrait placeholder crops, overlay controls, mobile filter reachability and the absence of PPT-like repeated sections. Record any fix in the report and regenerate affected screenshots.

- [ ] **Step 4: Run final verification**

Run: `npm run test:run && npm run typecheck && npm run lint && npm run build`

- [ ] **Step 5: Commit**

Commit subject: `test: add visual acceptance and media handoff`
