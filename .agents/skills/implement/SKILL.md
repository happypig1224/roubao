---
name: implement
description: >-
  基于已审批 Tickets/Plan 自动化执行代码落地与质量验证技能（Matt Skills 增强版）。
  内置写代码前强制冲突矩阵审查、TDD 红绿开发、Subagent 双轴 Review 审查与阶段 Git 留档。
---

# Implement Skill (代码执行与闭环验证)

> **核心宗旨**：拒绝未测试代码裸奔。编写代码前先解冲突，编写过程中 TDD 驱动，编写完成后由 Subagent 执行双轴 Review 质量把关。

---

## 执行流水线 (Execution Pipeline)

每一个 Ticket 的实现必须严格顺序经历以下四大阶段：

```
[Phase 0: 前置冲突审查] ➔ [Phase 1: TDD 红灯] ➔ [Phase 2: 外科手术实现] ➔ [Phase 3: 双轴 Review] ➔ [Phase 4: Git留档]
```

### 0. 编写代码前：前置冲突矩阵审查 (Pre-Implementation Conflict Check)
- **硬性拦截**：敲下第一行代码前，强制将本 Ticket 的设计方案与项目现有的规则与约束文件进行交叉比对：
  - 对照 [AGENTS.md](file:///c:/Users/33046/Desktop/vivibon.ai/AGENTS.md) 权限分级与铁律；
  - 对照 [08-核心架构决策记录汇总-ADR-ALL-V1.0.md](file:///c:/Users/33046/Desktop/vivibon.ai/docs/02_methodology_and_rules/08-核心架构决策记录汇总-ADR-ALL-V1.0.md) 18 项核心决策；
  - 对照 [10-AI-Native极简工程与Solo-OPC开发法-SPEC-PLAN-V1.0.md](file:///c:/Users/33046/Desktop/vivibon.ai/docs/02_methodology_and_rules/10-AI-Native极简工程与Solo-OPC开发法-SPEC-PLAN-V1.0.md)；
- **发现冲突时，先列出并解决冲突；确认零冲突后，方可进入编码**。

### 1. 测试先行 (TDD Red Light)
- 严格遵循红绿重构循环：
  1. 优先创建针对当前 Ticket 的自动化单元测试或端到端状态机测试；
  2. 运行测试，**确保测试如期失败（Red）**，证明测试用例有效且非假阳性。

### 2. 外科手术式编码 (Surgical Implementation - Green Light)
- 仅修改 Ticket 声明范围内的文件；
- 只写刚好解决当前问题的最小代码量，绝不擅自重构或修改无关代码风格；
- 再次运行测试，**确保全部通过（Green）**。

### 3. 隐式 Subagent 双轴 Review (Dual-Axis Automated Code Review)
- 代码编写完毕后，自动在后台唤起子代理执行双轴防腐审查（无需人工手动发起）：
  - **轴线 A (业务与契约轴)**：比对 Spec 与 OpenAPI 契约，核查参数校验、边界处理与错误码一致性；
  - **轴线 B (架构与安全轴)**：核查事务范围、慢调用隔离、NPE 防御、SQL 注入、IDOR 越权与大字段 IO 风险。
- 发现 P0/P1 隐患必须在本地原地修复，严禁将带病代码交付。

### 4. 阶段 Git 提交留档 (Commit Checkpoint)
- 本切片测试与 Review 全部绿灯后，自动执行规范的 Git 原子提交：
  - 格式：`feat(模块): 完成 Ticket-xxx 描述 [VERIFIED]` 或 `fix(模块): 修复 xxx 缺陷 [VERIFIED]`；
  - 确保代码库随时具备无损可回滚基线。
