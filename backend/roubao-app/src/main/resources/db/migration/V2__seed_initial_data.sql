-- ==============================================================================
-- 肉包博客系统 (roubao) - 初始化种子数据脚本
-- 版本: V1.0.0 (Flyway 规范: V2__seed_initial_data.sql)
-- 适用数据库: MySQL 8.0+
-- ==============================================================================

SET NAMES utf8mb4;

-- 1. 初始化分类字典数据 (tb_category)
INSERT INTO `tb_category` (`id`, `category_name`, `category_slug`, `description`, `icon_name`, `sort_order`, `is_deleted`) VALUES
(1, '后端架构', 'backend', 'Java 21、Spring Boot 3、微服务高并发与底层原理', 'Server', 100, 0),
(2, '前端工程', 'frontend', 'Next.js 16、React 19、Tailwind CSS 与交互打磨', 'Layout', 90, 0),
(3, '性能调优', 'performance', '系统全链路压测、JVM 调优、Redis 与 MySQL 优化', 'Cpu', 80, 0),
(4, '系统架构', 'architecture', '分布式架构设计、Docker 容器化与运维部署', 'Boxes', 70, 0)
ON DUPLICATE KEY UPDATE `category_name` = VALUES(`category_name`);

-- 2. 初始化开源与实战项目数据 (tb_project)
INSERT INTO `tb_project` (`id`, `project_name`, `slug`, `tagline`, `description`, `architecture_highlights`, `tech_tags`, `repo_url`, `demo_url`, `star_count`, `metrics_summary`, `sort_order`, `is_featured`, `is_deleted`) VALUES
(1, 'Roubao Gateway', 'roubao-gateway', '轻量级高吞吐 API 网关', '基于 Java 21 虚拟线程与 Netty 开发。支持动态路由、令牌桶限流与全链路 TraceId 透传，单机 2C4G 实测支撑 3.8 万 QPS。', 
 JSON_ARRAY('虚拟线程调度替代传统异步回调，大幅简化 I/O 阻塞逻辑', 'Redis 7 + Lua 脚本实现毫秒级原子限流与 IP 拦截', '集成 OpenTelemetry 标准链路头，可与追踪系统无缝对接'),
 JSON_ARRAY('Java 21', 'Spring Boot 3', 'Netty', 'Redis', 'Docker'),
 'https://github.com/example/roubao-gateway', '', 128, '38K QPS / P99 4.2ms', 100, 1, 0),
(2, 'CloudTrace Hub', 'cloud-trace', '分布式全链路追踪看板', '为中小型全栈系统量身打造的可观测工具。存储端采用 ClickHouse 代替沉重的 ES，前端提供直观的服务调用拓扑图与慢 SQL 归因。',
 JSON_ARRAY('自研轻量级 Agent，无侵入式拦截 HTTP 及 JDBC 流量', 'ClickHouse 高压缩比列式存储，日均百万链路仅占数百兆空间', 'Next.js 16 + Server Components 实现秒级拓扑大屏渲染'),
 JSON_ARRAY('Java 21', 'ClickHouse', 'Next.js', 'TypeScript', 'Tailwind'),
 'https://github.com/example/cloud-trace', '', 89, '日均 500 万 Trace 采集', 90, 1, 0),
(3, 'Tactile UI', 'tactile-ui', '面向极客体验的温润组件库', '专为桌面端与移动端双向自适应定制的 React 组件库，深度贯彻物理弹性动效、同心圆角与磨砂半透明质感，提供极致微交互。',
 JSON_ARRAY('基于 Tailwind CSS v4 与 CSS 变量的主题无感切换', '深度优化微交互：按压微震、超椭圆曲率与光学居中对齐', '全自适应视口：从折叠屏移动端到 4K 超宽屏完美缩放'),
 JSON_ARRAY('React 19', 'Next.js', 'Tailwind v4', 'Framer Motion'),
 'https://github.com/example/tactile-ui', '', 215, '60fps 硬件加速动效', 80, 1, 0)
ON DUPLICATE KEY UPDATE `project_name` = VALUES(`project_name`);

