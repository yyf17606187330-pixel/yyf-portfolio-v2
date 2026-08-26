# 作品集正式推进与阶段门槛 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用可验证的阶段门槛推进作品集，并让五个长期 Agent 对话在互不冲突的工作树中持续协作。

**Architecture:** 当前对话作为主／集成 Agent，另外四个长期对话分别负责内容、作品／视觉、流体、动效／交互。进度不使用主观百分比，而以“开始条件、交付物、验证证据、人工决定”四项全部满足后通过阶段门槛；独立审核使用短期只读对话，不占用长期开发工作树。

**Tech Stack:** Git、Git worktree、GitHub Issues／Draft PR、Vite、React 19、TypeScript、Vitest、ESLint、GitHub Actions、浏览器视觉检查。

**Spec:** `PROJECT.md`、`docs/design-direction.md`、`docs/agent-work-map.md`、`CONTRIBUTING.md`。

## Global Constraints

- `main` 不直接开发；一个任务只对应一个分支、一个工作树和一个 PR。
- `src/App.tsx`、`src/main.tsx`、全局样式、依赖与跨模块接口只由主／集成 Agent 修改。
- 同机上下文压缩只覆盖 `.agent-state/STATUS.md`；换设备、备份或删除工作树前才提交并推送。
- 占位内容允许存在，但不得虚构客户、成绩、联系方式或真实作品信息。
- Windows 与 macOS 均可视觉检查；当前 `qa:visual` 自动脚本只兼容 macOS 浏览器路径。
- 代码交付前按范围运行测试，并完成 `npm run test:run`、`npm run typecheck`、`npm run lint`、`npm run build`。
- 大型视频和图片不进入普通 Git 历史；仓库只保存内容清单、路径与必要的小型展示资源。

---

## 当前状态｜2026-08-26

| 项目 | 当前证据 | 状态 |
| --- | --- | --- |
| 测试基线 | PR #8；本地 68/68 测试通过 | 已实现，未合并 |
| 协作规则 | PR #7；含 `AGENTS.md`、五路分工和本地状态规则 | 已实现，未合并 |
| 跨平台 CI | PR #9；GitHub Linux CI 成功 | 已实现，未合并 |
| 长期 Agent 对话 | 当前只有主／集成对话 | 未创建其余四个 |
| 真实内容 | 仍以明确占位为主 | 未进入最终内容阶段 |
| 发布 | 不在当前范围 | 未开始 |

**当前结论：** 现在不新增五个聊天。当前对话已经占一个“主／集成 Agent”名额；先通过 Gate 0，再新增四个长期任务。

---

### Task 0: Gate 0｜基础仓库可协作

**开始条件：** 立即执行。

**Files:**
- Review: `src/test/setup.ts`
- Review: `AGENTS.md`
- Review: `.gitattributes`
- Review: `.github/workflows/ci.yml`
- Review: `.node-version`

**Interfaces:**
- Consumes: PR #7、PR #8、PR #9。
- Produces: 所有后续 Agent 都能安全分支的最新 `main`。

- [ ] **Step 1: 人工复核并 Squash Merge PR #8**

确认 PR 只修复 Testing Library 测试清理，Issue #2 随合并关闭。

- [ ] **Step 2: 人工复核并 Squash Merge PR #7**

确认目标、五路职责、本地状态规则和 Windows／macOS 视觉说明符合实际协作方式，Issue #1 随合并关闭。

- [ ] **Step 3: 人工复核并 Squash Merge PR #9**

必须在 PR #8 之后合并；确认 Linux CI 为成功，Issue #6 随合并关闭。

- [ ] **Step 4: 更新本地主工作树并复跑基线**

Run:

```powershell
git switch main
git pull --ff-only origin main
npm ci
npm run test:run
npm run typecheck
npm run lint
npm run build
```

Expected: 68 个测试通过；typecheck、lint、build 退出码均为 0；允许记录现有 `FluidCanvas` 大分块提示，但不得出现新错误。

