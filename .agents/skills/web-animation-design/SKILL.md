---
name: web-animation-design
description: >-
  高级 Web 动效设计与工程标准技能。
  基于 Emil Kowalski "Animations on the Web" 权威哲学与 Linear/Vercel 动效系统，
  指导构建严谨自然、零布局抖动（Layout Thrashing）、具备真实物理惯性与中断自适应的 60fps 流体动效。
---

# Web Animation Design Skill (Emil Kowalski 级 Web 动效系统)

> **定位**：杜绝平庸生硬的默认 `ease` 线性动效，为复杂的视图展开、卡片翻转、浮层下钻建立具有真实质量、阻尼与惯性的高阶物理动效流。
> **核心原则**：Physics-Based Curves（物理缓动曲线）、Time Budgets（严苛时长预算）、Compositor Performance（GPU 合成保障）、Fluid Interruptibility（动效中断平滑衔接）。

---

## 1. 触发时机 (Trigger Condition)

当出现以下情况时，强制激活并严格执行本 Skill：
1. 实现弹窗打开/关闭、抽屉展开、全屏沉浸下钻（Zoom-in Expansion）转场时；
2. 构建多卡片级联进场（Staggered Entrance）或列表排版重组动效时；
3. 处理带有物理旋转角度（Jitter/Tilt）、翻页或拟真厚度层叠变化时；
4. 审查前端 CSS 过渡或 JS 动画性能存在掉帧、卡顿或闪烁时。

---

## 2. 动效曲线与物理时长预算规约 (Physics & Timing)

### 2.1 缓动曲线标准 (Bézier Presets)
绝对禁用浏览器默认的 `ease` 与纯线性 `linear`（除连续旋转跑马灯外）。统一使用以下经过感知校准的物理 Bézier 曲线：

- **Decelerate / 优雅进场（进入视口减速静止）**：
  ```css
  --ease-out-spring: cubic-bezier(0.16, 1, 0.3, 1); /* 强烈推荐主视图/弹窗进场 */
  ```
- **Accelerate / 果断退场（离开视口加速消失）**：
  ```css
  --ease-in-swift: cubic-bezier(0.7, 0, 0.84, 0);
  ```
- **Standard S-Curve / 原位状态切换（平滑缓动）**：
  ```css
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  ```

### 2.2 时长预算基线 (Duration Budgets)
- **微交互与状态反馈（按钮点击、阴影微调）**：`120ms` ~ `180ms`；
- **组件级展开与收折（下拉菜单、分类标签滑动）**：`220ms` ~ `280ms`；
- **全屏沉浸转场与下钻（年度相册展开至月度网格）**：`350ms` ~ `450ms`；
- **任何常规 UI 交互严禁超过 500ms**，防止给用户带来冗长焦躁等待。

---

## 3. 流体转场与空间连续性 (Spatial Continuity)

### 3.1 共享元素跃迁（Shared Element Transition）
- 当用户从低维卡片（如年度封面）点击进入高维画册（如月度网格）时，必须保持视觉重心的空间连续性；
- 避免整体白屏重刷，使用原位缩放与交叉淡入淡出（Cross-fade）：
  ```css
  .book-expand-enter {
    opacity: 0;
    transform: scale(0.94) translateY(12px);
  }
  .book-expand-enter-active {
    opacity: 1;
    transform: scale(1) translateY(0);
    transition: opacity 320ms var(--ease-out-spring),
                transform 360ms var(--ease-out-spring);
  }
  ```

### 3.2 级联微延迟（Staggered Cascade）
- 当多个元素同时登场时，避免机械统一弹出，采用等比微延迟（15ms ~ 30ms 步进）：
  ```css
  .grid-item:nth-child(n) {
    animation-delay: calc(n * 25ms);
  }
  ```

---

## 4. 性能死守铁律 (Compositor Only Rule)
- 动画只准修改 `transform` 与 `opacity`；
- 显式声明 `will-change: transform, opacity`，并在动画结束后重置；
- 严禁通过 JS 每帧修改 DOM style 计算样式；
- 必须强制注入 `@media (prefers-reduced-motion: reduce)` 瞬时就位后备规则。
