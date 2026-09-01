# Move Water Purifier Under Kuwo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the two independent four-card selected-work decks in section 02, and render the complete Biyunquan water-purifier commercial case exactly once after the Kuwo Trade experience in section 03.

**Architecture:** `App` remains the only player-state owner. `ProjectShowcase` becomes the selected-work container only. A reusable `CommercialProjectCase` owns the existing single-project heading, preview, vitals, and process UI. `ExperienceSection` accepts a render callback keyed by stable experience IDs, so content data stays independent from React and media concerns.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, CSS, Vite

**Spec:** `docs/superpowers/specs/2026-09-01-portfolio-experience-project-architecture-design.md`

## Global Constraints

- Do not change water-purifier facts, copy, media paths, player behavior, or aspect ratio.
- Do not edit `LongFormProjects.tsx`, `LongFormProjects.css`, `LazyPreview.tsx`, or their video lifecycle.
- Do not add empty project frames to Xinghai or Zhepin.
- Do not modify Hero, About, navigation, global typography, Cloudflare deployment, or untracked `output/`.
- Stage and commit only named files; preserve unrelated user work.
- Observe a failing focused test before each production behavior change.

---

## Task 1: Add stable experience IDs

**Files:**

- Modify: `src/content/experience.test.ts`
- Modify: `src/content/experience.ts`

- [x] **Step 1: Write the failing content test**

Add an assertion that the reverse-chronological entries expose the exact stable IDs:

```ts
expect(experienceContent.experiences.map((entry) => entry.id)).toEqual([
  'xinghai',
  'zhepin',
  'kuwo',
]);
```

- [x] **Step 2: Run the focused test and observe RED**

Run:

```powershell
npm run test:run -- src/content/experience.test.ts
```

Expected: failure because the three entries do not yet expose `id`.

- [x] **Step 3: Add the minimal stable-ID model**

Add a constrained ID type and the property to `ExperienceEntry`:

```ts
export type ExperienceId = 'xinghai' | 'zhepin' | 'kuwo';

export interface ExperienceEntry {
  id: ExperienceId;
  // existing fields remain unchanged
}
```

Add the matching ID to each existing entry without changing copy or order.

- [x] **Step 4: Run the focused test and observe GREEN**

Run the same command and require a zero exit code.

- [x] **Step 5: Commit the stable identity change**

```powershell
git add src/content/experience.ts src/content/experience.test.ts
git commit -m "feat: identify experience entries"
```

---

## Task 2: Add an optional project slot to experience entries

**Files:**

- Modify: `src/features/experience/ExperienceSection.test.tsx`
- Modify: `src/features/experience/ExperienceSection.tsx`
- Modify: `src/features/experience/ExperienceSection.css`

- [x] **Step 1: Write the failing slot test**

Render `ExperienceSection` with a callback that returns a labelled test project only for `entry.id === 'kuwo'`. Assert:

```ts
expect(within(entries[0]).queryByLabelText('酷我贸易代表项目')).not.toBeInTheDocument();
expect(within(entries[1]).queryByLabelText('酷我贸易代表项目')).not.toBeInTheDocument();
expect(within(entries[2]).getByLabelText('酷我贸易代表项目')).toBeInTheDocument();
expect(entries[2].lastElementChild).toHaveClass('experience-entry__project');
```

Also assert that no empty `.experience-entry__project` wrappers exist for the first two entries.

- [x] **Step 2: Run the focused test and observe RED**

```powershell
npm run test:run -- src/features/experience/ExperienceSection.test.tsx
```

Expected: failure because `ExperienceSection` ignores the render callback.

- [x] **Step 3: Implement the optional render callback**

Add the prop:

```ts
renderProject?: (entry: ExperienceEntry) => ReactNode;
```

For each entry, evaluate it once and append a project wrapper only when the result is non-null:

```tsx
{project ? (
  <div className="experience-entry__project" data-experience-project>
    {project}
  </div>
) : null}
```

Use `entry.id` for the React key and heading ID so employer identity does not depend on display copy.

- [x] **Step 4: Add local responsive placement styles**

Make the slot span the full entry grid on desktop and flow naturally beneath the entry body on narrow screens. Do not alter the existing experience copy grid, mobile column order, or global page gutter.

- [x] **Step 5: Run the focused test and observe GREEN**

Run the same focused command and require all Experience tests to pass.

- [x] **Step 6: Commit the slot**

```powershell
git add src/features/experience/ExperienceSection.tsx src/features/experience/ExperienceSection.css src/features/experience/ExperienceSection.test.tsx
git commit -m "feat: support projects within experience entries"
```

---

## Task 3: Extract the existing commercial case

**Files:**

- Create: `src/features/works/CommercialProjectCase.tsx`
- Create: `src/features/works/CommercialProjectCase.test.tsx`
- Modify: `src/features/works/ProjectShowcase.tsx`
- Modify: `src/features/works/ProjectShowcase.test.tsx`
- Modify: `src/features/works/ProjectShowcase.css`

- [x] **Step 1: Create a failing commercial-case test**

Move the existing water-purifier behavior expectations into a test for `CommercialProjectCase`:

- verified company, dates, results, duties, and process copy remain visible;
- exactly one 9:16 preview exists;
- no full video is mounted before click;
- click calls `onOpenProject(project, button)`;
- preview pause/reduced-motion behavior remains unchanged;
- vitals and semantic role list remain accessible.

Run:

```powershell
npm run test:run -- src/features/works/CommercialProjectCase.test.tsx
```

Expected: import/module failure because the component has not been created.

- [x] **Step 2: Extract the existing single-project markup without redesign**

