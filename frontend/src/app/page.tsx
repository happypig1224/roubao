import React from "react";
import { HomeClient } from "@/components/HomeClient";
import { fetchArticles, fetchProjects } from "@/lib/api";

export default async function HomePage() {
  const [articles, projects] = await Promise.all([
    fetchArticles(),
    fetchProjects(),
  ]);

  return <HomeClient initialArticles={articles} initialProjects={projects} />;
}
