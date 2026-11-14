import { Project, Article } from "@/types";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "roubao-gateway",
    slug: "roubao-gateway",
    name: "Roubao Gateway",
    tagline: "轻量级高吞吐 API 网关",
    description: "基于 Java 21 虚拟线程与 Netty 开发。支持动态路由、令牌桶限流与全链路 TraceId 透传，单机 2C4G 实测支撑 3.8 万 QPS。",
    architectureHighlights: [
      "虚拟线程调度替代传统异步回调，大幅简化 I/O 阻塞逻辑",
      "Redis 7 + Lua 脚本实现毫秒级原子限流与 IP 拦截",
      "集成 OpenTelemetry 标准链路头，可与追踪系统无缝对接"
    ],
    techTags: ["Java 21", "Spring Boot 3", "Netty", "Redis", "Docker"],
    repoUrl: "https://github.com/example/roubao-gateway",
    featured: true,
    metrics: "38K QPS / P99 4.2ms"
  },
  {
    id: "cloud-trace",
    slug: "cloud-trace",
    name: "CloudTrace Hub",
    tagline: "分布式全链路追踪看板",
    description: "为中小型全栈系统量身打造的可观测工具。存储端采用 ClickHouse 代替沉重的 ES，前端提供直观的服务调用拓扑图与慢 SQL 归因。",
    architectureHighlights: [
      "ClickHouse 列式压缩存储，相比 ElasticSearch 节省 70% 内存",
      "Next.js App Router 服务端流式渲染调用拓扑与瀑布流图",
      "单机部署开箱即用，支持 Docker Compose 一键启动"
    ],
    techTags: ["Next.js", "React", "TypeScript", "ClickHouse", "Tailwind"],
    repoUrl: "https://github.com/example/cloud-trace",
    featured: true,
    metrics: "节省 70% 内存开销"
  },
  {
    id: "tactile-ui",
    slug: "tactile-ui",
    name: "Tactile UI",
    tagline: "轻量物理动效与微交互组件库",
    description: "面向 React 19 与 Tailwind CSS 的质感组件库。封装了高精抽屉、分段切换器与触觉按压反馈，注重手感细节与性能体验。",
    architectureHighlights: [
      "同心圆角补偿算法，消除内外层圆角边缘间隙冲突",
      "原生 Web Animations 物理弹簧阻尼，无大型动效库依赖",
      "打包体积仅 12 KB，零运行期额外样式开销"
    ],
    techTags: ["React 19", "Tailwind CSS", "TypeScript"],
    repoUrl: "https://github.com/example/tactile-ui",
    featured: true,
    metrics: "12 KB / 零重型依赖"
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "Java 21 虚拟线程压测与踩坑记录",
    slug: "java-21-virtual-threads-benchmark-pitfalls",
    summary: "在单台 2C4G 服务器上对比传统线程池与虚拟线程的吞吐表现，复盘 synchronized 关键字导致载体线程固化（Pinning）的具体场景和排障过程。",
    contentUrl: "https://cdn.roubao.dev/posts/2026/java21-virtual-threads.md",
    fileType: "md",
    category: "backend",
    tags: ["Java 21", "Spring Boot", "性能优化"],
    views: 1842,
    readTimeMinutes: 7,
    publishedAt: "2026-11-04",
    contentMarkdown: `# Java 21 虚拟线程压测与踩坑记录

Java 21 正式引入虚拟线程（Virtual Threads）后，很多过去需要借助响应式编程（WebFlux / RxJava）处理的 I/O 密集型场景，现在可以用最普通的阻塞代码跑出极高的并发吞吐。

本文记录在单台 2C4G 虚拟机上使用 k6 进行压测的真实数据，以及迁移过程中踩到的载体线程固化（Carrier Thread Pinning）问题。

---

## 一、 压测基准与数据对比

- **机器规格**：2 vCPU / 4GB RAM / Ubuntu 24.04 LTS
- **软件环境**：OpenJDK 21, Spring Boot 3.3.4, HikariCP
- **模拟场景**：下游存在 50ms 模拟网络延迟的 HTTP 接口调用

| 模式 | 500 并发 QPS | 2000 并发 QPS | 5000 并发错误率 | 内存占用 |
| :--- | :--- | :--- | :--- | :--- |
| **传统线程池 (max=200)** | 3,820 | 3,910 | 8.4% 超时拒绝 | 1.8 GB |
| **虚拟线程 (Virtual Threads)** | **8,420** | **18,950** | **0.0% 正常响应** | **1.1 GB** |

在等待 I/O 的场景下，虚拟线程的表现非常稳健，不需要牺牲代码可读性即可把单机吞吐推到网卡瓶颈。

---

## 二、 关键避坑：载体线程固化 (Carrier Thread Pinning)

虚拟线程由底层少量的操作系统平台线程（Carrier Thread）调度。如果虚拟线程在持有 monitor 锁（即 \`synchronized\` 代码块或方法）期间发起阻塞式 I/O，虚拟线程就无法被卸载（Unmount），导致载体线程被强行占满。

\`\`\`java
// Bad: blocking I/O inside synchronized pins the carrier thread
public synchronized String fetchConfig() {
    return restTemplate.getForObject("https://api.internal/config", String.class);
}

// Good: ReentrantLock allows virtual thread unmounting during I/O
private final ReentrantLock lock = new ReentrantLock();

public String fetchConfigFixed() {
    lock.lock();
    try {
        return restTemplate.getForObject("https://api.internal/config", String.class);
    } finally {
        lock.unlock();
    }
}
\`\`\`

排查时可通过 JVM 参数 \`-Djdk.tracePinnedThreads=full\` 定位所有导致固化的调用栈。

---

## 三、 HikariCP 数据库连接池的配置

很多人误以为“既然虚拟线程可以开几万个，数据库连接池也要相应开几千个”。实际上，MySQL 磁盘 I/O 和单机 CPU 核心数是硬瓶颈。在 2C4G 机器上，HikariCP 连接数维持在 **15~20** 即可保持系统最高效率，超出这个范围反而会因为锁争抢和上下文切换拖垮数据库。`
  },
  {
    id: "art-2",
    title: "Next.js 与云存储 CDN 搭建个人博客的设计考量",
    slug: "nextjs-app-router-cdn-hybrid-architecture",
    summary: "为什么个人网站不建议把 Markdown 全文存进 MySQL？从存储成本、I/O 性能、数据备份与 SEO 角度梳理整套云存储与 ISR 渲染方案。",
    contentUrl: "https://cdn.roubao.dev/posts/2026/nextjs-cdn-hybrid.md",
    fileType: "md",
    category: "architecture",
    tags: ["Next.js", "系统设计", "CDN"],
    views: 1290,
    readTimeMinutes: 5,
    publishedAt: "2026-10-28",
    contentMarkdown: `# Next.js 与云存储 CDN 搭建个人博客的设计考量

在设计全栈个人博客时，最常见的做法是建立一张 \`articles\` 表，在里面加一个 \`content MEDIUMTEXT\` 字段。但在实际运维过程中，将长文档正文与元数据强绑定存放在数据库中存在不少隐患。

本文介绍基于“对象存储 + CDN + Next.js ISR”的轻量化实践。

---

## 一、 为什么不建议存 MySQL

1. **行溢出与缓冲池开销**：MySQL 单行超过 768 字节后会触发 Off-page 溢出页存储，大量大文本频繁读取会迅速稀释 InnoDB Buffer Pool 的有效命中率；
2. **数据库备份沉重**：包含长文章正文后，数据库备份文件成倍增长，异地冷备与快照恢复变得缓慢；
3. **缺少天生的版本控制**：云对象存储天然支持多版本管理与生命周期归档，本地误操作可以随时拉取历史版本。

---

## 二、 实际数据流转

1. **写作与上传**：本地编写 Markdown 文件，通过脚本或轻量接口上传至对象存储（OSS / S3），生成 CDN 外链；
2. **元数据入库**：MySQL 中只记录标题、别名（slug）、标签、发布时间以及该 CDN 外链地址，单行数据控制在 2KB 以内；
3. **服务端渲染**：用户访问文章详情页时，Next.js 在服务端拉取 CDN 正文，解析为 HTML，并通过增量静态生成（ISR）缓存结果。

这种设计让数据库保持极高轻量，读写逻辑纯粹，抗压能力大幅增强。`
  },
  {
    id: "art-3",
    title: "浅谈现代 Web 界面的细节与交互手感",
    slug: "crafting-apple-grade-liquid-glass-micro-interactions",
    summary: "从圆角嵌套的数学关系、多层环境阴影到按压反馈，整理几个让界面告别塑料感、提升质感的设计工程细节。",
    contentUrl: "https://cdn.roubao.dev/posts/2026/apple-liquid-glass.md",
    fileType: "md",
    category: "frontend",
    tags: ["UI/UX", "前端工程", "Tailwind"],
    views: 2415,
    readTimeMinutes: 6,
    publishedAt: "2026-10-15",
    contentMarkdown: `# 浅谈现代 Web 界面的细节与交互手感

许多界面看起来不够精致，往往不是因为功能缺失，而是细节处理不够考究。以下是几个在前端工程中非常实用的视觉与手感调优细节。

---

## 一、 同心圆角的数学约束

当外层容器嵌套内层卡片时，切忌内外使用相同的圆角值。

$$\\text{内层圆角} = \\text{外层圆角} - \\text{内边距 (Padding)}$$

如果外层卡片圆角为 24px，Padding 为 16px，那么内层元素的圆角应当精确设置为 8px。一旦内外半径相同，四个角落处的缝隙就会显得忽宽忽窄。

---

## 二、 多层柔和漫反射阴影

避免使用纯黑、单层的重阴影。自然界的光线是散射的，使用 2~3 层不同透明度和扩散半径的微阴影组合，能让卡片更自然地浮起在背景之上。

\`\`\`css
.card-shadow {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px -2px rgba(0, 0, 0, 0.05),
    0 16px 32px -8px rgba(0, 0, 0, 0.06);
}
\`\`\`

---

## 三、 微缩按压反馈

按钮在点击时，使用 \`active:scale-[0.98]\` 配合短时间的弹簧缓动，比单纯改变背景颜色更能给用户明确的物理触觉确认感。`
  },
  {
    id: "art-4",
    title: "单机 Docker 部署 Nginx 与 Spring Boot 调优小结",
    slug: "single-node-docker-compose-production-tuning",
    summary: "记录在 2C4G 服务器上部署全栈服务时的参数调整，包括 Nginx keepalive 长连接、JVM 堆内存分配与内网虚拟网桥优化。",
    contentUrl: "https://cdn.roubao.dev/posts/2026/single-node-tuning.md",
    fileType: "md",
    category: "performance",
    tags: ["Docker", "Nginx", "运维实践"],
    views: 3102,
    readTimeMinutes: 8,
    publishedAt: "2026-09-30",
    contentMarkdown: `# 单机 Docker 部署 Nginx 与 Spring Boot 调优小结

对于个人项目与轻量业务，单机 Docker Compose 部署具备极高的性价比和几乎为零的运维负担。以下是在 2C4G 实例上稳定运行的关键配置。

---

## 一、 Nginx Upstream 长连接保持

Nginx 默认与后端服务使用 HTTP/1.0 短连接，每个请求都会重新建立 TCP 握手。通过开启 keepalive 可大幅降低 CPU 开销：

\`\`\`nginx
upstream backend_service {
    server springboot-app:8080;
    keepalive 32;
}

server {
    location /api/ {
        proxy_pass http://backend_service;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
\`\`\`

---

## 二、 容器内网虚拟网桥

在 \`docker-compose.yml\` 中显式声明 bridge 网络，让容器之间通过内部域名互相通信，不仅延迟在 1ms 以内，而且无需将数据库与 Redis 端口暴露到公网，兼顾性能与安全。`
  }
];
