---
name: micro-interactions
description: >-
  微交互与物理触感设计工程技能。
  基于 Dan Saffer 经典 4 步微交互框架与现代 Web 交互规范，
  指导构建具备真实物理按压触感（Tactile Feedback）、触觉回弹、状态防抖与无障碍降级的微交互系统。
---

# Micro-Interactions Skill (物理触感与微交互工程)

> **定位**：杜绝僵硬冰冷的数字界面，通过精细的触发器、规则与物理反馈，为每个按键、卡片与滑动动作注入温润、可感知的物理生命力。
> **核心原则**：Triggers（明确触发点）、Rules（确定性状态转移）、Feedback（物理级即时反馈）、Loops & Modes（自然循环与防抖）。

---

## 1. 触发时机 (Trigger Condition)

当出现以下情况时，强制激活并严格执行本 Skill：
1. 为按钮、卡片、切换开关、标签胶囊设计悬停（Hover）、聚焦（Focus）、按压（Active/Press）状态时；
2. 实现卡片点击、展开、删除、点赞、音频播放切换等高频局部交互时；
3. 处理连续快速点击、异步加载等待中的触觉与视觉状态同步时；
4. 编写涉及移动端触控的 `onTouchStart` / `onTouchEnd` 与 CSS `:active` 样式时。

---

## 2. Dan Saffer 四步微交互核心规约

### 2.1 触发器 (Triggers)
- **显式可点击暗示**：所有可交互元素必须具备明确的 Affordance（如光标悬停 `cursor: pointer`、微抬升阴影）；
- **命中区域放大（Hit Target Budget）**：移动端触控区域必须严格保证最低 `44px x 44px`，视觉尺寸较小时通过伪元素扩展命中热区。

### 2.2 规则与状态转移 (Rules)
- **排他性与互斥**：正在执行异步请求或过渡状态时，必须设置 `aria-busy="true"` 并挂起重复点击；
- **防抖与拦截**：所有破坏性或提交性操作强制增加 300ms 防抖或防暴力连击保护。

### 2.3 物理级即时反馈 (Feedback & Tactility)
- **按压下沉（Tactile Depress）**：
  ```css
  .tactile-depress {
    transition: transform 0.16s cubic-bezier(0.2, 0.8, 0.2, 1),
                box-shadow 0.16s cubic-bezier(0.2, 0.8, 0.2, 1);
    will-change: transform;
  }
  .tactile-depress:hover {
    transform: translateY(-1.5px);
  }
  .tactile-depress:active {
    transform: translateY(0.5px) scale(0.98);
  }
  ```
- **弹性回弹（Elastic Settle）**：按压释放时以物理弹簧阻尼回位，杜绝硬切停顿；
- **微光/内嵌反馈**：配合 subtle inset shadow 或微透明度蒙层表达受力形变。

### 2.4 性能与无障碍保障 (Performance & Accessibility)
- **强制 GPU 合成**：触控反馈动画严格限制在 `transform` 与 `opacity` 属性，严禁改变 `top`, `left`, `width`, `height`, `margin` 等重排重绘属性；
- **强制无障碍回退**：
  ```css
  @media (prefers-reduced-motion: reduce) {
    .tactile-depress {
      transition: none !important;
      transform: none !important;
    }
  }
  ```
