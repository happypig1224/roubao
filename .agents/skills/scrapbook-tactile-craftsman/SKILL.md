---
name: scrapbook-tactile-craftsman
description: >-
  时光手账与实体相册工匠设计技能。
  专为高情感价值伴宠记忆相册、手账卡片堆叠、实体书口彩色切边、梦幻水彩羽化照片与复古手写时光轴量身定制，
  指导构建兼具治愈温度、实体物理厚度与高密回忆陈列的顶级前端交互体验。
---

# Scrapbook Tactile Craftsman Skill (时光手账与实体相册工匠)

> **定位**：专为 ViviBon-AI 伴宠记忆馆打造，将冰冷的数字数据转化为“一本本带有温度、翻开满是回忆”的实体手账书卷。
> **核心美学哲学**：Warm Tactile Paper（温润特种纸质感）、Physical Book Stacks（多层实体切边厚本）、Fluid Mosaic Grid（高密治愈照片墙）、Feathered Dreamscape（水彩柔化渐隐羽化）。

---

## 1. 触发时机 (Trigger Condition)

当出现以下场景时，强制激活并严格执行本 Skill：
1. 构建、重构或优化伴宠素材相册、回忆时光轴、年度回顾、照片集时；
2. 实现卡片的多层纸质堆叠效果（多层内页外露、彩色书脊边缘 Color-Edge）；
3. 实现高密照片网格（4 列或多列均匀正方形方阵）与月份时间段聚合时；
4. 实现照片大图沉浸查看器中边缘向背景自然水彩羽化渐隐（Soft Vignette）时。

---

## 2. 核心工法与 CSS 原生建模规约

### 2.1 实体手账本厚度建模 (Physical 3D Book Stack)
严禁使用单张扁平薄片卡片表示年度相册。必须通过伪元素与精准阴影构建出**“内页层叠 + 外层彩色精装底衬”**的物理书块感：

```css
/* 实体相册块基础模型 */
.scrapbook-volume-stack {
  position: relative;
  border-radius: 26px;
  background-color: #ffffff;
  /* 模拟右侧与底部层叠的白色纸张内页 */
  box-shadow:
    /* 第 1 层内页露出 */
    4px 4px 0 0 #f5f3ef,
    /* 第 2 层内页厚度 */
    8px 8px 0 0 #ffffff,
    /* 物理漫反射下沉阴影 */
    12px 18px 30px -4px rgba(44, 39, 35, 0.12),
    0 4px 10px -2px rgba(44, 39, 35, 0.05);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 外层彩色切边封底衬（Color Edge Gilt） */
.scrapbook-volume-stack::after {
  content: "";
  position: absolute;
  inset: -2px -12px -12px -2px;
  border-radius: 30px;
  background-color: var(--book-spine-color, #38bdf8); /* 年度主题色：天蓝/明黄/红/绿 */
  z-index: -1;
  box-shadow: 14px 20px 32px -6px rgba(0, 0, 0, 0.16);
}
```

### 2.2 动态书本厚度映射法则 (Count-to-Thickness Ratio)
根据真实拥有的照片数量计算厚度级别：
- **薄册（< 10 张）**：底衬厚度 6px，露出 1 层白页；
- **典藏（10 ~ 50 张）**：底衬厚度 10px，露出 2 层白页；
- **巨著（> 50 张）**：底衬厚度 14px，露出 3 层白页；
通过视觉厚度直观反馈陪伴时间长短，赋予用户强烈的陪伴成就感。

### 2.3 梦幻水彩羽化遮罩（Feathered Vignette Masking）
严禁在大图沉浸查看时呈现生硬的黑白直角框。必须利用 CSS 径向羽化遮罩将照片边缘柔化晕染进纸面：

```css
.feathered-polaroid-frame {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.feathered-polaroid-img {
  width: 100%;
  max-width: 320px;
  height: auto;
  border-radius: 36px;
  /* 核心：径向羽化遮罩算法，边缘 35% 范围内平滑渐变到 0 透明度 */
  mask-image: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 1) 62%,
    rgba(0, 0, 0, 0.75) 75%,
    rgba(0, 0, 0, 0.2) 88%,
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask-image: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 1) 62%,
    rgba(0, 0, 0, 0.75) 75%,
    rgba(0, 0, 0, 0.2) 88%,
    rgba(0, 0, 0, 0) 100%
  );
  filter: contrast(1.02) saturate(1.04);
}
```

### 2.4 月度 4 列高密照片矩阵（4-Column Memory Mosaic）
- 正方形等比切图：`aspect-ratio: 1 / 1; object-fit: cover;`；
- 间隙微收紧：`gap: 5px` ~ `6px`，网格紧凑整齐；
- 紧致微圆角：子照片采用 `border-radius: 4px` ~ `6px`；
- 懒加载防抖：预留轻量米灰骨架占位色（`#EFECE6`），杜绝高度跳变。

---

## 3. 色彩、纸感与手写排版规范

### 3.1 纸质温润色彩空间
- **特种纸主背景**：`#FAF7F2`（温暖米纸）或 `#FBF9F5`；
- **书页乳白**：`#FFFFFF` 与 `#F6F4EE`；
- **墨水炭黑**：标题 `#2D2926`，正文 `#4A443F`，时间戳与日期 `#78716C`；
- **年度切边色轮（Year Color Cycle）**：
  - 蓝色纪元：`#38BDF8`（晴空蓝）
  - 黄色纪元：`#FBBF24`（暖阳金）
  - 红色纪元：`#F43F5E`（活力绯红）
  - 绿色纪元：`#22C55E`（生机草绿）

### 3.2 手写字体族配置
```css
/* 手写温润标题族 */
font-family: 'Patrick Hand', 'Caveat', 'Kalam', 'Segoe Print', 'Bradley Hand',
             -apple-system, BlinkMacSystemFont, sans-serif;
```
- 年份水印印刻：使用封面内部白色手写半透明年份透字（`color: rgba(255, 255, 255, 0.88); text-shadow: 0 2px 8px rgba(0,0,0,0.25)`）；
- 时间戳与场景标签：居中排版，上下两行，字距温和舒展（`letter-spacing: 0.02em`）。
