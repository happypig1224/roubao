# 去AI味 · 前后对比报告



audit/ui-pages-copy-before.md → audit/ui-pages-copy-after.md



标记约定：<del>删除线</del> = 被改掉/删掉的原文；<ins>下划线</ins> = 改后的新文字；指标表 ↓/↑ = 相对人类参考的改善/恶化。



## 一、指标前后对比



| 指标 | 改前 | 改后 | 变化 | 人类参考 |
|---|---|---|---|---|
| 不是A而是B 对举 | 0.0 | 0.0 | → | ≈0.22 |
| 结论提示冒号 | 0.0 | 0.0 | → | ≈0.08 |
| 密集并列 | 11.291 | 10.737 | → | ≈1.78 |
| 前置定语长 | 0.0 | 0.0 | → | ≈0.1 |
| 句长起伏 | 0.844 | 0.831 | → | 人类≈0.54 / AI≈0.46 |
| 节长参差 | 1.778 | 1.786 | → | 人类≈0.83 / AI≈0.31 |
| 分节密度 | 9.174 | 9.306 | → | 人类≈0.32 / AI≈1.26 |
| 相邻句同构 | 1.68 | 1.68 | → | 人类≈5.52 / AI≈8.71 |
| 三连同构(粗筛) | 0.0 | 0.0 | → | 人类≈0.41 / AI≈0.84 |
| 换词多样性 | 356 | 309 | → | 人类≈143 / AI≈227 |
| 破折号（指纹） | 0.0 | 0.0 | → | Opus 狂用 +0.95 / GPT 少用 −0.54，方向相反分模型看 |
| 分号（指纹） | 7.763 | 7.874 | → | GPT 指纹 δ+0.80；Opus 无差 |
| 引号（指纹） | 0.0 | 0.0 | → | Opus 偏少 δ−0.67，报告用不改 |

↓/↑ = 向人类参考方向改善/恶化；指纹行不判方向。参考值=270 对同题配对实测人类中位（每千字或 CV 值），见 RESEARCH.md。

## 二、分级问题清单（改前检测）



### B 级 · 建议改（模型逐条筛选后处理）

**顿号并列≥3** 16 处

- `ui-pages-copy-before.md:4`　情 /blog/[slug]、404 引导页、后台管理 /admin)
- `ui-pages-copy-before.md:115`　数据结构与算法、计算机网络、计算机组成原理
- `ui-pages-copy-before.md:115`　操作系统、程序设计语言、数据库原理等
- `ui-pages-copy-before.md:121`　深入理解 ArrayList、HashMap、ConcurrentHash
- `ui-pages-copy-before.md:121`　掌握反射机制、动态代理技术、虚拟线程（Virtual T
- `ui-pages-copy-before.md:121`　握 synchronized、ReentrantLock、CAS
- `ui-pages-copy-before.md:121`　AQS、ThreadLocal、volatile 等底层并发
- `ui-pages-copy-before.md:125`　ing 全家桶（Spring、SpringMVC、SpringBoot 3）与
- `ui-pages-copy-before.md:125`　掌握 Bean 生命周期、IoC/AOP 底层实现、事务传播机制与失效场景
- `ui-pages-copy-before.md:125`　 Alibaba（Nacos、Feign、Gateway
- `ui-pages-copy-before.md:129`　理能力（Explain 分析、覆盖索引、深分页优化）
- `ui-pages-copy-before.md:129`　久化（RDB/AOF/混合）、内存淘汰、过期策略与哨兵高可用集群
- `ui-pages-copy-before.md:137`　熟悉前端技术栈（HTML5、CSS3、JavaScript
- `ui-pages-copy-before.md:137`　Vue3、Next.js、Axios）
- `ui-pages-copy-before.md:137`　熟练使用 Git、Maven、Linux 常用运维命令
- `ui-pages-copy-before.md:177`　实时汇总文章冷热数据、发布状态、分类分布与开源展厅指标


C 级（结构/节奏）见指标表；F 指纹见表内指纹行；比喻贴切度只能人审；本轮默认保留。用户主动要求时再列出相关原句供判断。



## 三、前后对照（改后稿全文，改动处标记）



# Roubao 全栈 UI 页面真实文案汇总 (由 Playwright 真实渲染提取)

