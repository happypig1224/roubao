---
name: better-ui
description: >-
  高精细节打磨与界面质感工程技能。
  基于 Jakub Krehel "Make Interfaces Feel Better" 哲学与工匠级视觉标准，
  指导执行同心圆角补偿（Concentric Radius）、多层柔和弥散阴影、光学居中与特种表面细节调校。
---

# Better UI Skill (高精细节打磨与界面质感工程)

> **定位**：解决“明明设计稿很精致，还原出来却感觉廉价、粗糙、生硬”的问题。通过数学与视觉感知的双重校准，实现真正高级、考究的界面质感。
> **核心原则**：Concentric Radii（同心圆角数学契合）、Layered Soft Shadows（多层弥散环境光）、Optical Centering（光学重心平衡）、Tactile Borders（微光内嵌边框）。

---

## 1. 触发时机 (Trigger Condition)

当出现以下情况时，强制激活并严格执行本 Skill：
1. 容器与其内部子元素存在圆角嵌套关系时；
2. 为卡片、书籍、弹窗、浮动工具栏配置阴影与立体层次时；
3. 排版图标、微标、手写字与文本基线时；
4. 审查界面边缘出现粗暴黑色描边、锯齿或灰暗色块时。

---

## 2. 核心工匠工法 (Craftsmanship Doctrines)

### 2.1 同心圆角嵌套法则 (Concentric Border-Radius Formula)
严禁内层元素与外层容器使用相同的 `border-radius`，否则会导致角落间隙忽宽忽窄的廉价感。
- **物理定理**：`Inner Radius = Outer Radius - Padding`
- **实践标准**：
  - 若外层相册容器 `padding: 16px`，外层圆角 `border-radius: 28px`；
  - 则内层照片/子元素圆角必须严格为 `28px - 16px = 12px`；
  - 若内层计算值 `<= 0`，则内层取 0（直角对齐）。

### 2.2 多层柔和漫反射环境阴影 (Layered Ambient Shadows)
绝对严禁使用单层死黑阴影（如 `box-shadow: 0 4px 10px #000`）。必须使用 3~4 层微透明度、大漫反射半径的物理阴影组合，以模拟真实漫射光：

```css
/* 实体书册/高阶卡片自然漫反射阴影 */
.tangible-card-shadow {
  box-shadow:
    0 1px 2px rgba(28, 25, 23, 0.03),
    0 4px 8px rgba(28, 25, 23, 0.04),
    0 12px 24px -4px rgba(28, 25, 23, 0.06),
    0 24px 48px -12px rgba(28, 25, 23, 0.08);
}
```

### 2.3 物理微光内衬边（Tactile Inset Rim）
为了让卡片在米白色纸张底色上拥有清晰的物理实体感，严禁使用明显的深色边框。采用微透叠边：
```css
border: 1px solid rgba(255, 255, 255, 0.7);
box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8),
            0 10px 30px -10px rgba(0, 0, 0, 0.06);
```

### 2.4 光学对齐与视觉重心 (Optical Alignment)
- **手写字体与图标混排**：手写字体通常有向上的字怀或倾斜基线，必须通过 `transform: translateY(-0.5px ~ -1px)` 补偿视觉下坠感；
- **小红点/标签胶囊**：药丸形胶囊的水平内边距必须是垂直内边距的 1.6~2 倍，避免呈现臃肿的椭圆。
