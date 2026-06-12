import GithubSlugger from "github-slugger";

export interface TocEntry {
  depth: 2 | 3;
  text: string;
  slug: string;
}

const HEADING_RE = /^(#{2,3})\s+(.+?)\s*$/;
const FENCE_RE = /^```/;

/**
 * Extracts h2/h3 headings from raw markdown, slugified with github-slugger
 * (the same algorithm rehype-slug uses), so links generated here match the
 * `id` attributes react-markdown renders on the headings.
 */
export function extractToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const toc: TocEntry[] = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = HEADING_RE.exec(line);
    if (!match) continue;

    const depth = match[1].length as 2 | 3;
    const text = match[2];
    toc.push({ depth, text, slug: slugger.slug(text) });
  }

  return toc;
}
