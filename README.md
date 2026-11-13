# Roubao (肉包) - 全栈技术博客与作品集系统

Roubao 是一个现代化的全栈技术博客与作品集展示系统，采用前后端分离与模块化单体架构设计。

---

## 🌟 核心特性

- **现代前端体验**：基于 Next.js App Router 构建，支持流体动效、Apple 级微交互、响应式布局、深色与沉浸式排版。
- **高能后端架构**：采用 Java 21 虚拟线程与 Spring Boot 3.3.4，集成 MyBatis-Plus、HikariCP 高性能连接池与 Redis 缓存。
- **持久存储与迁移**：MySQL 8.0 关系型数据库，配置 Flyway 自动化版本迁移管理；MinIO / S3 兼容对象存储。
- **工程化与规范**：内置阿里 Java 开发规约、完善的数据库设计文档、SQL 脚本与专用 Agent 技能库。

---

## 🏗️ 架构概览

```
roubao/
├── backend/                  # 后端模块化单体工程 (Spring Boot 3 + Java 21)
│   ├── roubao-framework/     # 全局基础设施 (通用响应、异常处理、Redis配置、TraceId)
│   ├── roubao-article/       # 文章与分类领域模块 (实体、Mapper、服务、测试)
│   ├── roubao-project/       # 项目与作品领域模块
│   └── roubao-app/           # 启动模块与全局装配配置
├── frontend/                 # 现代化前端工程 (Next.js 16 + React 19 + Tailwind CSS)
│   ├── src/app/              # Next.js App Router 路由与页面
│   ├── src/components/       # UI 组件库 (Navbar, Hero, Blog, Sheet, Markdown)
│   └── src/lib/              # 工具函数与状态存储
├── docs/                     # 项目设计文档、数据库设计与规范手册
│   ├── sql/                  # 数据库迁移脚本
│   └── DATABASE_DESIGN.md    # 完整数据库表设计
└── .agents/                  # 专属定制 AI 协同技能体系
```

---

## 🚀 快速启动

### 1. 前端启动 (Frontend)

```bash
cd frontend
pnpm install
pnpm dev
```
前端默认运行于 `http://localhost:3000`。

### 2. 后端启动 (Backend)

**环境要求**：
- JDK 21+
- Maven 3.9+
- MySQL 8.0+
- Redis

```bash
cd backend
mvn clean install
cd roubao-app
mvn spring-boot:run
```
后端服务默认监听端口 `8080`。

---

## 📄 License

MIT License.
