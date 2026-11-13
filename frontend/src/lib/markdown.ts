export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Generates deterministic, unique anchor IDs for Markdown headings within a document.
 */
export function createHeadingSlugger() {
  const seen = new Map<string, number>();

  return (rawText: string): string => {
    const base =
      rawText
        .trim()
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
        .replace(/\s+/g, "-") || "section";

    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

/**
 * Extracts H2 and H3 headings from Markdown blocks while skipping fenced code blocks.
 */
export function extractTocHeadings(markdown: string): TocHeading[] {
  const slugify = createHeadingSlugger();
  const headings: TocHeading[] = [];
  const blocks = markdown.split("\n\n");

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed || trimmed.startsWith("```")) continue;

    if (trimmed.startsWith("## ")) {
      const text = trimmed.slice(3).trim();
      if (text) {
        headings.push({ id: slugify(text), text, level: 2 });
      }
    } else if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4).trim();
      if (text) {
        headings.push({ id: slugify(text), text, level: 3 });
      }
    }
  }

  return headings;
}
