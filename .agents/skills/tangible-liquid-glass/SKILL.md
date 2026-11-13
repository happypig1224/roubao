---
name: tangible-liquid-glass
description: >-
  温润实体液态玻璃工匠设计技能。
  基于 Apple HIG SwiftUI glassEffect、iOS 18 空间光学美学、Rauno Freiberg/Emil Kowalski 设计工程标准与 Jakub Krehel 界面质感哲学，
  专为消灭生硬死灰色阶、构建具备光学折射、单边镜面高光、同心超椭圆连续曲率与物理微缩触感的顶级温润流体玻璃界面。
---

# Tangible Liquid Glass Craftsman Skill (温润实体液态玻璃工匠设计)

> **定位**：专为 ViviBon-AI 伴宠记忆馆定制。彻底终结数字界面中生硬、脏浊、塑料感的水泥灰（Muddy Grey Eradication），将悬浮控件、切换器、操作按钮与标签徽标升维为具备光学折射率、天顶单边微高光与温润实体微触感的 Apple 级空间信物。
> **核心四大基石**：
> 1. **Specular Over Border**：天顶镜面单边高光替代粗暴实线描边；
> 2. **Refractive Translucency**：高饱和度补偿折射 (`saturate(180%)`) 替代脏浊泥灰；
> 3. **Concentric Squircle**：严苛同心超椭圆几何连续曲率；
> 4. **Tactile Micro-Physics**：物理弹性微缩下陷与多层漫反射软阴影。

---

## 1. 触发时机 (Trigger Condition)

当出现以下场景时，强制激活并严格执行本 Skill：
1. 设计、重构或审查按钮、分段切换器（Segmented Control）、悬浮底栏（Dock）、标签徽标（Badges / Pills）、操作卡片与骨架屏时；
2. 界面代码中出现 `#f2f2f7`、`#f0f0f4`、`rgba(0,0,0,0.06)`、`#e5e5ea` 等未经光学调校的**死灰色块**或**生硬灰色实线描边**时；
3. 需要提升悬浮控件在背景（纯白纸感、照片、手绘信箱、天空）之上的空间层级与通透感时；
4. 实现可按压微交互、触觉弹性微缩与同心圆角嵌套对齐时。

---

## 2. 核心工匠法则与工程公式 (Core Doctrines & Physics)

### 2.1 天顶单边微光镜面法则 (The Top Specular Rim Rule)
真实物理玻璃只在面向天顶自然光的一侧产生高强度反光弧，四周均匀加框会使组件呈现“贴纸描边感”。
- **绝对禁绝**：`border: 1px solid rgba(0,0,0,0.1);` 或纯单色实线框；
- **工业级规约**：四周采用极微弱透光包裹，顶部注入 1px 晶体反光，底部赋予 1px 微深度压痕：
  ```css
  /* 顶级单边镜面微高光 */
  border: 1px solid rgba(255, 255, 255, 0.88);
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.95),   /* 顶部晶莹镜面反光 */
    inset 0 -1px 1px 0 rgba(0, 0, 0, 0.02);        /* 底部极微物理压痕 */
  ```

### 2.2 高折射饱和度补偿 (Refraction & Saturation Boost)
单纯的半透明与高斯模糊会吸收底层光线的生机，产生发暗、发黄或发灰的脏感。
- **绝对禁绝**：不透明灰底（`#f2f2f7`）或低透死白；
- **工业级规约**：底色采用 `rgba(255, 255, 255, 0.72~0.92)` 配合 `saturate(180%~190%)`，使穿透玻璃的底层色彩温润提亮：
  ```css
  background: var(--liquid-glass-surface-default, rgba(255, 255, 255, 0.82));
  backdrop-filter: blur(20px) saturate(185%);
  -webkit-backdrop-filter: blur(20px) saturate(185%);
  ```

### 2.3 同心超椭圆连续曲率 (Concentric Border-Radius Formula)
容器与内部子项圆角绝不能相同，否则会导致拐角缝隙忽厚忽薄的廉价感。
- **物理定理**：$Radius_{inner} = Radius_{outer} - Padding$
- **标准规约**：
  - 药丸胶囊类：外容器 `border-radius: 9999px`，内嵌滑块 `border-radius: 9999px`，内边距必须保持 3px~4px 等距内嵌；
  - Bento 模组类：外容器 `padding: 16px; border-radius: 28px;`，内部卡片必须为 `28px - 16px = 12px`。

