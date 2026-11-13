---
name: agent-contract-designer
description: >-
  Agent 权限与工具契约设计技能。
  基于 Meta Llama Stack Tool Governance 与 Anthropic Model Context Protocol (MCP) 安全规范，
  定义 Agent 工具清单、权限作用域、步骤上限、成本预算、人工审批点（HITL）与紧急熔断（Kill-Switch）。
---

# Agent Contract Designer Skill (Agent 权限与工具契约设计)

> **定位**：设计受控、可预测、最小权限且具备熔断机制的自主 Agent 与工具调用链。
> **核心原则**：Agent 不是无所不能的黑盒。所有工具调用必须有显式白名单、参数强校验、幂等保护、步骤预算与紧急切断开关。

---

## 1. 触发时机 (Trigger Condition)

当出现以下情况时，激活并执行本 Skill：
1. 系统中引入需要自主规划、调用外部 API 或修改系统状态的 AI Agent 时；
2. 定义 Agent 的可用工具集（Tool Set）及其权限范围（Tool Scopes）时；
3. 为高风险动作（如删除数据、支付扣款、发送外部通知）设计人机协同审批（Human-in-the-loop）时；
4. 设定 Agent 执行的单次成本上限（Max Cost）、最大步数（Max Steps）与超时机制时。

---

## 2. Agent 运行契约结构 (Agent Contract Spec)

每个 Agent 在进入实现前，必须定义以下完整的运行时契约：

```yaml
agent_contract:
  agent_id: "pet-report-generator"
  version: "1.0.0"
  purpose: "基于问卷答案推理生成宠物性格分析报告"
  owner: "TechLead"

  # 1. 权限与工具白名单
  allowed_tools:
    - name: "fetch_questionnaire_answers"
      scope: "read_only"
      description: "读取用户提交的问卷原始答案"
    - name: "query_pet_knowledge_base"
      scope: "read_only"
      description: "检索经过人工审核的宠物性格标签库"

  forbidden_tools:
    - "modify_user_profile"      # 严禁直接改写用户主档
    - "execute_payment"          # 严禁执行支付操作
    - "send_external_message"    # 严禁对外直接发送营销通知

  # 2. 运行时配额与安全护栏
  guardrails:
    max_steps: 5                 # 最大自主规划步数，防止死循环
    timeout_seconds: 15          # 单次执行超时
    max_token_budget: 4000       # 最大 Token 消耗
    max_cost_usd: 0.05           # 单次任务成本上限
    idempotency_key_header: "X-Idempotency-Key"

  # 3. 人机审批点 (Human-in-the-loop)
  human_approval_required: false # 本 Agent 为只读生成型，若为 L3 动作则必须设为 true

  # 4. 故障与降级
  fallback_strategy:
    type: "DETERMINISTIC_TEMPLATE"
    template_id: "default_fallback_report_v1"
    trigger_on: ["TIMEOUT", "SCHEMA_VALIDATION_FAILED", "MAX_STEPS_EXCEEDED"]

  # 5. 紧急切断 (Emergency Kill-Switch)
  kill_switch:
    feature_flag_key: "killswitch_agent_pet_report_generator"
    behavior_when_disabled: "RETURN_FALLBACK_IMMEDIATELY"
```

---

## 3. 工具暴露五大铁律 (The 5 Tool Laws)

1. **显式 Port/Adapter 隔离**：工具不能直接透传数据库连接或 Shell 指令，必须是服务端包装后的显式接口；
2. **入参严格 Schema 校验**：所有工具入参必须先通过 Pydantic / Zod / JSON Schema 校验，非法参数直接打回；
3. **调用者身份继承**：工具执行时必须携带上下文用户身份（Auth Context），禁止跨租户或越权读取他人数据；
4. **幂等性与重试安全**：写操作工具必须支持幂等键（Idempotency Key），防止网络重试导致多次副作用；
5. **全量审计日志**：每次工具调用的输入、输出、耗时与 Token 开销必须写入结构化审计日志。

---

## 4. 红线守则 (Guards & Hard Boundaries)

- [ ] **严禁隐式提权**：Agent 绝不允许通过多轮 Prompt 诱导获取白名单之外的工具调用能力；
- [ ] **严禁无限递归**：所有 Agent 规划循环必须有硬编码的 `max_steps` 计数器，达到上限强制中断并报警；
- [ ] **高风险动作人工硬阻断**：任何涉及资金、权限变更、账户注销或数据清除的工具，必须在服务端实现物理拦截并等待人工签名。