- [ ] **Step 5: 启用 `main` 合并保护**

要求通过 PR 合并并将 `Test, typecheck, lint, and build` 设为必需检查；不要求第二个 GitHub 账号审批，避免单人仓库被锁死。

**Gate 0 通过条件：** PR #8、#7、#9 均已进入 `main`；本地与 GitHub CI 均通过；`main` 保护生效。未满足前不创建功能 Agent 工作树。

---

### Task 1: Gate 1｜建立五个长期对话

**开始条件：** Gate 0 通过。

**Files:**
- Read: `AGENTS.md`
- Read: `PROJECT.md`
- Read: `docs/agent-work-map.md`
- Create locally in every worktree: `.agent-state/STATUS.md`

**Interfaces:**
- Consumes: 受保护且验证通过的最新 `main`。
- Produces: 一个主／集成对话和四个互相隔离的工作对话。

- [ ] **Step 1: 保留当前对话作为主／集成 Agent**

主 Agent 负责任务排序、共享入口、依赖、冲突、最终验证和 PR 合并准备，不长期承接四个功能 Agent 的模块代码。

- [ ] **Step 2: 新建内容 Agent 任务**

在 Codex 中选择当前项目，并选择“新建本地工作树”。不手填工作树路径；初始指令使用本计划“Agent 指派文本”中的内容 Agent 文本。

- [ ] **Step 3: 新建作品／视觉 Agent 任务**

同样选择“新建本地工作树”。该 Agent 可以先审查占位与结构，但真实视觉定稿必须等待 Gate 2 的试点内容包。

- [ ] **Step 4: 新建流体 Agent 任务**

绑定 Issue #3，选择“新建本地工作树”，只修改 `src/features/fluid/` 及对应测试。

- [ ] **Step 5: 新建动效／交互 Agent 任务**

绑定 Issue #5，选择“新建本地工作树”，只修改开场、导航、播放器和相关 hooks。

- [ ] **Step 6: 每个工作树验证起点**

每个 Agent 首轮执行：

```powershell
git status --short --branch
npm ci
npm run test:run
```

Expected: 每个工作树位于不同分支；没有继承其他 Agent 的未提交改动；68 个测试通过；`.agent-state/STATUS.md` 已创建且被 Git 忽略。

**Gate 1 通过条件：** 总共五个长期对话存在；四个工作 Agent 各自拥有独立工作树、职责声明和绿色基线。审核对话不计入五个长期对话。

---

### Task 2: Gate 2｜试点内容包可实现

**开始条件：** Gate 1 通过；内容 Agent 开工。

**Files:**
- Modify: `src/content/projects.ts`
- Modify when information is available: `src/content/profile.ts`
- Modify: `docs/content-inventory.md`
- Test: `src/content/projects.test.ts`

**Interfaces:**
- Consumes: 用户提供的真实信息，或明确标注为占位的试点内容。
- Produces: 作品／视觉 Agent 可直接使用的一项试点作品数据和媒体说明。

- [ ] **Step 1: 选定一项试点作品**

记录标题、分类、年份、本人角色、媒体类型、横竖比例、封面来源和播放来源。缺失字段明确写“占位／待提供”，不虚构。

- [ ] **Step 2: 校验内容数据**

Run:

```powershell
npm run test:run -- src/content/projects.test.ts
npm run typecheck
```

Expected: 内容测试和类型检查通过；媒体路径与文件名大小写完全一致。

- [ ] **Step 3: 内容 Agent 建立 Draft PR**

PR 必须列出真实字段、仍为占位的字段、媒体是否可以公开，以及作品／视觉 Agent 可以依赖的最终数据结构。

**Gate 2 通过条件：** 至少一项试点作品可以进入现有纵向链路；其真实／占位边界清楚；用户确认可以用于下一阶段。真实素材未到位不阻止技术试点，但不能宣称视觉定稿。

---

### Task 3: Gate 3｜四条功能线形成可审核 PR