### 2.4 多层微透明漫反射环境软阴影 (Layered Ambient Shadows)
绝对严禁使用单层浓黑阴影。必须使用 2~3 层微透明度、大漫射半径的物理阴影组合模拟自然日光：
```css
/* 纯净通透浮动光影 (Float & Island) */
--liquid-glass-shadow-float:
  0 2px 6px -1px rgba(0, 0, 0, 0.03),
  0 8px 24px -4px rgba(0, 0, 0, 0.05);

--liquid-glass-shadow-island:
  0 2px 8px -1px rgba(0, 0, 0, 0.06),
  0 1px 2px 0 rgba(0, 0, 0, 0.02);
```

### 2.5 实体微缩触感与弹簧阻尼 (Tactile Depress & Spring Physics)
拒绝生硬变暗变灰，采用物体真实的受压微缩下陷。
- **触感规范**：
  ```css
  transition:
    transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.18s ease,
    box-shadow 0.18s ease;

  &:active {
    transform: scale(0.96); /* 按钮下陷微缩 */
  }
  ```

### 2.6 硬件加速与无障碍降级 (Containment & Reduced Transparency)
- 玻璃材质统一声明 `contain: paint`，防止频繁的合成器层失效与掉帧；
- 适配系统级“减弱动态效果”与“降低透明度”：
  ```css
  @media (prefers-reduced-transparency: reduce) {
    .tangible-glass-surface {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      background: #ffffff !important;
    }
  }
  ```

---

## 三、 标准化 Design Tokens 物理常量规范

在工程中统一沉淀与调用的 CSS 变量标准：

```css
:root {
  /* ==========================================================================
     Tangible Liquid Glass Materials (Apple HIG & Design Engineering Standard)
     ========================================================================== */
  /* 材质底色 (透亮乳白，严禁死灰) */
  --liquid-glass-surface-subtle: rgba(255, 255, 255, 0.72);
  --liquid-glass-surface-default: rgba(255, 255, 255, 0.82);
  --liquid-glass-surface-elevated: rgba(255, 255, 255, 0.90);
  --liquid-glass-surface-active: #ffffff;

  /* 物理高斯模糊与折射率 */
  --liquid-glass-blur-sm: 12px;
  --liquid-glass-blur-md: 20px;
  --liquid-glass-blur-lg: 28px;
  --liquid-glass-saturate: 185%;

  /* 天顶单边镜面高光 */
  --liquid-glass-border-rim: 1px solid rgba(255, 255, 255, 0.88);
  --liquid-glass-specular-top: inset 0 1px 1px 0 rgba(255, 255, 255, 0.95);
  --liquid-glass-specular-recessed: inset 0 1px 2px 0 rgba(0, 0, 0, 0.04);

  /* 漫反射环境软阴影 */
  --liquid-glass-shadow-float:
    0 2px 6px -1px rgba(0, 0, 0, 0.03),
    0 8px 24px -4px rgba(0, 0, 0, 0.05);
  --liquid-glass-shadow-island:
    0 2px 8px -1px rgba(0, 0, 0, 0.06),
    0 1px 2px 0 rgba(0, 0, 0, 0.02);
}
```

---

## 四、 核心组件标准代码模板 (Component Canonical Blueprints)

### 1. 通透晶体胶囊徽标 (Glass Species Badge / Tag Pill)
用于伴宠属性标签、物种徽章、微状态：
```css
.glass-badge-pill {
  font-size: 11.5px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 9999px;
  background: var(--liquid-glass-surface-default);
  backdrop-filter: blur(var(--liquid-glass-blur-sm)) saturate(var(--liquid-glass-saturate));
  -webkit-backdrop-filter: blur(var(--liquid-glass-blur-sm)) saturate(var(--liquid-glass-saturate));
  border: var(--liquid-glass-border-rim);
  box-shadow:
    0 2px 6px -1px rgba(0, 0, 0, 0.04),
    var(--liquid-glass-specular-top);
  color: #3a3a3c;
  letter-spacing: -0.01em;
}
```

