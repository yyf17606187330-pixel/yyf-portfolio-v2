# Two Selected Groups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two independent four-card selected-work groups, a capability-proof section, and experience-owned commercial cases without duplicating media or metrics.

**Architecture:** Content, media, motion, visual, and integration remain isolated by worktree and file ownership. A reusable `ProjectMediaDeck` owns one group at a time; the page renders two instances with independent state. Commercial cases remain inside Experience entries, while the capability section references evidence IDs.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, GSAP, CSS.

**Spec:** `docs/superpowers/specs/2026-08-31-two-selected-groups-design.md`

## Global Constraints

- Never infer or scan for the second group's four files; only user-designated files are accepted.
- Do not edit another agent's worktree or ownership files.
- Do not render draft or null media as public placeholders.
- Preserve `flushSync` card commits and the first-frame reveal gate from commit `ed1365d`.
- Keep commercial metrics in exactly one experience-owned case.
- Every implementation task follows red-green TDD and ends with scoped verification.

---

### Task 1: Selected-work and capability data contracts

**Files:**
- Create: `src/content/selectedWorks.ts`
- Create: `src/content/selectedWorks.test.ts`
- Create: `src/content/capabilities.ts`
- Create: `src/content/capabilities.test.ts`

**Interfaces:**
- Produces: `SelectedWorkItem`, `SelectedWorkGroup`, `selectedWorkGroups`, `CapabilityProof`, `capabilityProofs`, `getPublishedSelectedWorkGroups()`.

- [ ] Write failing tests that require exactly two groups, exactly four unique IDs per group, first-group approved order, second-group draft exclusion, and evidence references without duplicated metric strings.
- [ ] Run `npm run test:run -- src/content/selectedWorks.test.ts src/content/capabilities.test.ts` and confirm module-not-found or assertion failure.
- [ ] Implement the minimal typed data source. Second-group media fields remain `null`, `publishStatus: 'draft'`, and are filtered from `getPublishedSelectedWorkGroups()`.
- [ ] Re-run the two tests and `npm run typecheck`.
- [ ] Commit only the four content files.

### Task 2: Experience-owned commercial cases

**Files:**
- Modify: `src/content/experience.ts`
- Modify: `src/content/experience.test.ts`

**Interfaces:**
- Produces: `CommercialCase`, `ExperienceEntry.commercialCase`, `ExperienceEntry.employmentMetrics`.
- Consumes: existing verified media paths for Biyunquan; Zepin media remains unpublished until user supplies it.

- [ ] Write failing tests for section number `04`, reverse chronology, Xinghai-only employment metrics, Zepin `80万元／1:7`, and Biyunquan `45万元／1:5` plus UV/BPM ownership.
- [ ] Run the targeted content test and confirm the new ownership assertions fail.
- [ ] Move commercial case facts into the matching Experience entries and remove duplicate top metrics.
- [ ] Re-run the targeted test and `npm run typecheck`.
- [ ] Commit only the two Experience content files.

### Task 3: Reusable single-group media deck

**Files:**
- Create: `src/features/works/ProjectMediaDeck.tsx`
- Create: `src/features/works/ProjectMediaDeck.css`
- Create: `src/features/works/ProjectMediaDeck.test.tsx`
- Modify: `src/features/works/LongFormProjects.tsx`
- Modify: `src/features/works/LongFormProjects.test.tsx`

**Interfaces:**
- Consumes: `group: SelectedWorkGroup`, `onOpenProject(item, opener)`, `playerOpen`.
- Produces: one independently stateful deck with `[data-media-deck]`, `[data-active-index]`, and stable item DOM ordering.

- [ ] Write failing tests for two mounted instances with isolated indexes, boundary wheel release, keyboard controls, touch controls, and only one preview source mounted per deck.
- [ ] Run the targeted deck tests and confirm failures before implementation.
- [ ] Extract the existing card state machine without removing `flushSync` or `revealAfterFirstFrame`.
- [ ] Render the first approved group through the new component while retaining current copy and player opening behavior.
- [ ] Re-run deck and `LazyPreview` tests.
- [ ] Run a real-browser 12-switch forward/reverse frame probe and assert zero old-card top-layer restoration.
- [ ] Commit only motion-owned component and test files.

### Task 4: Two-group Selected Works section

**Files:**
- Create: `src/features/works/SelectedWorksSection.tsx`
- Create: `src/features/works/SelectedWorksSection.css`
- Create: `src/features/works/SelectedWorksSection.test.tsx`
- Modify: `src/features/works/LongFormProjects.tsx`

