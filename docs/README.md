# 项目文档入口

## 当前有效文档

| 文档 | 作用 | 状态 |
| --- | --- | --- |
| [`PROJECT.md`](../PROJECT.md) | 最终目标、范围、阶段、角色与文档优先级 | 最高级事实源 |
| [`design-direction.md`](design-direction.md) | 视觉、版式、媒体和动效方向 | 草案，待杨玉峰审核 |
| [`decision-log.md`](decision-log.md) | 已确认、待确认和已舍弃的决定 | 持续更新 |
| [`agent-work-map.md`](agent-work-map.md) | Agent 分工、边界、依赖和交付关系 | 当前协作骨架 |
| [`content-inventory.md`](content-inventory.md) | 真实作品和个人资料交接要求 | 素材阶段使用 |
| [`portfolio-v2-spec.md`](superpowers/specs/portfolio-v2-spec.md) | 产品与技术规格 | 下级约束 |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) | 分支、PR、合并与仓库内容规则 | 协作规则 |

## 使用规则

- 开始任务前先读 `PROJECT.md`，再读与本任务直接相关的文档。
- 新意见不要整段复制聊天，应提炼成明确决定写入 `decision-log.md`。
- 尚未确认的审美想法只能进入“待确认”，不能直接当作实施要求。
- 方向改变时，同一个 PR 必须同步更新事实源、方向文档和决定记录。
- 历史计划只解释过去如何实施，不得覆盖当前已确认方向。