### 2. 液体毛玻璃操作按钮 (Liquid Action Button)
用于 Manage、Settings、次级操作胶囊：
```css
.liquid-glass-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  background: var(--liquid-glass-surface-elevated);
  backdrop-filter: blur(16px) saturate(var(--liquid-glass-saturate));
  -webkit-backdrop-filter: blur(16px) saturate(var(--liquid-glass-saturate));
  border: var(--liquid-glass-border-rim);
  box-shadow:
    var(--liquid-glass-shadow-island),
    var(--liquid-glass-specular-top);
  color: #1c1c1e;
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.18s ease;
}

.liquid-glass-btn:hover {
  background: #ffffff;
  box-shadow:
    0 4px 12px -2px rgba(0, 0, 0, 0.07),
    var(--liquid-glass-specular-top);
}

.liquid-glass-btn:active {
  transform: scale(0.96);
}
```

### 3. 悬浮流体玻璃切换舱 (Floating Glass Segmented Switcher)
用于双段/三段选项切换（如 Chronicle / Echoes）：
```css
/* 底槽：通透悬浮托盘 */
.glass-segmented-control {
  background: var(--liquid-glass-surface-subtle);
  backdrop-filter: blur(var(--liquid-glass-blur-md)) saturate(190%);
  -webkit-backdrop-filter: blur(var(--liquid-glass-blur-md)) saturate(190%);
  border: var(--liquid-glass-border-rim);
  box-shadow:
    var(--liquid-glass-shadow-float),
    var(--liquid-glass-specular-top);
  border-radius: 9999px;
  padding: 3px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
}

/* 选项按钮基类 */
.glass-segmented-item {
  flex: 1;
  min-width: 0;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: #8e8e93;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-segmented-item:hover:not(.active) {
  color: #1c1c1e;
}

/* 激活项：浮动白光岛 */
.glass-segmented-item.active {
  background: var(--liquid-glass-surface-active);
  color: #1c1c1e;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow:
    var(--liquid-glass-shadow-island),
    var(--liquid-glass-specular-top);
}
```

### 4. 悬浮 Dock 栏光泽活动岛 (Liquid Dock Active Island)
用于底部 Dock 栏活动态图标：
```css
.dock-tab-btn.active {
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow:
    0 3px 10px -2px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04),
    var(--liquid-glass-specular-top);
  border-radius: 50%;
}

.dock-tab-btn.active .tab-svg-icon {
  color: #1c1c1e;
  stroke-width: 2.2;
  transform: scale(1.08);
}
```

### 5. 扫光微澜温润骨架屏 (Luminous Shimmer Skeleton Placeholder)
彻底消灭大片死灰色块，赋予未加载卡片以呼吸感：
```css
@keyframes liquidSkeletonShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.liquid-skeleton-card {
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(242, 242, 247, 0.45) 50%,
    rgba(255, 255, 255, 0.85) 100%
  );
  background-size: 200% 100%;
  animation: liquidSkeletonShimmer 2.2s ease-in-out infinite;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
```

---

## 五、 门禁审查与自检清单 (Verification Checklist)

在任何界面交付或代码审查中，必须逐一断言以下 6 项指标：
1. [ ] **死灰清零**：DOM 中是否存在未经光学高斯模糊处理的 `#f2f2f7`、`#f0f0f4` 或生硬灰色描边？
2. [ ] **天顶光存在**：浮动的玻璃卡片或胶囊顶部是否具备 `inset 0 1px 1px 0 rgba(255,255,255,0.95)`？
3. [ ] **同心圆角一致**：外层容器与内部滑块是否满足同心圆角公式 $R_{inner} = R_{outer} - P$？
4. [ ] **底层色温透射**：透过玻璃是否能隐约看到底层场景，且因 `saturate(180%)` 而更加纯净温润？
5. [ ] **触觉弹性下陷**：所有可点击胶囊与按钮按下时是否具备 `active:scale-[0.96]` 弹簧反馈？
6. [ ] **无障碍降级保障**：在开启 `prefers-reduced-transparency` 时是否能安全平滑降级为高对比纯白？