> 提取时间: 2026-11-21T07:0<del>2</del><ins>8</ins>:<del>25</del><ins>04</ins>.3<ins>3</ins>9<del>5</del>Z
> 提取页面数量: 4 大核心路由 (首页 /、文章详情 /blog/[slug]、404 引导页、后台管理 /admin)

---

## 📄 首页 (/) 

### 🔹 顶部导航栏 (Navbar)

概览

项目

文章

### 🔹 首屏简介区 (Hero)

2027届全日制本科 · 计算机科学与技术

开放实习交流 · 后端开发 & AI 工程化

苦恼的肉包🍔

我一直在努力成为更好的自己 · Java 后端开发工程师

你好，我是苦恼的肉包🍔。目前是 2027届全日制本科计算机科学与技术专业在读，专注 后端开发 与 大模型工程化落地。

工程上推崇 Specs Coding（<del>SDD </del>规范<del>驱动 / TDD </del><ins>与</ins>测试驱动）开发<del>模式</del>，<del>熟练运</del><ins>平时</ins>用 Claude Code、Gemini 等<del> AI </del><ins>工具</ins>辅助编<del>程工具提升研发效能</del><ins>写单元测试</ins>与<del>工程质量</del><ins>重构代码</ins>。

工程履历 / 简历

GitHub

Email

### 🔹 开源项目展厅 (ProjectsSection)

FEATURED ENGINEERING WORK

代表开源项目展厅

<del>围绕单机极致吞吐</del><ins>平时在服务端高并发</ins>、<del>轻量化分布式</del><ins>链路</ins>追踪与现代<del> Web </del><ins>前端</ins>交互<ins>方面写</ins>的<del>工程</del><ins>真</ins>实<del>践</del><ins>代码</ins>

暂无已公开发布的开源项目

### 🔹 技术文章专区 (BlogSection)

TECHNICAL JOURNAL

技术文章与博客

记录<del>高性能</del><ins>后端</ins>架构、JVM 虚拟线程实测与<del>工匠级</del>前端<del>细节</del><ins>交互开发的心得</ins>

RSS

暂无已公开发布的技术文章

### 🔹 页脚版权与联系方式 (Footer)

苦恼的肉包

© 2026

binary.soul.dev@outlook.com

GitHub

### 🔹 简历抽屉弹窗 (ResumeSheet)

苦恼的肉包🍔 · 个人工程履历

Java后端开发

2027届全日制本科 · 计算机科学与技术

·

Java后端 & AI工程化

·

binary.soul.dev@outlook.com

学历与专业

2027届全日制本科

计算机科学与技术专业

竞赛与荣誉

国家三等励志奖学金

计算机能力挑战赛省三等奖

AI 原生开发

Specs / SDD / TDD

Claude Code / Gemini 辅助

教育背景与在校表现

2023-09 ~ 2027-07

培养层次：2027届全日制本科

主修专业：计算机科学与技术

个人荣誉：全国计算机能力挑战赛程序设计东北赛区本研组三等奖、国家三等励志奖学金

主修课程：数据结构与算法、计算机网络、计算机组成原理、操作系统、程序设计语言、数据库原理等

专业技能深度

1. Java 核心与并发编程

深入理解 ArrayList、HashMap、ConcurrentHashMap 等集合底层源码；掌握反射机制、动态代理技术、虚拟线程（Virtual Threads）；精通 JVM 内存模型、类加载机制与双亲委派模型，熟悉常见 GC 算法及 CMS/G1 收集器；掌握 synchronized、ReentrantLock、CAS、AQS、ThreadLocal、volatile 等底层并发原理，熟练运用 CompletableFuture 异步任务编排优化响应耗时。

2. 框架与微服务生态

熟练掌握 Spring 全家桶（Spring、SpringMVC、SpringBoot 3）与 MyBatis-Plus 系列框架；掌握 Bean 生命周期、IoC/AOP 底层实现、事务传播机制与失效场景、自动装配原理；熟悉 Spring Cloud Alibaba（Nacos、Feign、Gateway、Sentinel）微服务体系与 Dubbo + Zookeeper 服务治理。

3. 数据存储与中间件治理