**开始条件：** Gate 1 通过；作品／视觉正式实现还需 Gate 2 通过。流体和动效 Agent 可在 Gate 1 后按现有设计原则先行。

**Files:**
- Content: `src/content/`、`docs/content-inventory.md`
- Works/visual: `src/features/works/`
- Fluid: `src/features/fluid/`
- Motion: `src/features/intro/`、`src/features/navigation/`、`src/features/player/`、相关 hooks
- Shared integration only: `src/App.tsx`、`src/main.tsx`、`src/styles/index.css`

**Interfaces:**
- Consumes: 试点内容结构、设计方向、Issue #3 和 Issue #5 验收条件。
- Produces: 四个范围独立、可单独拒绝或接受的 Draft PR。

- [ ] **Step 1: 内容线交付试点数据 PR**

只改变内容与清单；不修改布局、流体或播放器逻辑。

- [ ] **Step 2: 作品／视觉线交付试点页面 PR**

至少提供桌面和手机证据，检查媒体比例、文字层级、点击区域、滚动和控制台。需要全局样式时写成明确提案，由主 Agent 集成。

- [ ] **Step 3: 流体线交付 Issue #3 PR**

必须覆盖 WebGL 不可用、减少动态、移动端和性能降级；测试不得依赖用例执行顺序。

- [ ] **Step 4: 动效／交互线交付 Issue #5 PR**

必须覆盖菜单与播放器打开／关闭、Esc、焦点恢复、滚动锁定和减少动态。

- [ ] **Step 5: 每条线完成验证**

Run:

```powershell
npm run test:run
npm run typecheck
npm run lint
npm run build
```

Expected: 全部退出码为 0；视觉任务另附实际浏览器证据；每个 PR 没有越过声明的文件边界。

**Gate 3 通过条件：** 四条功能线都有可复核 PR、绿色检查、本地状态摘要和明确的共享文件请求；尚未通过的线不得混入集成分支。

---

### Task 4: Gate 4｜集成版本通过独立验收

**开始条件：** Gate 3 的目标 PR 已分别通过代码审核和用户视觉决定。

**Files:**
- Integrate: `src/App.tsx`
- Integrate when required: `src/main.tsx`
- Integrate: `src/styles/index.css`
- Review: all changed feature and content files

**Interfaces:**
- Consumes: 已通过审核的内容、视觉、流体和动效 PR。
- Produces: 可进入完整内容扩展的稳定 `main`。

- [ ] **Step 1: 主 Agent 按依赖顺序集成**

先内容结构，再作品区，再流体与动效；每合入一个 PR 后复跑受影响测试，出现冲突时不让功能 Agent同时改共享入口。

- [ ] **Step 2: 启动短期独立审核对话**

审核 Agent 只读取最终差异和页面证据，按 Issue #4 报告缺陷；未经新 Issue 授权不直接修代码。

- [ ] **Step 3: 完成技术验收**

Run:

```powershell
npm run test:run
npm run typecheck
npm run lint
npm run build
```

Expected: 所有命令通过；GitHub CI 成功；没有未解释的控制台错误或新增构建警告。

- [ ] **Step 4: 完成实际页面验收**

检查桌面与手机、键盘操作、Esc 与焦点恢复、滚动、点击区域、减少动态、WebGL 不可用降级，以及图片／视频比例。Windows 或 macOS 均可人工检查；自动截图兼容性另行处理。

**Gate 4 通过条件：** Issue #4 的缺陷已关闭或被明确延期；用户确认试点视觉；`main` 可运行且 CI 绿色。未通过时只修缺陷，不批量扩展到全部作品。

---

### Task 5: Gate 5｜完整内容与发布决策

**开始条件：** Gate 4 通过。

**Files:**
- Expand: `src/content/projects.ts`
- Update: `src/content/profile.ts`
- Update: `docs/content-inventory.md`
- Update only after user approval: deployment configuration

