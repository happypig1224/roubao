"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar, SectionId } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProjectsSection } from "@/components/ProjectsSection";
import { BlogSection } from "@/components/BlogSection";
import { AdminDrawer } from "@/components/AdminDrawer";
import { ResumeSheet } from "@/components/ResumeSheet";
import { Footer } from "@/components/Footer";
import { MOCK_PROJECTS } from "@/data/mockData";
import { Article, Project } from "@/types";

interface HomeClientProps {
  initialArticles: Article[];
  initialProjects?: Project[];
}

const emptySubscribe = () => () => {};
function useIsHydrated() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function HomeClient({ initialArticles, initialProjects }: HomeClientProps) {
  const router = useRouter();
  const projects = initialProjects && initialProjects.length > 0 ? initialProjects : MOCK_PROJECTS;
  const [extraArticles, setExtraArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [resumeOpen, setResumeOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<SectionId>("top");
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const isHydrated = useIsHydrated();

  const articles = React.useMemo(
    () => [
      ...extraArticles.filter(
        (extra) => !initialArticles.some((base) => base.slug === extra.slug)
      ),
      ...initialArticles,
    ],
    [extraArticles, initialArticles]
  );

  const handleAddArticle = useCallback(
    (newArticle: Article) => {
      setExtraArticles((prev) => [newArticle, ...prev]);
      router.refresh();
    },
    [router]
  );

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "top" || hash === "projects" || hash === "blog") {
        const target = document.getElementById(hash);
        requestAnimationFrame(() => {
          setActiveSection(hash);
          target?.scrollIntoView({ behavior: "smooth" });
        });
      }
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    const sectionIds: SectionId[] = ["top", "projects", "blog"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        }
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0.05 }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const isKeyA =
        e.key.toLowerCase() === "a" ||
        e.code === "KeyA" ||
        e.key.toLowerCase() === "keya";
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && isKeyA) {
        e.preventDefault();
        e.stopPropagation();
        setAdminOpen((prev) => !prev);
      }
    };
    const handleToggleAdmin = () => setAdminOpen((prev) => !prev);

    window.addEventListener("keydown", handleGlobalKey);
    window.addEventListener("roubao:toggle-admin", handleToggleAdmin);
    return () => {
      window.removeEventListener("keydown", handleGlobalKey);
      window.removeEventListener("roubao:toggle-admin", handleToggleAdmin);
    };
  }, []);

  const benchmarkSlug =
    articles.find((a) => a.id === "art-1")?.slug ??
    articles[0]?.slug ??
    "java-21-virtual-threads-benchmark-pitfalls";

  return (
    <div
      data-hydrated={isHydrated ? "true" : undefined}
      onMouseMove={(e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
      }}
      className="min-h-screen relative flex flex-col bg-[#fafafa] dark:bg-[#0c0c0d] text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors"
    >
      {/* Brittany Chiang 风格: 极客环境聚光灯 (Ambient Spotlight Glow) */}
      {mousePos && (
        <div
          className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 hidden md:block"
          style={{
            background: `radial-gradient(640px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.07), transparent 80%)`,
          }}
        />
      )}

      <Navbar
        activeSection={activeSection}
        articles={articles}
        projects={projects}
      />

      <main id="main" className="flex-1 relative z-10">
        <Hero
          onOpenResume={() => setResumeOpen(true)}
          benchmarkSlug={benchmarkSlug}
        />
        <ProjectsSection projects={projects} />
        <BlogSection
          articles={articles}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </main>

      <Footer />

      <AdminDrawer
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onAddArticle={handleAddArticle}
      />

      <ResumeSheet
        isOpen={resumeOpen}
        onClose={() => setResumeOpen(false)}
      />
    </div>
  );
}

