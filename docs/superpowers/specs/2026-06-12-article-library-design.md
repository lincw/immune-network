# Article Library — Design Spec

Date: 2026-06-12

## Goal

Migrate the 10 Markdown articles from `lincw/immune_system` (a separate repo of
bilingual Chinese/English immunology reference material) into this repo, and
present them inside the Immune Network Explorer as a browsable "Library"
section — giving readers a "full picture" reference alongside the interactive
network graph.

The source repo will be deleted after migration (one-time copy, no ongoing
sync). Content stays in Chinese/English as-is — no translation.

This is phase 1 of a two-phase effort. Phase 2 (out of scope here) is
cross-linking individual network nodes to relevant article sections.

## Source content inventory

10 files from `lincw/immune_system` (all CC BY 4.0):

| File | Chinese / English title | Mermaid diagrams | Tables |
|---|---|---|---|
| `immune_system.md` | 人體免疫系統 Immune System | 1 | — |
| `overview.md` | 概述 Overview | — | — |
| `innate_immunity.md` | 先天免疫 Innate Immunity | — | — |
| `adaptive_immunity.md` | 後天免疫 Adaptive Immunity | 2 | — |
| `immune_cells.md` | 主要免疫細胞時序與分泌物質 | 1 | yes |
| `regulation_dysregulation.md` | 免疫系統的調節與失調 | — | — |
| `clinical_applications.md` | 免疫學的臨床應用 | — | — |
| `immune_diseases.md` | 免疫疾病 Immune Diseases | — | — |
| `glossary.md` | Glossary | — | — |
| `course_outline.md` | 免疫系統課程大綱 Course Outline | — | — |

No images. `immune_system.md` covers sections 1–5 (overview, innate, adaptive,
immune cells, Th1/Th2 balance) as a combined intro — including content not
duplicated elsewhere (the Th1/Th2 balance section), so it's kept as its own
"Introduction" article rather than deduplicated/merged.

## Navigation & IA

New top-level `Mode` value `"library"` alongside the existing
`"landing" | "explore" | "fullmap"`.

Library has two views, switched via a `selectedArticleId` (string | null)
state — `null` shows the list, a set id shows the reader:

### List view (default)

Articles grouped into three sections (mirrors `course_outline.md`):

- **Introduction** — `immune_system.md` (1 item, featured first)
- **Course** — the 6 modules from `course_outline.md`, in order:
  Overview → Innate Immunity → Adaptive Immunity → Immune Cells →
  Regulation & Dysregulation → Clinical Applications
- **Reference** — Immune Diseases, Glossary, Course Outline (3 items)

Cards reuse the visual language of the existing `.example-card` /
"Start from a hub" cards on the landing page (title in Chinese + English
subtitle, short description).

### Reader view

Two-column layout: sticky TOC sidebar (left) + article content (right).
Includes:
- "← Library" back link to the list view
- Prev/Next buttons following the Introduction → Course → Reference order
  above
- On screens <768px, the TOC sidebar collapses into a toggleable
  "On this page" panel above the content

### Entry points

- A "Library" button in the topbar, alongside the existing "Full map"/"Home"
  buttons (visible in `explore`/`fullmap`/`library` modes)
- A secondary link on the landing page hero, alongside "Explore the full
  map →"

## Content & data

Copy the 10 files into `src/content/articles/`, renamed to kebab-case:

```
src/content/articles/
  immune-system-intro.md
  overview.md
  innate-immunity.md
  adaptive-immunity.md
  immune-cells.md
  regulation-dysregulation.md
  clinical-applications.md
  immune-diseases.md
  glossary.md
  course-outline.md
```

Content is unchanged (Chinese + English terms, tables, mermaid blocks as-is).
Imported via Vite's `?raw` suffix (`import overviewMd from "./overview.md?raw"`).

`src/content/articles/index.ts` exports a registry:

```ts
interface ArticleEntry {
  id: string;            // e.g. "overview"
  file: string;          // raw markdown content
  titleZh: string;       // e.g. "概述"
  titleEn: string;       // e.g. "Overview"
  description: string;   // short one-line summary for the list card
  group: "intro" | "course" | "reference";
  order: number;         // global order, drives prev/next and list ordering
}
```

`titleZh`/`titleEn` are split from each file's H1 (e.g. "後天免疫 Adaptive
Immunity" → `titleZh: "後天免疫"`, `titleEn: "Adaptive Immunity"`). For the
English-only `glossary.md`, `titleZh` is `""`. `description` is a short
editorial one-liner written during implementation (not pulled from source).

## Rendering pipeline

New dependencies:

- `react-markdown` — markdown → React elements
- `remark-gfm` — GFM tables (used by `immune-cells.md` and `immune_system.md`)
- `rehype-slug` — heading IDs for anchor links
- `github-slugger` — used directly when extracting the TOC from raw markdown,
  so generated slugs match the `rehype-slug` IDs on the rendered headings
- `mermaid` — diagram rendering, **dynamically imported** (`import("mermaid")`)
  so the ~600KB library only loads on articles containing a mermaid block

### `ArticleView` component

- Renders `file` content via `react-markdown` with `remark-gfm` +
  `rehype-slug`.
- Custom `code` renderer: if the code block's language is `mermaid`, render a
  `<MermaidDiagram source={...} />` instead of a `<pre><code>` block.
- New `.prose` CSS (headings, paragraphs, tables, code, lists, blockquotes)
  built on the existing theme CSS variables (`--text`, `--text-dim`,
  `--border`, `--accent`, etc.) so it matches dark/light themes.

### `MermaidDiagram` component

- On mount (and whenever the app theme changes), dynamically imports
  `mermaid`, calls `mermaid.initialize({ theme: <dark|default> })` and
  `mermaid.render(...)`, and injects the resulting SVG.
- On render error, falls back to showing the raw mermaid source as a `<pre>`
  code block (no crash).

### TOC + scrollspy

- For each article, extract `##`/`###` headings from the raw markdown via a
  small regex-based parser, slugify with `github-slugger` (matches
  `rehype-slug`'s IDs).
- Sidebar renders the heading tree as links (`#slug`).
- `IntersectionObserver` on rendered headings highlights the active TOC entry
  while scrolling.

## Edge cases & error handling

- Unknown/missing `selectedArticleId` (e.g. stale state) → treat as `null`,
  show the list view.
- Articles with very few headings (`glossary.md` has 2) → TOC sidebar still
  renders, just short; no special-casing needed.
- Mermaid render failure → fall back to raw code block, logged to console,
  no thrown error.

## Testing

`src/content/articles/articles.test.ts` (vitest, alongside the existing
`graph.test.ts`):

- Registry has exactly 10 entries
- All `id`s unique
- All `file` strings non-empty
- `group` is one of `"intro" | "course" | "reference"`, and there's exactly 1
  intro / 6 course / 3 reference entries
- `order` values are unique and form a contiguous sequence

A small unit test for the heading-extraction + slugify helper against a
sample markdown string with nested headings.

## Licensing / attribution

The migrated article content is CC BY 4.0 (from `lincw/immune_system`), while
this repo's code is MIT. Add a short attribution line (content license +
original author) on the Library list page or in the README.

## Out of scope (phase 2)

- Cross-linking network nodes (in `GraphView`/`SubnetworkView`/`InfoPanel`) to
  relevant article sections. Will be its own spec once the Library exists.
