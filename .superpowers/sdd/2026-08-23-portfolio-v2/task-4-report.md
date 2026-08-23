# Task 4 report: production visual acceptance and media handoff

## Result

- Added `playwright-core@1.62.1` and `npm run qa:visual -- <preview-url>`. The script resolves macOS Chrome in preference order (system Google Chrome first), writes reproducible evidence to ignored `artifacts/qa`, and fails with an explicit checked-path message when no supported executable is present.
- Added `docs/content-inventory.md` with exact poster, 5–8 second muted preview, full-video, aspect and orientation slots for all 3 featured + 9 index slugs, a single naming convention, a non-live `VITE_MEDIA_BASE_URL` example, and the pending portrait/email/WeChat QR checklist.
- Production visual QA found and fixed four user-visible defects plus one browser error: missing favicon 404, a clipped 390 px Hero title, wrapped mobile navigation, scrolling desktop navigation at the ABOUT target, and the desktop `CAPABILITIES` word wrapping. No placeholder project data was changed.

## Production preview and evidence

The requested port 4173 was occupied by an existing preview from `/Users/yangyufeng/Desktop/前端`. Per controller ruling, v2 used the otherwise identical production-preview command on 4174:

```bash
npm run build
npm exec vite -- preview --host 127.0.0.1 --port 4174 --strictPort
npm run qa:visual -- http://127.0.0.1:4174
```

Browser: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, version `151.0.7922.172`.

Final required evidence exists and was dimension-checked:

- `artifacts/qa/desktop-1440.png` — 1440×900
- `artifacts/qa/desktop-1280.png` — 1280×800
- `artifacts/qa/mobile-390.png` — 390×844
- `artifacts/qa/qa-report.json` — final URL, Chrome path/version, interaction results and unclassified diagnostic originals

Auxiliary evidence: `about-overlay-1280.png`, `player-fallback-1280.png`, `mobile-menu-390.png`, `mobile-menu-320.png`, `mobile-filter-390.png`, and `long-title-390.png`. All final screenshots were opened with `view_image`; the three main images retain real placeholder content. The long Chinese title exists only as a temporary DOM replacement in the browser and is restored before the run ends.

The final report records 0 px horizontal overflow at 1440, 1280, 390 and the auxiliary 320 menu check. Featured content remains visibly entering the first viewport at all three required sizes (486, 432 and 413.5625 visible CSS pixels respectively).

## Automated interaction result

Final `qa-report.json` has `pass: true` and verifies:

- cleared session shows the intro; Skip persists `yyf-portfolio-intro-played=true`; same-session reload does not show the intro again;
- index filters show `ALL 9`, `FILM 2`, `AI VIDEO 2`, `PHOTOGRAPHY 2`, and `DESIGN + INTERACTIVE 3`;
- ABOUT opens with `scrollTop: 351`, target visible, complete sticky desktop navigation visible, CLOSE initially focused, Escape close, and opener focus restoration;
- missing-media player shows the designed fallback, renders 0 `<video>` elements and 0 empty video sources, starts 0 media requests, restores scroll `242 -> 242`, and restores opener focus on Escape;
- 390 and 320 menus expose complete single-line navigation labels without clip/overflow; the 390 category strip exposes all five controls and its last category is usable;
- console errors, page errors, request failures and captured WebGL creation/loss errors are all empty. No browser or WebGL error was suppressed or classified away; `classifications` is empty.

## Evidence-driven RED -> GREEN fixes

### Browser favicon request

Initial production QA failed with the original console error `Failed to load resource: the server responded with a status of 404 (Not Found)` at `http://127.0.0.1:4173/favicon.ico`. Root cause was the document's missing favicon declaration, which triggered Chrome's implicit request. A neutral inline SVG favicon removed the request without defining a final logo. The same QA then reported empty console/page/request-failure arrays.

### 390 Hero title

- Before: `mobile-390-before-title-fix.png`; `YUFENG` was clipped, while document overflow misleadingly remained 0 because the shell clips overflow.
- RED: the added visual-boundary assertion failed with `identity lines are visually clipped: [{"text":"YUFENG","overflow":17}]`.
- After: `mobile-390.png`; mobile Hero sizing changed from `21vw` to `19.5vw`, retaining the dominant title while fitting both lines. Final clipped-line list is empty.

### Mobile navigation

- Before: `mobile-menu-before-wrap-fix.png`; `CAPABILITIES` split with an orphan `S`.
- RED: visual text metrics reported `CAPABILITIES` content height `99.219` against line height `49.14`.
- After: `mobile-menu-390.png` and `mobile-menu-320.png`; a smaller responsive clamp plus `white-space: nowrap` keeps all four labels complete. Both widths have empty label-defect lists and 0 px horizontal overflow.

### ABOUT-target desktop navigation

- Before sticky: `about-overlay-before-sticky.png`; targeted scrolling left only the tail `ES` visible.
- RED: QA failed `Desktop navigation is clipped after scrolling to the ABOUT target`.
- Before nowrap: `about-overlay-before-nowrap.png`; sticky positioning restored the list, exposing a second defect where desktop `CAPABILITIES` still wrapped.
- RED: text metrics reported `CAPABILITIES` content height `134.5861` against line height `66.816`.
- After: `about-overlay-1280.png`; the >900 px navigation is sticky and full-height, <=900 px returns to static flow, and the desktop type clamp keeps all four labels complete.

## Real-media limitation

The production content intentionally has no real video source. Component tests cover the existing contract that a user-initiated project open attempts unmuted playback and falls back to muted playback when needed; browser QA proves only the missing-media branch. The first delivered real poster/preview/full-video set must receive a new production-browser regression for audible autoplay, controls, poster crop, preview loading and CDN/CORS behavior. No claim of real-media acceptance is made.

## Final verification

Fresh required command:

```bash
npm run test:run && npm run typecheck && npm run lint && npm run build
```

Result: 11 test files / 57 tests passed; `tsc -b` exited 0; `eslint .` exited 0; Vite transformed 79 modules and exited 0. Vite retained only its known large lazy `FluidCanvas` chunk advisory; it is a build advisory, not an application/browser/WebGL error.

The v2 preview on 4174 was stopped after evidence capture. A listener check confirmed 4174 is free. The pre-existing `/Users/yangyufeng/Desktop/前端` preview remains on 4173.
