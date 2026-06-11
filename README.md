# Immune Network Explorer

An interactive, searchable map of the immune system — a navigable replacement for
the wall-sized "Immunologic networks" poster. Type a keyword (a cell, cytokine,
transcription factor, antibody, receptor, or functional outcome), the matching
node centers and lights up with its direct connections, and a side panel lets
you walk outward through the network one click at a time.

The interface is a dark "fluorescence" canvas where each category glows in its
own color, so the graph reads like imaging data rather than a flat diagram.

## What's inside

- **123 entities / ~200 relationships** — a hand-curated immunology knowledge
  graph spanning humoral and cellular immunity: the T-helper differentiation tree
  (Th1/Th2/Th9/Th17/Th22/Tfh/Treg), B-cell and antibody axis, innate effectors
  (DC, macrophage, NK, granulocytes), and the cytokines and transcription factors
  that wire them together, each tagged with the functional outcomes it drives.
- **Search → focus → neighbors** — fuzzy search across labels and synonyms
  (e.g. `interferon gamma` finds **IFN-γ**), then 1-hop neighbor highlighting.
- **Walk the network** — every connection in the info panel is a button that
  re-focuses the graph on that neighbor.
- **Category filter** — toggle cells, cytokines, transcription factors,
  antibodies, receptors, or functions on and off.

## Run it

Requires Node 18+.

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
npm test         # run the data-integrity and search test suites
```

> On first install you may be prompted to approve `esbuild`'s install script
> (Vite's bundler needs it): `npm approve-scripts esbuild`.

## How it's built

| Layer            | Choice                                                          |
| ---------------- | -------------------------------------------------------------- |
| Framework        | React + Vite + TypeScript                                      |
| Graph rendering  | [Cytoscape.js](https://js.cytoscape.org/) with the `fcose` layout |
| Tests            | Vitest                                                          |

### Project layout

```
src/
  types.ts            # node/edge/category/edge-type model + label maps
  data/network.ts     # the curated graph (nodes + edges) — edit here to extend
  data/wikipedia.ts   # article-title map + REST summary fetch (link + lead image)
  graph.ts            # NetworkIndex (neighbor lookups) + searchNodes()
  theme.ts            # category colors and per-theme palettes (light/dark)
  components/
    GraphView.tsx     # Cytoscape canvas: layout, focus, neighbor highlighting
    SearchBar.tsx     # keyword input with autocomplete
    InfoPanel.tsx     # node details, Wikipedia image/link, clickable connections
    Legend.tsx        # color key / category filter
  App.tsx             # state wiring (selection, filters)
  styles/             # global + app CSS
```

## Extending the graph

Add or edit entries in [`src/data/network.ts`](src/data/network.ts):

```ts
// a node
{ id: "il35", label: "IL-35", category: "cytokine", subsystem: "shared",
  synonyms: ["interleukin 35"], description: "Regulatory cytokine produced by Tregs…" }

// an edge (directed, typed)
{ source: "treg", target: "il35", type: "secretes" }
```

New entries flow automatically into search, the graph, the legend counts, and the
info panel. The test suite (`npm test`) enforces referential integrity: every edge
must point at real nodes, ids are unique, no node is left unconnected, and every
category is represented.

## Deploying to GitHub Pages

The app is a fully static single-page build (no server, no backend — node details
and images are fetched client-side from Wikipedia's CORS-enabled REST API), so it
hosts cleanly on GitHub Pages.

A ready-to-use workflow is included at
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). To enable it:

1. Push the repository to GitHub.
2. In the repo, go to **Settings → Pages → Build and deployment** and set
   **Source** to **GitHub Actions**.
3. Push to `main`. The workflow builds the app and publishes it to
   `https://<your-username>.github.io/<repo-name>/`.

`vite.config.ts` sets `base: "./"` so assets resolve correctly from the Pages
sub-path. (You can also deploy the `dist/` folder to any static host — Netlify,
Vercel, Cloudflare Pages, S3, etc.)

## Provenance & disclaimer

The dataset is a curated synthesis of standard immunology, organized after the
concept of the Thermo Fisher / PeproTech "Immunologic networks" poster. It is
**not** a pixel-for-pixel transcription of that poster, and is intended for
learning and exploration — not clinical or diagnostic use. The source poster PDF
is not redistributed in this repository.

## License

Released under the [MIT License](LICENSE). Note that node images are loaded live
from Wikipedia and remain under their respective licenses on Wikimedia Commons.
