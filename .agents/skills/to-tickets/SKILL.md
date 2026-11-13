---
name: to-tickets
description: >-
  将已确认的 Spec 规约拆解为细粒度、Outside-In 纵向切片的可执行 Tickets/Plan 清单（Matt Skills 增强版）。
  为每个切片定义明确的修改文件范围、前置依赖、失败测试蓝图与完成准据。
---

# To-Tickets Skill (Spec 拆解为执行卡片与任务清单)

> **核心宗旨**：拒绝臃肿大任务。通过 Outside-In 纵向切片（Vertical Slice），将庞大的 Spec 拆分为一系列低耦合、高可验证的独立原子工单（Tickets）。

---

## Ticket 结构标准 (Ticket Specification)

每一个生成的 Ticket 必须具备以下标准化结构：

```markdown
### [Ticket-ID] 任务标题简述

- **目标与职责**：一句话描述本切片解决什么具体业务问题；
- **文件改动范围**：
  - `[NEW]` 待新建的文件路径
  - `[MODIFY]` 待修改的文件路径及具体方法
- **前置依赖**：依赖的 Ticket ID 或前置契约；
- **验收红绿门禁 (TDD Blueprint)**：
  - 必须编写的失败测试文件与核心断言；
  - 运行命令与预期通过标准；
- **防腐与安全检查项**：本切片必须规避的反模式（如：无事务套模型调用、无未测试代码）。
```

---

## 切片切分铁律 (Slicing Principles)

1. **纵向端到端优先 (Outside-In First)**：
   - 优先切通一条完整的垂直链路（如：从 API 端点 $\rightarrow$ 服务层 $\rightarrow$ 状态机 $\rightarrow$ 审计日志），而非横向地把所有表建完再写所有 Controller；
2. **单一职责与最小代码量 (Karpathy's Simplicity)**：
   - 每个 Ticket 仅包含刚好解决当前切片的最小代码量，严禁过早抽象和过度设计；
3. **物理落盘**：
   - Tickets 清单必须落盘保存为任务执行文件（如 `implementation_plan.md` 或独立工单文件），供后续 `implement` 工具逐步核销。
