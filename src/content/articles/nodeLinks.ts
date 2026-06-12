import { networkData } from "../../data/network";
import { ARTICLES, type ArticleEntry } from "./index";

export interface NodeTermMatch {
  term: string;
  id: string;
}

const ALNUM = /[A-Za-z0-9]/;
// Inline code spans and existing markdown links/images — never link inside these.
const PROTECTED_RE = /(`[^`]*`|!?\[[^\]]*\]\([^)]*\))/g;

/**
 * Build the list of network-node terms that can be matched in article text,
 * one per node label, sorted longest-first so e.g. "IL-10" is tried before
 * "IL-1" at the same position.
 */
export function buildNodeTerms(): NodeTermMatch[] {
  const terms: NodeTermMatch[] = [];
  const seen = new Set<string>();
  for (const node of networkData.nodes) {
    const term = node.label.trim();
    if (term.length < 2) continue;
    const key = term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    terms.push({ term, id: node.id });
  }
  terms.sort((a, b) => b.term.length - a.term.length);
  return terms;
}

/**
 * Wrap the first mention of each network-node term in `markdown` with a
 * `[term](#node:<id>)` link. Skips fenced code blocks, inline code, headings
 * (so rehype-slug IDs stay untouched), and text already inside a link/image.
 * Each node is linked at most once per document.
 */
export function linkNodeTerms(markdown: string, terms: NodeTermMatch[]): string {
  const linked = new Set<string>();
  let inFence = false;
  return markdown
    .split("\n")
    .map((line) => {
      if (/^```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence || /^#{1,6}\s/.test(line)) return line;
      return linkLine(line, terms, linked);
    })
    .join("\n");
}

function linkLine(line: string, terms: NodeTermMatch[], linked: Set<string>): string {
  let result = "";
  let lastIndex = 0;
  for (const m of line.matchAll(PROTECTED_RE)) {
    result += linkPlain(line.slice(lastIndex, m.index), terms, linked);
    result += m[0];
    lastIndex = m.index! + m[0].length;
  }
  result += linkPlain(line.slice(lastIndex), terms, linked);
  return result;
}

function linkPlain(text: string, terms: NodeTermMatch[], linked: Set<string>): string {
  let result = "";
  let pos = 0;
  while (pos < text.length) {
    let best: { term: string; id: string; index: number } | null = null;
    for (const { term, id } of terms) {
      if (linked.has(id)) continue;
      const idx = text.indexOf(term, pos);
      if (idx === -1) continue;
      if (best && idx > best.index) continue;
      if (best && idx === best.index && term.length <= best.term.length) continue;
      const before = idx > 0 ? text[idx - 1] : "";
      const after = idx + term.length < text.length ? text[idx + term.length] : "";
      if (ALNUM.test(term[0]) && ALNUM.test(before)) continue;
      if (ALNUM.test(term[term.length - 1]) && ALNUM.test(after)) continue;
      best = { term, id, index: idx };
    }
    if (!best) {
      result += text.slice(pos);
      break;
    }
    result += text.slice(pos, best.index);
    result += `[${best.term}](#node:${best.id})`;
    linked.add(best.id);
    pos = best.index + best.term.length;
  }
  return result;
}

/** Shared node-term list, computed once for linking and reverse lookup. */
export const NODE_TERMS = buildNodeTerms();

const NODE_LINK_RE = /#node:([\w-]+)/g;

/**
 * Maps each node id to the ids of articles whose text mentions it (i.e.
 * where `linkNodeTerms` would create a `#node:<id>` link for that node).
 */
export function buildArticleNodeIndex(
  articles: ArticleEntry[] = ARTICLES,
  terms: NodeTermMatch[] = NODE_TERMS,
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const article of articles) {
    const linked = linkNodeTerms(article.file, terms);
    for (const m of linked.matchAll(NODE_LINK_RE)) {
      const list = map.get(m[1]);
      if (list) list.push(article.id);
      else map.set(m[1], [article.id]);
    }
  }
  return map;
}
