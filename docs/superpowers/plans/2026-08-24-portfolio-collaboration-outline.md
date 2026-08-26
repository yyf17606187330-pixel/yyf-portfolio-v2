# Portfolio Collaboration Implementation Outline

**Goal:** 把个人作品集的目标、责任边界、任务顺序、验收和 GitHub 流程固定为可追踪的协作骨架。

**Source of truth:** `PROJECT.md`

**Workflow:** 每项开发从 `main` 建独立分支，关联一个 Issue，尽早开 Draft PR，通过验收后再 Squash Merge。

**Delivery method:** 先用占位内容完成一条可运行的纵向切片：`HELLO. → 首页 → 一个作品 → 菜单 → 播放器 → 基础转场／流体 → 手机降级`。切片未通过前，不批量填充内容或把高级交互推迟到最后。

## Task 1：协作基线

**Owner:** 技术／集成负责人

**Files:** `PROJECT.md`、`CONTRIBUTING.md`、`.github` 中的 Issue／PR 模板

**Acceptance:** 文档、任务模板和 PR 模板均已进入 Draft PR；不改页面视觉代码。

## Task 2：排查并稳定测试基线

**Owner:** 流体模块负责人

**Files:** `src/features/fluid/FluidBackdrop.test.tsx` 及必要的最小流体实现文件

**Acceptance:** `FluidBackdrop` 首轮偶发的重复 canvas 问题得到复现或排除；连续完整运行稳定通过，且无新增失败。

## Task 3：纵向切片中的两个独立动效任务

先由技术／集成负责人把现有页面骨架和一个占位作品串成可运行链路；流体与转场 Agent 在这条链路上做最小可行验证，确认风险后再各自扩展。

### 3A 全局光标流体

**Owner:** 流体模块负责人

**Owns:** `src/features/fluid/**`

**Does not own:** 菜单、播放器、作品数据

**Acceptance:** 桌面精细指针全局有反馈；触屏、减少动态与 WebGL 失败保持静态降级；性能可接受。

### 3B 场景转场

**Owner:** 动效／交互负责人

**Owns:** `src/features/navigation/**`、`src/features/player/**`

**Does not own:** shader、作品数据、全局色板

**Acceptance:** 菜单与播放器具有统一的渐显／两侧滑入语言；Esc、焦点恢复和滚动恢复不退化。

## Task 4：集成与验收

**Owner:** 技术／集成负责人；QA／审核负责人独立复核

**Shared files:** `src/App.tsx`、`src/styles/index.css` 只由集成负责人修改。

**Acceptance:** `npm run test:run`、`npm run typecheck`、`npm run lint`、`npm run build` 通过；完成 1440×900、1280×800、390×844 实际页面检查。
