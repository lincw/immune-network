import type { NetworkNode } from "../types";

// Curated Wikipedia article titles for nodes whose best article isn't obvious
// from the label/synonyms (e.g. T-helper subsets that share one article, or
// disambiguation-prone names). Anything not listed falls back to Wikipedia's
// "go" search, which jumps straight to an exact-title match when one exists and
// otherwise lands on relevant search results — so links never dead-end.
const WIKI_TITLE: Record<string, string> = {
  "naive-cd4": "T helper cell",
  "naive-cd8": "Cytotoxic T cell",
  th1: "T helper cell",
  th2: "T helper cell",
  th9: "T helper cell",
  th22: "T helper cell",
  th3: "T helper cell",
  th17: "T helper 17 cell",
  tfh: "T follicular helper cell",
  treg: "Regulatory T cell",
  itreg: "Regulatory T cell",
  ntreg: "Regulatory T cell",
  ctl: "Cytotoxic T cell",
  "naive-b": "B cell",
  "activated-b": "B cell",
  "gc-b": "Germinal center",
  "follicular-b": "B cell",
  "memory-b": "Memory B cell",
  plasmablast: "Plasma cell",
  plasma: "Plasma cell",
  dc: "Dendritic cell",
  fdc: "Follicular dendritic cells",
  nk: "Natural killer cell",
  mast: "Mast cell",
  epithelial: "Epithelium",
  endothelial: "Endothelium",
  keratinocyte: "Keratinocyte",
  "smooth-muscle": "Smooth muscle",
  stromal: "Stromal cell",
  tbet: "T-bet",
  gata3: "GATA3",
  rorgt: "RORC",
  rora: "RAR-related orphan receptor alpha",
  bcl6: "BCL6",
  blimp1: "PRDM1",
  cmaf: "MAF (gene)",
  pu1: "PU.1",
  igg1: "Immunoglobulin G",
  igg2: "Immunoglobulin G",
  igg3: "Immunoglobulin G",
  ifng: "Interferon gamma",
  ifn1: "Type I interferon",
  tgfb: "Transforming growth factor beta",
  tnfa: "Tumor necrosis factor",
  tnfb: "Lymphotoxin alpha",
  // Interleukins — pin each to its dedicated article so the "IL-N" label
  // doesn't resolve to a disambiguation page. IL-1 has no single-cytokine
  // article, so it points to the family.
  il1: "Interleukin-1 family",
  il2: "Interleukin 2",
  il3: "Interleukin 3",
  il4: "Interleukin 4",
  il5: "Interleukin 5",
  il6: "Interleukin 6",
  il8: "Interleukin 8",
  il9: "Interleukin 9",
  il10: "Interleukin 10",
  il12: "Interleukin 12",
  il13: "Interleukin 13",
  il15: "Interleukin 15",
  il17: "Interleukin 17",
  il18: "Interleukin 18",
  il21: "Interleukin 21",
  il22: "Interleukin 22",
  il23: "Interleukin 23",
  il25: "Interleukin 25",
  il27: "Interleukin 27",
  il33: "Interleukin 33",
  "cd80-86": "CD80",
  cd40l: "CD154",
  mhc1: "MHC class I",
  mhc2: "MHC class II",
  fcr: "Fc receptor",
  gp130: "GP130",
  cd132: "Common gamma chain",
  opsonization: "Opsonin",
  "complement-fixation": "Complement system",
  adcc: "Antibody-dependent cellular cytotoxicity",
  "allergy-type1": "Type I hypersensitivity",
  "delayed-hypersensitivity": "Type IV hypersensitivity",
  cytotoxicity: "Cell-mediated cytotoxicity",
  "class-switch": "Immunoglobulin class switching",
  "somatic-hypermutation": "Somatic hypermutation",
  "affinity-maturation": "Affinity maturation",
  hematopoiesis: "Haematopoiesis",
  "intracellular-defense": "Cell-mediated immunity",
  "antifungal-bacterial": "Innate immune system",
  "tumor-defense": "Immune system",
};

/**
 * Best-guess article title. The node label is the canonical article name for
 * almost all of these terms (e.g. "Macrophage", "IL-6" → redirects to
 * "Interleukin 6"); the curated map overrides the few that don't resolve
 * cleanly (Greek-letter cytokines, gene symbols, shared subset articles).
 */
export function wikiLookupTitle(node: NetworkNode): string {
  return WIKI_TITLE[node.id] ?? node.label;
}

export function wikipediaUrl(node: NetworkNode): string {
  const title = WIKI_TITLE[node.id];
  if (title) {
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  }
  // "go" search jumps to the exact article when the label matches (following
  // redirects), otherwise lands on relevant results — so links never dead-end.
  return `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(
    node.label,
  )}&title=Special:Search&go=Go`;
}

export interface WikiSummary {
  thumb: string | null;
  pageUrl: string | null;
}

const summaryCache = new Map<string, WikiSummary | null>();

/**
 * Fetch the lead thumbnail for a node's Wikipedia article via the CORS-enabled
 * REST summary API. Returns null when there's no article, no image, or the
 * title is a disambiguation page. Results are cached per node id.
 */
export async function fetchWikiSummary(
  node: NetworkNode,
  signal?: AbortSignal,
): Promise<WikiSummary | null> {
  if (summaryCache.has(node.id)) return summaryCache.get(node.id) ?? null;

  const title = wikiLookupTitle(node);
  const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    title.replace(/ /g, "_"),
  )}?redirect=true`;

  try {
    const res = await fetch(endpoint, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      summaryCache.set(node.id, null);
      return null;
    }
    const data = await res.json();
    const result: WikiSummary =
      data?.type === "disambiguation"
        ? { thumb: null, pageUrl: data?.content_urls?.desktop?.page ?? null }
        : {
            thumb: data?.thumbnail?.source ?? null,
            pageUrl: data?.content_urls?.desktop?.page ?? null,
          };
    summaryCache.set(node.id, result);
    return result;
  } catch {
    // Network error or aborted — don't cache aborts as misses.
    return null;
  }
}
