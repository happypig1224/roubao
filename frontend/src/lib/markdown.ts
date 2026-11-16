import { Marked, marked, type Tokens } from "marked";
import hljs from "highlight.js";
import DOMPurify from "isomorphic-dompurify";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function stripHtml(raw: string): string {
  return raw.replace(/<[^>]*>/g, "").trim();
}

export function createHeadingSlugger() {
  const seen = new Map<string, number>();

  return (rawText: string): string => {
    const plain = stripHtml(rawText);
    const base =
      plain
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "") || "section";

    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

export function extractTocHeadings(markdown: string): TocHeading[] {
  if (!markdown) return [];
  const clean = markdown.replace(/^---[\s\S]*?---\s*/, "");
  const slugify = createHeadingSlugger();
  const headings: TocHeading[] = [];
  const tokens = marked.lexer(clean);

  for (const token of tokens) {
    if (token.type === "heading" && token.depth >= 1 && token.depth <= 4) {
      const text = stripHtml(token.text);
      if (text) {
        headings.push({
          id: slugify(text),
          text,
          level: token.depth,
        });
      }
    }
  }

  return headings;
}

export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";
  const clean = markdown.replace(/^---[\s\S]*?---\s*/, "");
  const slugify = createHeadingSlugger();
  const renderer = new marked.Renderer();

  renderer.heading = ({ text, depth }: Tokens.Heading) => {
    const cleanText = stripHtml(text);
    const slug = slugify(cleanText);

    const sizeClasses: Record<number, string> = {
      1: "text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 pt-8 pb-3 border-b border-zinc-200 dark:border-zinc-800 scroll-mt-24",
      2: "text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 pt-7 pb-2.5 border-b border-zinc-100 dark:border-zinc-800/80 scroll-mt-24",
      3: "text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 pt-5 pb-1 scroll-mt-24",
      4: "text-base sm:text-lg font-semibold text-zinc-800 dark:text-zinc-200 pt-4 pb-1 scroll-mt-24",
      5: "text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-200 pt-3 scroll-mt-24",
      6: "text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 pt-2 scroll-mt-24",
    };
    const cls = sizeClasses[depth] || sizeClasses[2];

    return `
<h${depth} id="${slug}" class="group flex items-center gap-2 ${cls}">
  <span>${text}</span>
  <a href="#${slug}" class="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-opacity text-sm font-normal" aria-label="跳转至本节">#</a>
</h${depth}>
`;
  };

  renderer.code = ({ text, lang }: Tokens.Code) => {
    const cleanLang = (lang || "").trim().split(/\s+/)[0];
    let highlighted = "";

    if (cleanLang && hljs.getLanguage(cleanLang)) {
      try {
        highlighted = hljs.highlight(text, { language: cleanLang, ignoreIllegals: true }).value;
      } catch {
        highlighted = escapeHtml(text);
      }
    } else if (
      text.includes(";") ||
      text.includes("{") ||
      text.includes("SELECT") ||
      text.includes("def ") ||
      text.includes("import ")
    ) {
      try {
        highlighted = hljs.highlightAuto(text).value;
      } catch {
        highlighted = escapeHtml(text);
      }
    } else {
      highlighted = escapeHtml(text);
    }

    const displayLang = cleanLang || "text";
    const encoded = encodeURIComponent(text);

    return `
<div class="code-block-wrapper my-5 rounded-xl bg-zinc-950 dark:bg-black border border-zinc-800 text-zinc-100 overflow-hidden shadow-xs">
  <div class="px-4 py-2 bg-zinc-900/90 dark:bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
    <span class="inline-flex items-center gap-1.5 uppercase font-medium tracking-wider text-[11px] text-zinc-400">
      <span class="w-2 h-2 rounded-full bg-emerald-500/80 inline-block"></span>
      ${displayLang}
    </span>
    <button
      type="button"
      data-code="${encoded}"
      class="code-copy-btn tactile-btn inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-zinc-800/60 hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer text-zinc-400 border border-zinc-700/40"
    >
      <span class="copy-label">复制</span>
    </button>
  </div>
  <pre class="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed"><code class="hljs ${cleanLang}">${highlighted}</code></pre>
</div>
`;
  };

  renderer.link = ({ href, title, text }: Tokens.Link) => {
    const isExt = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");
    const titleAttr = title ? `title="${title}"` : "";
    const targetAttr = isExt ? `target="_blank" rel="noopener noreferrer"` : "";
    return `<a href="${href}" ${titleAttr} ${targetAttr} class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-4 font-medium transition-colors">${text}</a>`;
  };

  renderer.codespan = ({ text }: Tokens.Codespan) => {
    return `<code class="px-1.5 py-0.5 mx-0.5 rounded text-[12px] font-mono bg-zinc-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 border border-zinc-200/60 dark:border-zinc-700/60 font-semibold">${text}</code>`;
  };

  const localMarked = new Marked({
    renderer,
    gfm: true,
    breaks: true,
  });

  const rawHtml = localMarked.parse(clean, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ["target", "rel", "data-code", "aria-label"],
  });
}