Create `CommercialProjectCase` with the current water-project props and move these blocks unchanged from `ProjectShowcase`:

- project heading and statement;
- semantic metadata and ticker;
- `LazyPreview` media button and preview pause control;
- project vitals;
- process timeline.

The root must have a unique labelled region but no `id="works"`. It may retain the existing `project-showcase__*` child classes to preserve the accepted visuals and reduce CSS churn.

- [x] **Step 3: Narrow `ProjectShowcase` to selected work**

Change its public props to only:

```ts
interface ProjectShowcaseProps {
  playerOpen: boolean;
  onOpenProject: (project: Project, opener: HTMLElement) => void;
}
```

Keep the root `section[aria-label="精选作品"]#works` and render only `LongFormProjects`. Remove the water-specific transition rail, heading, article, and state from this component. Do not edit the card component itself.

- [x] **Step 4: Separate selected-work and commercial-case tests**

Keep deck source order, eight-preview count, controls, reveal rules, and placeholder checks in `ProjectShowcase.test.tsx`. Keep all water-purifier assertions in `CommercialProjectCase.test.tsx`. Update only assertions whose old responsibility is intentionally removed.

- [x] **Step 5: Add a local embedded layout modifier**

Use the existing `ProjectShowcase.css` tokens and child selectors, plus a `.commercial-project` root modifier. When nested under `.experience-entry__project`, remove duplicate outer page gutters, preserve readable project maximum width, and keep the existing 9:16 media interaction. Do not leak selectors outside Experience/Works.

- [x] **Step 6: Run focused tests and observe GREEN**

```powershell
npm run test:run -- src/features/works/CommercialProjectCase.test.tsx src/features/works/ProjectShowcase.test.tsx
```

Expected: all focused tests pass and no full media is mounted before a click.

- [x] **Step 7: Commit the extraction**

```powershell
git add src/features/works/CommercialProjectCase.tsx src/features/works/CommercialProjectCase.test.tsx src/features/works/ProjectShowcase.tsx src/features/works/ProjectShowcase.test.tsx src/features/works/ProjectShowcase.css
git commit -m "refactor: separate selected and commercial work"
```

---

## Task 4: Wire the water-purifier case to Kuwo in App

**Files:**

- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`

- [x] **Step 1: Write the failing integration structure test**

Locate the three `[data-experience-entry]` nodes and assert:

```ts
const works = screen.getByRole('region', { name: '精选作品' });
const waterHeadings = screen.getAllByRole('heading', { name: '净水器' });

expect(waterHeadings).toHaveLength(1);
expect(within(works).queryByRole('heading', { name: '净水器' })).not.toBeInTheDocument();
expect(within(entries[2]).getByRole('heading', { name: '净水器' })).toBe(waterHeadings[0]);
expect(entries[2]).toHaveAttribute('data-experience-id', 'kuwo');
```

Keep the existing player-open, full-source, scroll-lock, and focus-return test.

- [x] **Step 2: Run the App test and observe RED**

```powershell
npm run test:run -- src/App.test.tsx
```

Expected: failure because the current water case is still a direct child of `main` before Experience.

- [x] **Step 3: Implement the App integration**

Render the selected works without water props. Pass `ExperienceSection` a render callback that returns `CommercialProjectCase` only for `entry.id === 'kuwo'`, with the current water project/copy and the same shared player callback.

Keep `App` as the sole owner of `activeProject` and `openerRef`. Do not duplicate player state or media nodes.

- [x] **Step 4: Run the App test and focused feature tests**

```powershell
npm run test:run -- src/App.test.tsx src/features/experience/ExperienceSection.test.tsx src/features/works/CommercialProjectCase.test.tsx src/features/works/ProjectShowcase.test.tsx
```

Expected: water case appears once inside Kuwo, selected work remains before Experience, and player focus returns to the moved button.

- [x] **Step 5: Commit the integration**

```powershell
git add src/App.tsx src/App.test.tsx
git commit -m "feat: place water project under kuwo experience"
```

---

## Task 5: Regression and visual verification

**Files:**

- Modify if needed: `.agent-state/STATUS.md` (local only)
- Do not modify: `output/`, deployment configuration, media binaries

- [x] **Step 1: Run the complete automated suite**

```powershell
npm run test:run
npm run typecheck
npm run lint
npm run build
git diff --check
```

Require zero exit codes. If a command fails, summarize the first relevant error, determine whether this change caused it, fix minimally, and rerun the same command.

- [x] **Step 2: Verify the protected deck regression path**

Run the existing interaction tests that cover `01→02→03→04→03→02→01`, warmed video identity, and transition playback. Do not alter those assertions to obtain a pass.

- [x] **Step 3: Inspect the real page at 1440, 960, and 390**

At `http://127.0.0.1:4184/`, verify:

- section 02 contains both four-card decks and no water-purifier heading;
- the Kuwo entry contains the only water-purifier heading, preview, vitals, and process;
- Xinghai and Zhepin have no empty project container;
- no horizontal overflow, clipped controls, broken scroll, or console/page errors;
- clicking the moved preview opens the full player and close returns focus to that same button.

- [x] **Step 4: Confirm no duplicate media requests or IDs**

Check that the water preview is requested once and that `#works`, heading IDs, and description IDs are unique.

- [x] **Step 5: Update the local recovery snapshot**

Overwrite `.agent-state/STATUS.md` with the current branch, HEAD, completed structure, exact verification results, known residual risks, and next action. Do not include credentials or raw chat.

- [x] **Step 6: Final checkpoint**

If verification is fully green, commit only any remaining tracked task files. Do not add `output/`, `.agent-state/`, screenshots, or media. Report the exact commits and keep deployment explicitly out of scope.
