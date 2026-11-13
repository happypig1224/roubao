---
name: to-spec
description: >-
  将 Grill 质询与需求讨论成果一键固化为标准物理 Spec 规范文档（Matt Skills 增强版）。
  坚持“人定 Spec”权力边界，产出限定技术栈、数据契约、状态机与系统不变量的硬核物理规约。
---

# To-Spec Skill (需求固化为物理 Spec)

> **核心宗旨**：Spec 是硬法。人定 Spec，AI 定 Plan。AI 严禁自主发明或无序扩展架构，所有需求与设计必须通过严谨的物理文档落地。

---

## 核心输出规范 (Standard Spec Structure)

当 Grill 质询完成或用户指示输出 Spec 时，必须在 `docs/` 或指定路径生成物理 Spec 文档，包含以下六大章节：

1. **术语与概念字典 (Glossary & Terminology)**：
   - Grill 阶段确认的核心概念精确定义、命名规范与取值范围。
2. **业务能力与使用场景 (Use Cases & Flows)**：
   - 核心用户旅程、主流程步骤（Happy Path）与替代路径。
3. **数据结构与接口契约 (Data Contracts & APIs)**：
   - 强类型数据 Schema（JSON Schema / MySQL DDL 变更定义）；
   - 请求/响应契约、HTTP 状态码、业务错误码字典。
4. **状态机与微观流转 (Finite State Machine & Guards)**：
   - 实体生命周期 5 态流转（如：待支付/处理中/已完成/已失败/已退款）；
   - 前置守卫条件（Pre-conditions）与后置断言（Post-conditions）。
5. **系统不变量与安全护栏 (Invariants & Guardrails)**：
   - 绝对不可突破的底线（如：大模型慢调用禁止套事务、试用耗尽阻断 402、媒体零服务器带宽）。
6. **验收标准与交付清单 (Definition of Done, DoD)**：
   - 明确的客观验证用例清单（自动化测试通过标准）。

---

## 协同原则 (Collaboration Rules)

- **物理落盘**：Spec 必须立即写入文件，坚决抵御长对话上下文压缩带来的记忆漂移；
- **修改权归属**：AI 仅可挑出 Spec 盲区并提出完善建议，**Spec 的修改权与最终确认权 100% 归用户（CTO）所有**。