深入理解 MySQL InnoDB 存储引擎与 B+ 树索引结构，具备慢 SQL 深度排查与索引治理能力（Explain 分析、覆盖索引、深分页优化）；深入掌握 Redis 核心结构、持久化（RDB/AOF/混合）、内存淘汰、过期策略与哨兵高可用集群，具备穿透/击穿/雪崩三大热点问题治理与 Redisson 分布式锁实战经验；掌握 RocketMQ 消息模型与消息可靠性治理（防丢失/防重/堆积削峰/顺序消费）。

4. AI 工程化与大模型应用

熟悉 RAG（检索增强生成）全链路优化，熟练使用 Spring AI Alibaba 与 LangChain；熟悉混合检索（BM25+Vector）、重排序（Reranking）及元数据过滤技术，有效抑制大模型幻觉；具备 LLM 推理加速实战经验，运用并行上下文组装、流式输出与懒加载策略优化端到端延迟；掌握 Token 感知滑动窗口算法降低模型调用成本。

5. 前端与工程化 DevOps

熟悉前端技术栈（HTML5、CSS3、JavaScript、Vue3、Next.js、Axios），具备前后端全链路联调与接口调试能力；熟练使用 Git、Maven、Linux 常用运维命令、Docker 容器化部署、JMeter 压力测试与 Postman 接口测试。

个人优势与工程素养

<del>AI 原生工程实战：具备前沿的 AI Agent 与</del>大模型<del>落地</del><ins>工程化：</ins>实<del>战、</del><ins>践过 RAG 检索链路与元数据过滤，用滑动窗口与并行组装</ins>降低<del>大模型</del><ins>延迟，关注减少生成</ins>幻觉<del>经验，紧跟 AI 辅助研发前沿</del>。

<ins>规范与测试驱动：遵循 </ins>Specs Coding <del>规范</del>开发<del>：遵循</del><ins>模式，结合</ins> SDD 与 TDD<del> 开发模式</del>，<del>熟练使</del><ins>运</ins>用 Claude Code、Gemini <del>进行 AI </del>辅助编<del>程，提升</del><ins>写测试与重构</ins>代码<del>鲁棒性与开发质量</del>。

<del>团队协作与</del><ins>工程交付习惯：能</ins>独立<del>交付：具备参与团队项目从 0 到 1 的协作与独立</del><ins>负责</ins>模块<del>攻坚交付经验</del><ins>开发与接口联调</ins>，<del>具备</del><ins>习惯在</ins>敏捷<ins>迭代中持续</ins>沟通与<del>持续学习能力</del><ins>复盘</ins>。

binary.soul.dev@outlook.com

发送邮件

.md

下载简历 (PDF)

## 📄 404 异常提示页

### 🔹 404 缺省引导卡片

404 NOT FOUND

页面或文章未找到

你访问的内容可能已变更别名、被归档或链接有误。请使用下方按钮返回主站。

返回主页

浏览技术文章

## 📄 后台管理系统 (/admin)

### 🔹 大盘仪表盘 (DashboardView)

系统大盘总览

<del>实时</del>汇总<ins>全站</ins>文章<del>冷热数据</del><ins>浏览</ins>、发布状态<del>、</del><ins>与各</ins>分类<del>分布与开源展厅指标</del><ins>数据</ins>

刷新数据

总博文数

12

已发布上线

10

草稿箱

2

开源展厅

4

全站总浏览

38500

全站总获赞

1260

快捷管理操作

撰写新博文

富文本与 Markdown

导入 Markdown

解析 Frontmatter

分类体系管理

查看与维护分类

开源展厅管理

维护精选项目

分类体系与文章内容分布

各专业领域文章数量与占比概览

管理分类 →

后端架构

/backend

6 篇 (50%)

前端工程

/frontend

4 篇 (33%)

### 🔹 文章管理工作台 (ArticlesView)

文章内容库管理

支持全量状态检索、Markdown 语法双向编辑、置顶推荐与一键上下线发布

导入 Markdown

撰写新文章

全部分类

(6)

(4)

全部状态

已发布

仅草稿

筛选

文章标题 / 路由 Slug	所属分类	发布状态	置顶 / 推荐	阅读量	发布日期	操作

Java 21 虚拟线程与高并发实践

/java-21-virtual-threads

• Java, 并发

后端架构

已发布

520

-