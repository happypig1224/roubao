import React from "react";
import { HomeClient } from "@/components/HomeClient";
import { getCachedArticles } from "@/lib/articlesStore";

export default async function HomePage() {
  const articles = await getCachedArticles();
  return <HomeClient initialArticles={articles} />;
}
