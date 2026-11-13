---
name: grill-me
description: >-
  通用深度质询与决策对齐技能（Matt Pocock 经典通用 Grill-Me 模式）。
  在动手写代码或产出最终方案前，像决策树一样逐项对计划进行穷追猛打式的单步提问，
  一次仅提一个问题并附带推荐答案，层层解析依赖，直到双方达成完全一致的理解。
---

# Grill-Me Skill (通用深度质询与决策对齐)

> **核心指令**：
> "Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer. Ask questions one at a time. Do not produce any code or final plans until I confirm we have a shared understanding."

---

## 执行核心原则 (Core Rules)

1. **第一阶段：术语锁定 (Term Anchoring First)**：
   - Grill 前期强制先锁定需求中的核心术语清单，逐一确认定义、范围与歧义。
   - **核心术语完全拉齐前，严禁展开业务逻辑设计与边界澄清**。
2. **第二阶段：“30 + 20” 熔断与纠偏 (Anti-Branching Circuit Breaker)**：
   - 提问达 30 题时强制暂停，执行自查提示词：
     > *“暂停拷问：请重点确认业务目标、使用场景、业务流程、业务规则、异常情况和功能边界是否还有核心业务需求未明确？是否还有关键边界或异常情况未确认？是否存在相互矛盾的描述？如果没有就结束提问并输出需求确认文档。”*
   - 无核心未决直接截断输出；必要时追加 20 题复核后再次强制截断。严禁开枝散叶无限追问。
3. **逐枝遍历决策树 (Walk the Tree)**：
   - 将整个系统/功能拆解为决策树分支（如：数据模型、用户旅程、异常降级、性能边界等），按依赖顺序由浅入深推进。
4. **一次仅提一个问题 + 高密度选项驱动 (One Question & High Density Options)**：
   - 绝对禁止一次性抛出一大串问卷轰炸。一次只提一个问题；
   - 必须给出 2~3 个架构级推荐选项及 `(Recommended) 推荐方案`，帮助决策者快速拍板。
5. **物理落盘抗失忆 (Disk > Context Memory)**：
   - 每一个已确认的决策点必须立即写入物理文档或临时文件，严禁依赖受压缩的对话记忆。
6. **达成共识前严禁写代码 (No Code Before Alignment)**：
   - 在用户明确确认“达成共识”之前，严禁直接编写任何业务代码或最终实施方案。