-- 3. 初始化文章主体元数据 (tb_article)
-- 标签直接内聚在 tags JSON 中，查列表无需 join 中间表
INSERT INTO `tb_article` (`id`, `category_id`, `title`, `slug`, `summary`, `cover_image_key`, `content_url`, `file_type`, `tags`, `read_time_minutes`, `sort_order`, `is_published`, `is_top`, `is_featured`, `is_deleted`, `published_at`) VALUES
(1, 1, 'Java 21 虚拟线程压测与踩坑记录', 'java-21-virtual-threads-benchmark-pitfalls', '在单台 2C4G 服务器上对比传统线程池与虚拟线程的吞吐表现，复盘 synchronized 关键字导致载体线程固化（Pinning）的具体场景和排障过程。', 'covers/2026/11/java21-threads.webp', 'https://cdn.roubao.dev/posts/2026/java21-virtual-threads.md', 'md', JSON_ARRAY('Java 21', 'Spring Boot', '性能优化'), 7, 100, 1, 1, 1, 0, '2026-11-04 10:00:00'),
(2, 2, 'Next.js 与云存储 CDN 搭建个人博客的设计考量', 'nextjs-cloud-storage-cdn-blog-design', '拆解为什么采用 Next.js App Router 配合外部对象存储与 CDN 缓存，兼顾开发迭代速度、首屏极致 SEO 与极低运维成本。', 'covers/2026/10/nextjs-cdn.webp', 'https://cdn.roubao.dev/posts/2026/nextjs-cdn-blog.md', 'md', JSON_ARRAY('Next.js', 'React', 'Tailwind CSS'), 5, 90, 1, 0, 1, 0, '2026-10-28 14:30:00'),
(3, 2, '浅谈现代 Web 界面的细节与交互手感', 'modern-web-interface-details-tactile-feel', '从边框高光、同心圆角到按压弹性回馈，总结如何用 CSS 变量与微动效让平淡的技术站拥有细腻、高级的工匠质感。', 'covers/2026/10/web-tactile.webp', 'https://cdn.roubao.dev/posts/2026/web-interface-tactile.md', 'md', JSON_ARRAY('Tailwind CSS', 'UI/UX', '动画设计'), 6, 80, 1, 0, 0, 0, '2026-10-15 09:15:00'),
(4, 4, '单机 Docker 部署 Nginx 与 Spring Boot 调优小结', 'docker-nginx-spring-boot-performance-tuning', '整理一份实用的生产部署检查清单：包含 gzip 与 brotli 静态压缩配置、keepalive 连接池复用以及容器化 JVM 内存配额最佳实践。', 'covers/2026/09/docker-nginx.webp', 'https://cdn.roubao.dev/posts/2026/docker-nginx-tuning.md', 'md', JSON_ARRAY('Docker', 'Nginx', '性能优化'), 8, 70, 1, 0, 1, 0, '2026-09-22 16:45:00')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 4. 初始化文章统计指标 (tb_article_stats) - 冷热解耦
INSERT INTO `tb_article_stats` (`id`, `article_id`, `view_count`, `like_count`, `share_count`, `comment_count`) VALUES
(1, 1, 1842, 136, 42, 18),
(2, 2, 920, 78, 19, 5),
(3, 3, 1430, 112, 35, 12),
(4, 4, 2150, 164, 58, 27)
ON DUPLICATE KEY UPDATE `view_count` = VALUES(`view_count`);

-- 5. 初始化文章正文大内容 (tb_article_content) - 大字段垂直拆分
INSERT INTO `tb_article_content` (`id`, `article_id`, `content_markdown`) VALUES
(1, 1, '# Java 21 虚拟线程压测与踩坑记录\n\nJava 21 正式引入虚拟线程（Virtual Threads）后，很多过去需要借助响应式编程（WebFlux / RxJava）处理的 I/O 密集型场景，现在可以用最普通的阻塞代码跑出极高的并发吞吐。\n\n本文记录在单台 2C4G 虚拟机上使用 k6 进行压测的真实数据，以及迁移过程中踩到的载体线程固化（Carrier Thread Pinning）问题。\n\n## 一、 压测基准与数据对比\n\n- 机器规格：2 vCPU / 4GB RAM / Ubuntu 24.04 LTS\n- 软件环境：OpenJDK 21, Spring Boot 3.3.4, HikariCP\n- 模拟场景：下游存在 50ms 模拟网络延迟的 HTTP 接口调用\n\n| 模式 | 500 并发 QPS | 2000 并发 QPS | 5000 并发错误率 | 内存占用 |\n| :--- | :--- | :--- | :--- | :--- |\n| 传统线程池 (max=200) | 3,820 | 3,910 | 8.4% 超时拒绝 | 1.8 GB |\n| 虚拟线程 (Virtual Threads) | 8,420 | 18,950 | 0.0% 正常响应 | 1.1 GB |\n\n在等待 I/O 的场景下，虚拟线程的表现非常稳健，不需要牺牲代码可读性即可把单机吞吐推到网卡瓶颈。'),
(2, 2, '# Next.js 与云存储 CDN 搭建个人博客的设计考量\n\n搭建技术博客有很多路线：静态 Hexo / Hugo、全动态 WordPress、或者纯自研全栈架构。\n\n本站采用了 Next.js App Router 配合外部对象存储与 CDN 缓存的方案。\n\n## 为什么不将 Markdown 存入传统单体数据库？\n\n1. 内容版本化：长篇 Markdown 文档更适合放在对象存储或 Git 历史中，数据库只维护文章元数据与索引。\n2. 成本收益比：静态文件一旦进入 CDN，几乎无需后端计算资源，首屏毫秒级送达。'),
(3, 3, '# 浅谈现代 Web 界面的细节与交互手感\n\n一个界面的“高级感”往往不是来自于花哨的特效，而是来自于细节处的一致性与物理交互的真实反馈。\n\n## 什么是好的“手感”？\n\n- 同心圆角（Concentric Radii）：内层元素的圆角必须与外层容器保持曲率补偿。\n- 触觉反馈与状态防抖：按钮按下时微小的缩放与回弹，给用户一种按在真实实体键上的确认感。'),
(4, 4, '# 单机 Docker 部署 Nginx 与 Spring Boot 调优小结\n\n在资源有限的单机云服务器上（如 2C4G 或 4C8G），如何最大化利用硬件资源？\n\n## Nginx 关键调优项\n\n- 开启 gzip / brotli 静态压缩。\n- upstream 配置 keepalive 连接池。\n- worker_rlimit_nofile 调大至 65535。')
ON DUPLICATE KEY UPDATE `article_id` = VALUES(`article_id`);
