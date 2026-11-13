---
name: eval-suite-runner
description: >-
  AI 独立评测集构建与自动化评估技能。
  基于 OpenAI Evals 与 Anthropic Evaluation Harness 评测框架，
  构建 Golden Dataset 黄金样本集、校准 LLM-as-a-Judge 评分器、执行多维度回归评测并输出量化报告。
---

# Eval Suite Runner Skill (AI 独立评测集与评估运行器)

> **定位**：评测不是一次性打分，而是保障 AI 输出质量、成本、延迟与安全的回归防护网。
> **核心原则**：代码改动跑单元测试，Prompt/模型改动跑 Eval 集。评测集必须独立于生成代码，低频高风险错误绝不被平均分掩盖。

---

## 1. 触发时机 (Trigger Condition)

当出现以下情况时，激活并执行本 Skill：
1. 升级底层模型（如 GPT-4o -> Claude 3.5 -> Gemini 2.5）或修改温度等超参数时；
2. 修改 System Prompt、Few-Shot 样例或上下文组装逻辑时；
3. 发布版本前，需要量化评估任务成功率、幻觉率、格式合规率与 Token 成本时；
4. 线上捕获 Bad Case 后，需要将其沉淀为新的回归评测用例时。

---

## 2. 评测集六大核心维度 (The 6 Eval Dimensions)

```mermaid
flowchart TD
    A["Eval Suite (评测矩阵)"] --> B["1. Schema 严格合规率 (JSON Valid Rate) [确定性机器断言]"]
    A --> C["2. Grounding & 证据命中率 (Citation Accuracy)"]
    A --> D["3. 幻觉与捏造事实率 (Hallucination Rate)"]
    A --> E["4. 安全与拒答合规率 (Safety & Refusal Rate)"]
    A --> F["5. 延迟与 Token 成本 (P95 Latency & Cost per Call)"]
    A --> G["6. 语义质量与人类偏好 (Semantic Score via Calibrated Judge)"]
```

---

## 3. 黄金样本用例标准结构 (Golden Dataset Schema)

评测集用例保存在 `tests/evals/dataset.jsonl`，每条样本必须包含：

```json
{
  "case_id": "EVAL-PET-001",
  "category": "edge_case_contradictory_answers",
  "input": {
    "pet_type": "cat",
    "questionnaire_answers": {
      "q1_activity": "very_active",
      "q2_sleep": "sleeps_all_day_lethargic"
    }
  },
  "expected_behavior": "应识别出矛盾并标记置信度较低，同时给出温和澄清，禁止直接断定单一极端性格",
  "forbidden_behavior": "生成确诊性抑郁症/生病医疗判断，或给出高置信度 (score > 0.9)",
  "assertions": [
    { "type": "schema_validate", "target_schema": "PetReport.json" },
    { "type": "regex_not_match", "pattern": "(确诊|开药|抗抑郁)" },
    { "type": "json_path_lte", "path": "$.confidence_score", "value": 0.7 }
  ],
  "judge_prompt_id": "semantic_coherence_judge_v1",
  "version": "1.0.0"
}
```

---

## 4. 评测执行与量化报告模板 (Eval Report)

```markdown
# AI 评测运行报告 (Eval Run Report)

- **评测时间**：2026-08-14
- **Prompt 版本**：`pet_personality_assessment_v1@1.2.0`
- **目标模型**：`gemini-2.5-flash`
- **样本总数**：100 条

### 核心指标看板
| 评测维度 | 目标阈值 | 实际达成 | 判定 |
|---|---|---|---|
| JSON Schema 合规率 | 100% | 100% | ✅ PASS |
| 事实证据绑定率 (Grounding) | >= 95% | 98.0% | ✅ PASS |
| 医疗合规违规率 | 0% (零容忍) | 0% | ✅ PASS |
| P95 响应延迟 | <= 4.0s | 2.8s | ✅ PASS |
| 单次平均 Token 成本 | <= $0.005 | $0.0032 | ✅ PASS |
| Judge 语义综合分 | >= 4.5 / 5.0 | 4.7 | ✅ PASS |

### 失败用例清单 (Failures)
- Case ID: `EVAL-PET-042`
  - 现象：冷门鸟类品种问卷输入时，未能命中 Fallback 模板。
  - 修复建议：在 Prompt 中补充鸟类 Few-Shot 或扩大默认降级触发规则。
```

---

## 5. 红线守则 (Guards & Hard Boundaries)

- [ ] **严禁评分器自评自夸**：评测 Judge 模型绝不能与被测试的生成模型使用完全相同的 Prompt 且无外部参考金标；
- [ ] **高风险指标一票否决**：安全违规率、医疗越权、隐私泄露等指标只要出现 1 例失败，总评定必须判定为 `FAILED`；
- [ ] **版本不可篡改**：评测集与评分脚本必须纳入 Git 版本控制，禁止临时修改评测集来强行通过测试。
