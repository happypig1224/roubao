"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Download, Mail, X, Check, Copy } from "lucide-react";
import { useSpringSheet } from "@/lib/useSpringSheet";
import { AUTHOR_EMAIL, SITE_HOST } from "@/lib/siteConfig";
import { copyTextToClipboard } from "@/lib/utils";

interface ResumeSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeSheet({ isOpen, onClose }: ResumeSheetProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const touchStartYRef = useRef<number | null>(null);

  const handleExited = useCallback(() => {
    setDragOffset(0);
  }, []);

  const { isMounted, isVisible } = useSpringSheet({
    isOpen,
    durationMs: 460,
    onExited: handleExited,
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const delta = e.touches[0].clientY - touchStartYRef.current;
    if (delta > 0) setDragOffset(delta * 0.85);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartYRef.current = null;
    if (dragOffset > 70) {
      onClose();
    } else {
      setDragOffset(0);
    }
  };

  const handleDownloadMarkdown = () => {
    const resumeText = `# 苦恼的肉包 — Java后端开发 / AI工程化

- 昵称: 苦恼的肉包
- 学历: 全日制本科 (2027届)
- 专业: 计算机科学与技术
- 方向: Java后端开发工程师 / AI工程化
- 邮箱: ${AUTHOR_EMAIL}
- 个人格言: 我一直在努力成为更好的自己
- 个人站点: ${SITE_HOST}

---

## 教育背景
- **学历与专业**: 2027届全日制本科 · 计算机科学与技术 (2023-09 ~ 2027-07)
- **个人荣誉**: 全国计算机能力挑战赛程序设计东北赛区本研组三等奖、国家三等励志奖学金
- **主修课程**: 数据结构与算法、计算机网络、计算机组成原理、操作系统、程序设计语言、数据库原理等

---

## 专业技能

### 1. Java核心与并发编程
- 熟练掌握 Java 核心技术，深入理解 ArrayList、HashMap、ConcurrentHashMap 等集合底层源码，掌握反射机制、动态代理技术、虚拟线程（Virtual Threads），在实际项目中熟练运用 Lambda 与 Stream API 进行函数式编程开发。
- 深入理解 JVM 内存结构及类加载机制与双亲委派模型，熟悉常见垃圾回收算法及主流垃圾回收器（CMS、G1）。
- 熟练掌握 synchronized、ReentrantLock、CAS、AQS、ThreadLocal、volatile 等底层并发原理与线程池调优，在实际开发中能运用 ThreadLocal 解决上下文隔离传递，利用 CompletableFuture 进行异步任务编排优化接口响应。

### 2. 框架与微服务生态
- 熟练掌握 Spring 全家桶（Spring、SpringMVC、SpringBoot）和 MyBatis/MyBatis-Plus 系列框架，具备快速构建和部署生产级应用能力，深入掌握 Bean 生命周期、IoC/AOP 底层实现、事务传播机制与失效场景、Spring Boot 自动装配原理。
- 熟悉 Spring Cloud Alibaba 微服务体系（Nacos 服务注册与配置、Feign 声明式调用、Gateway 网关、Sentinel 限流熔断），了解 Dubbo + Zookeeper 服务治理。

### 3. 数据存储与中间件
- 深入理解 MySQL InnoDB 存储引擎与 B+ 树索引结构，具备慢 SQL 排查治理能力，熟练掌握事务隔离与 MVCC 原理，熟悉主从复制与读写分离架构。
- 深入掌握 Redis 核心数据结构、RDB/AOF/混合持久化策略、内存淘汰与过期删除策略，熟悉主从复制与 Sentinel 哨兵集群架构，具备缓存穿透、击穿、雪崩三大热点问题治理及 Redisson 分布式锁实战经验。
- 熟练掌握 RocketMQ 消息模型，具备在业务中解决消息丢失、重复消费、消息堆积、顺序消费等核心问题的排查处理能力。

### 4. AI工程化与大模型应用
- **LLM工程架构**: 熟悉 RAG（检索增强生成）全链路优化，熟练使用 Spring AI Alibaba 与 LangChain；熟悉混合检索（BM25+Vector）、重排序（Reranking）及元数据过滤技术，有效解决大模型幻觉与检索不精准问题。
- **性能与延迟优化**: 具备 LLM 推理加速实战经验，通过并行上下文组装、流式输出（Streaming）与懒加载策略优化端到端延迟；熟悉 Token 感知滑动窗口算法，动态管理上下文以降低 Token 成本。

### 5. 前端与工程化 DevOps
- **前端技术栈**: 熟悉 HTML5、CSS3、JavaScript、Vue3、Next.js、Axios，具备前后端全链路联调与接口调试能力。
- **DevOps 工具链**: 熟练使用 Git、Maven、Linux 常用运维命令、Docker 容器化部署、JMeter 压力测试、Postman 接口测试。

---

## 个人优势
1. **大模型工程化**: 实践过 RAG 检索链路与元数据过滤，用滑动窗口与并行组装降低延迟，关注减少生成幻觉。
2. **规范与测试驱动**: 遵循 Specs Coding 开发模式，结合 SDD 与 TDD，运用 Claude Code、Gemini 辅助编写测试与重构代码。
3. **工程交付习惯**: 能独立负责模块开发与接口联调，习惯在敏捷迭代中持续沟通与复盘。
`;
    const blob = new Blob([resumeText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "苦恼的肉包-Java后端开发-简历.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyEmail = async () => {
    const success = await copyTextToClipboard(AUTHOR_EMAIL);
    if (!success) return;
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-sheet-title"
    >
      <div
        onClick={onClose}
        style={{ transition: "opacity 420ms ease-out" }}
        className={`fixed inset-0 bg-black/45 backdrop-blur-xs ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        style={{
          transform: isVisible
            ? `translate3d(0, ${dragOffset}px, 0)`
            : "translate3d(0, 100%, 0)",
          transition: isDragging
            ? "none"
            : "transform 460ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms ease-out",
        }}
        className={`relative z-10 w-full sm:max-w-2xl max-h-[88dvh] bg-white dark:bg-[#121214] rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Mobile drag handle */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="pt-3 pb-1 flex justify-center sm:hidden cursor-grab active:cursor-grabbing"
        >
          <span className="w-9 h-[5px] rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="resume-sheet-title"
                className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
              >
                苦恼的肉包 · 简历
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium">
                Java后端开发
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                2027届全日制本科 · 计算机科学与技术
              </span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span>Java后端 & AI工程化</span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span>{AUTHOR_EMAIL}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="关闭履历预览"
            className="hit-budget-44 -mr-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer ios-pressable"
          >
            <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <X className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs sm:text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
          {/* Education Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                教育背景
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">2023-09 ~ 2027-07</span>
            </div>
            <div className="p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5">
              <p>
                <strong className="text-zinc-800 dark:text-zinc-200">培养层次：</strong>
                2027届全日制本科
              </p>
              <p>
                <strong className="text-zinc-800 dark:text-zinc-200">主修专业：</strong>
                计算机科学与技术
              </p>
              <p>
                <strong className="text-zinc-800 dark:text-zinc-200">个人荣誉：</strong>
                全国计算机能力挑战赛程序设计东北赛区本研组三等奖、国家三等励志奖学金
              </p>
              <p>
                <strong className="text-zinc-800 dark:text-zinc-200">主修课程：</strong>
                数据结构与算法、计算机网络、计算机组成原理、操作系统、程序设计语言、数据库原理等
              </p>
            </div>
          </div>

          {/* Core Technical Skills */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              专业技能
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  1. Java 核心与并发编程
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  深入理解 ArrayList、HashMap、ConcurrentHashMap 等集合底层源码；掌握反射机制、动态代理技术、虚拟线程（Virtual Threads）；精通 JVM 内存模型、类加载机制与双亲委派模型，熟悉常见 GC 算法及 CMS/G1 收集器；掌握 synchronized、ReentrantLock、CAS、AQS、ThreadLocal、volatile 等底层并发原理，熟练运用 CompletableFuture 异步任务编排优化响应耗时。
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  2. 框架与微服务生态
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  熟练掌握 Spring 全家桶（Spring、SpringMVC、SpringBoot 3）与 MyBatis-Plus 系列框架；掌握 Bean 生命周期、IoC/AOP 底层实现、事务传播机制与失效场景、自动装配原理；熟悉 Spring Cloud Alibaba（Nacos、Feign、Gateway、Sentinel）微服务体系与 Dubbo + Zookeeper 服务治理。
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  3. 数据存储与中间件治理
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  深入理解 MySQL InnoDB 存储引擎与 B+ 树索引结构，具备慢 SQL 深度排查与索引治理能力（Explain 分析、覆盖索引、深分页优化）；深入掌握 Redis 核心结构、持久化（RDB/AOF/混合）、内存淘汰、过期策略与哨兵高可用集群，具备穿透/击穿/雪崩三大热点问题治理与 Redisson 分布式锁实战经验；掌握 RocketMQ 消息模型与消息可靠性治理（防丢失/防重/堆积削峰/顺序消费）。
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  4. AI 工程化与大模型应用
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  熟悉 RAG（检索增强生成）全链路优化，熟练使用 Spring AI Alibaba 与 LangChain；熟悉混合检索（BM25+Vector）、重排序（Reranking）及元数据过滤技术，有效抑制大模型幻觉；具备 LLM 推理加速实战经验，运用并行上下文组装、流式输出与懒加载策略优化端到端延迟；掌握 Token 感知滑动窗口算法降低模型调用成本。
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  5. 前端与工程化 DevOps
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  熟悉前端技术栈（HTML5、CSS3、JavaScript、Vue3、Next.js、Axios），具备前后端全链路联调与接口调试能力；熟练使用 Git、Maven、Linux 常用运维命令、Docker 容器化部署、JMeter 压力测试与 Postman 接口测试。
                </p>
              </div>
            </div>
          </div>

          {/* Personal Highlights */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              个人优势与工程素养
            </h3>
            <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">大模型工程化：</strong>
                实践过 RAG 检索链路与元数据过滤，用滑动窗口与并行组装降低延迟，关注减少生成幻觉。
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">规范与测试驱动：</strong>
                遵循 Specs Coding 开发模式，结合 SDD 与 TDD，运用 Claude Code、Gemini 辅助编写测试与重构代码。
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">工程交付习惯：</strong>
                能独立负责模块开发与接口联调，习惯在敏捷迭代中持续沟通与复盘。
              </li>
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+14px)] border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={handleCopyEmail}
            className="tactile-btn px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 inline-flex items-center gap-1.5 cursor-pointer"
          >
            {copiedEmail ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>已复制邮箱</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>{AUTHOR_EMAIL}</span>
              </>
            )}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`mailto:${AUTHOR_EMAIL}`}
              className="tactile-btn px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 inline-flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span>发送邮件</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="tactile-btn px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>.md</span>
            </button>

            <a
              href="/Roubao-Resume-2026.pdf"
              download="苦恼的肉包-Java后端开发-简历.pdf"
              className="tactile-btn px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 text-xs font-medium inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载简历 (PDF)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
