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
import { Article } from "@/types";

interface HomeClientProps {
  initialArticles: Article[];
}

export function HomeClient({ initialArticles }: HomeClientProps) {
  const router = useRouter();
  const [extraArticles, setExtraArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [resumeOpen, setResumeOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<SectionId>("top");

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
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

  const benchmarkSlug =
    articles.find((a) => a.id === "art-1")?.slug ??
    articles[0]?.slug ??
    "java-21-virtual-threads-benchmark-pitfalls";

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#0c0c0d] text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <Navbar
        activeSection={activeSection}
        articles={articles}
        projects={MOCK_PROJECTS}
      />

      <main className="flex-1">
        <Hero
          onOpenResume={() => setResumeOpen(true)}
          benchmarkSlug={benchmarkSlug}
        />
        <ProjectsSection projects={MOCK_PROJECTS} />
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