**Interfaces:**
- Consumes: 已验证的试点结构和用户提供的真实媒体。
- Produces: 10–15 项真实作品、完整个人信息和可发布版本。

- [ ] **Step 1: 批量扩展真实内容**

沿用已通过的试点结构，不为单个项目发明新的页面体系；所有缺失信息保持明确占位。

- [ ] **Step 2: 复跑 Gate 4 全部验收**

Expected: 新增作品不破坏响应式、播放器、滚动、性能降级或可访问性。

- [ ] **Step 3: 由用户决定是否进入发布准备**

只有用户确认内容、视觉和联系方式后，才新建部署、域名、媒体托管和统计任务；本计划不授权自动部署。

**Gate 5 通过条件：** 真实内容、联系方式、视觉和技术验收全部通过；用户明确授权发布工作。

---

## Agent 指派文本

### 1. 主／集成 Agent（当前对话）

你是主／集成 Agent。负责阶段门槛、任务排序、共享入口、依赖、冲突、验证和 PR 准备；不替用户决定最终视觉。开始前读取 `AGENTS.md`、`PROJECT.md` 和本进度书。功能 Agent 需要修改 `src/App.tsx`、`src/main.tsx`、全局样式、依赖或构建配置时，先提交接口请求，由你统一集成。

### 2. 内容 Agent

你是内容 Agent。只负责 `src/content/`、`docs/content-inventory.md` 和直接对应的内容测试。先审查现有占位与数据结构，再选定一项试点作品；缺失信息必须标记为占位，不得虚构。不要修改页面布局、流体、动效、播放器或共享入口。开工前读取仓库规则和进度书，并在本工作树维护本地 `.agent-state/STATUS.md`。

### 3. 作品／视觉 Agent

你是作品／视觉 Agent。负责 `src/features/works/` 的作品展示、排版、媒体比例和视觉证据。Windows／macOS 都可以检查视觉；当前自动截图仅兼容 macOS。不要修改流体、播放器逻辑、作品数据或自行批准最终审美；涉及全局样式时向主 Agent 提交精确提案。Gate 2 未通过前只做审查和方案，不宣称视觉定稿。

### 4. 流体 Agent

你是流体 Agent，绑定 Issue #3。只负责 `src/features/fluid/` 及其测试、WebGL 降级、减少动态、移动端和性能。不要修改菜单、播放器、作品数据或共享入口。开始前确认测试与 CI 基线为绿色；每次上下文压缩前覆盖本地 `.agent-state/STATUS.md`。

### 5. 动效／交互 Agent

你是动效／交互 Agent，绑定 Issue #5。负责 `src/features/intro/`、`src/features/navigation/`、`src/features/player/` 和直接相关 hooks，重点是打开／关闭转场、Esc、焦点恢复、滚动锁定和减少动态。不要修改 Shader、作品数据或最终色板；共享入口由主 Agent 集成。

---

## Codex 创建任务时怎么选

- 总数：五个长期对话，其中当前对话就是主／集成 Agent，所以后续只新增四个。
- 项目：选择当前 Git 项目。
- 环境：四个工作 Agent 均选择“新建本地工作树”，不要选择共享的“本地”。
- 路径：无需手动输入，Codex 自动创建和管理工作树目录。
- 指令：把对应的“Agent 指派文本”作为新任务首条消息。
- 时机：Gate 0 通过后再创建，确保四个任务都从含测试修复、规则和 CI 的最新 `main` 起步。
- 如果希望由当前主 Agent代为创建，明确回复“Gate 0 已通过，按进度书创建四个工作任务”即可。

## 进度维护规则

- 只有主／集成 Agent 修改本进度书的 Gate 状态，避免五个 Agent 同时冲突。
- 每项勾选必须附带 PR、提交、CI、命令结果或人工确认之一，不能按感觉更新。
- 功能 Agent 只覆盖自己的 `.agent-state/STATUS.md`；不把流水日志写进本文件。
- 阻塞时保持当前 Gate 未通过，并写清缺少的输入或失败证据；不跳级推进。