**Interfaces:**
- Consumes: `getPublishedSelectedWorkGroups()` and `ProjectMediaDeck`.
- Produces: chapter `02`, group labels `02.01` and `02.02`, with no fixed narrative duplicate.

- [ ] Write a failing test that first group renders once, fixed narrative duplicate is absent, and draft second group renders nothing.
- [ ] Implement the section shell and remove the fixed narrative block.
- [ ] When the user supplies all four second-group items, change only content status to `ready`; the same component must render the second deck without layout code changes.
- [ ] Verify 1440, 960, and 390 layouts, click targets, focus order, wheel boundaries, and horizontal overflow.
- [ ] Commit only Selected Works and the minimal LongForm migration.

### Task 5: Capability proof section

**Files:**
- Create: `src/features/capabilities/CapabilityProofSection.tsx`
- Create: `src/features/capabilities/CapabilityProofSection.css`
- Create: `src/features/capabilities/CapabilityProofSection.test.tsx`

**Interfaces:**
- Consumes: `capabilityProofs` and evidence references.
- Produces: section `03` with four primary capabilities; missing media evidence renders no fake media.

- [ ] Write failing tests for four capability titles, evidence links, and absence of commercial metric duplication.
- [ ] Implement semantic cards/rows using existing typography tokens and local CSS only.
- [ ] Verify mobile reading order and keyboard focus.
- [ ] Commit only capability component files.

### Task 6: Experience rendering and Contact ending

**Files:**
- Modify: `src/features/experience/ExperienceSection.tsx`
- Modify: `src/features/experience/ExperienceSection.css`
- Modify: `src/features/experience/ExperienceSection.test.tsx`
- Create: `src/features/contact/ContactSection.tsx`
- Create: `src/features/contact/ContactSection.css`
- Create: `src/features/contact/ContactSection.test.tsx`

**Interfaces:**
- Consumes: updated `experienceContent`.
- Produces: section `04` with embedded commercial cases and section `05` with truthful contact CTA only.

- [ ] Write failing tests for commercial cases under the correct companies, no duplicate project metrics, no forced Xinghai video, and no fake contact links.
- [ ] Implement minimal experience case rendering and Contact ending.
- [ ] Verify all three desktop entries fit the approved density and mobile remains single-column.
- [ ] Commit only Experience and Contact files.

### Task 7: Media intake for the second group

**Files:**
- Create after user designation: `public/media/projects/selected-b/<slug>/poster.webp`
- Create after user designation: `public/media/projects/selected-b/<slug>/preview-h264.mp4`
- Create after user designation: `public/media/projects/selected-b/<slug>/full-h264.mp4`
- Modify after delivery: `src/content/selectedWorks.ts`

**Interfaces:**
- Consumes: exactly four user-designated source files plus titles, roles, order, public rights, and preferred preview moments.
- Produces: web-ready poster, 5–8 second H.264 preview, H.264 full fallback, hashes, and populated second-group entries.

- [ ] Record source path, SHA-256, duration, dimensions, codec, and authorization for each designated file.
- [ ] Extract the user-approved preview interval; do not auto-select solely from technical metadata.
- [ ] Generate sRGB WebP posters and yuv420p H.264 faststart videos.
- [ ] Decode-check every output and verify HTTP 200/206 from the local preview.
- [ ] Change the second group to `ready` only when all four items pass verification.
- [ ] Commit media via the repository's approved LFS strategy; never ordinary-add a file over GitHub's limit.

### Task 8: App integration and final verification

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/features/navigation/SiteHeader.tsx`
- Modify: `docs/design-direction.md`
- Modify: `docs/decision-log.md`

**Interfaces:**
- Consumes: Selected Works, Capability Proof, Experience, and Contact sections.
- Produces: `Hero → About → Selected Works → Capability Proof → Experience → Contact` with `#about`, `#works`, `#experience`, and `#contact` anchors.

- [ ] Write failing App tests for six-section order and real navigation anchors.
- [ ] Integrate sections without global CSS changes beyond approved tokens.
- [ ] Run `npm run test:run`, `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.
- [ ] Verify 1440, 960, and 390: overflow, navigation cover, scrolling, focus, player lock, console, failed requests, and two-deck independence.
- [ ] Commit the integration and push the integration branch; do not merge without user review.
