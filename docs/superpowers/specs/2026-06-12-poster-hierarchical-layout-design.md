# Poster-Faithful Hierarchical Layout — Design

Date: 2026-06-12
Status: Draft for review

## Goal

Replace the current force-directed (fcose) graph layout with a **poster-faithful,
hierarchical "swimlane" layout** in which:

1. Nodes are organized like the Peprotech *Immunologic networks* poster — immune
   arm across the horizontal axis, flow of causation down the vertical axis.
2. **No two nodes overlap — including their text labels.** This is guaranteed by
   construction, not by tuning.

The app is a pannable/zoomable canvas with no fixed page size, so spreading the
layout out generously is acceptable and preferred over cramming.

## What the poster is (and isn't)

The poster is **not** a strict tree/DAG — it is full of feedback loops, so a naive
layered/hierarchical-tree layout would fight the data. Its readability comes from
two organizing axes that our data model already encodes:

- **Horizontal = immune arm.** Innate on the left, adaptive (cellular + humoral)
  on the right. → maps to `NetworkNode.subsystem`.
- **Vertical = flow of causation.** Source cells at the top → cytokines/signals
  they secrete → receptors/transcription factors → antibodies → functional
  outcomes at the bottom. → maps to `NetworkNode.category`.

So the layout is a **table (swimlane grid)**: columns by subsystem, rows (tiers)
by category. Each grid cell holds the nodes belonging to that (subsystem,
category) bucket.

## Data facts (current dataset)

- 162 nodes, 317 edges.
- Subsystems: innate 31, shared 37, cellular 44, humoral 50.
- Categories: cell 40, cytokine 36, transcriptionFactor 15, antibody 7,
  receptor 22, function 42.

## Layout axes

**Column order (left → right)**, mirroring the poster's innate→adaptive reading:

```
innate | shared | cellular | humoral
```

**Tier order (top → bottom)**, following flow of causation:

| tier | category            | rationale                                   |
|------|---------------------|---------------------------------------------|
| 0    | cell                | sources / actors, top of the cascade        |
| 1    | receptor            | surface molecules on those cells            |
| 2    | cytokine            | secreted signals                            |
| 3    | transcriptionFactor | intracellular programs driven by signals    |
| 4    | antibody            | humoral effectors                           |
| 5    | function            | downstream outcomes, bottom of the cascade  |

Both orders are single, named constants so they can be re-tuned without touching
the algorithm.

## Algorithm — deterministic table layout

A **table layout** where each cell (bucket) contains a mini-grid of its nodes,
and rows/columns are sized to their largest content. This is what makes
non-overlap true *by construction*.

1. **Bucket** every node by `(column = subsystem, tier = category)` → up to
   4 × 6 = 24 buckets.
2. **Order nodes within each tier** to reduce edge crossings: one or two
   barycenter sweeps (a node's order key = mean column-index of its graph
   neighbors). Stable fallback to the dataset's original order on ties. This is
   the only heuristic step; everything else is deterministic.
3. **Lay out each bucket** as a local sub-grid: `ceil(sqrt(n))` sub-columns, node
   slots spaced by a fixed pitch (`NODE_PITCH_X`, `NODE_PITCH_Y`). Record each
   bucket's footprint (width × height).
4. **Size the table** like an HTML table:
   - column width = max bucket width across the tiers in that column,
   - tier height = max bucket height across the columns in that tier.
   Then place column/tier origins cumulatively (with `COLUMN_GAP` / `TIER_GAP`).
   Because every bucket fits inside its sized cell, **buckets never overlap**.
5. **Center** each bucket's sub-grid within its sized cell and emit absolute
   `(x, y)` per node id.

### Why non-overlap is guaranteed

- Within a bucket: nodes sit on a fixed-pitch sub-grid → no intra-bucket overlap
  as long as the pitch exceeds the largest possible node box.
- Across buckets: the table sizing guarantees cells don't overlap, and each
  bucket is fully contained in its cell.
- **Label inclusion:** a node's box = the 26 px circle plus its label below, which
  wraps at `text-max-width: 220px`. We set `NODE_PITCH_X ≥ 220 + margin` (~250 px)
  and `NODE_PITCH_Y ≥ circle + max label height + margin` (~96 px). With pitch ≥
  the maximum possible label-inclusive box, no measurement step is needed and the
  guarantee holds for every label.

This removes the need for a separate post-layout overlap-removal pass that the
earlier (fcose-based) plan required.

## Components

- **`src/layout/posterLayout.ts`** — pure module.
  - `export function computePosterLayout(data: NetworkData, opts?): Map<string, {x: number; y: number}>`
  - Exports the tunable constants (`COLUMN_ORDER`, `TIER_ORDER`, pitches, gaps).
  - No DOM / Cytoscape dependency → unit-testable in isolation.
- **`src/layout/posterLayout.test.ts`** — vitest, matching existing test style
  (`graph.test.ts`, `data/network.test.ts`). Asserts:
  - every node gets a position;
  - column ordering (innate nodes' x < humoral nodes' x);
  - tier ordering (cell-tier y < function-tier y);
  - **no two node boxes overlap** given the configured pitches (the core
    guarantee), checked over the real dataset.
- **`src/components/GraphView.tsx`** — replace the `layout: { name: "fcose", … }`
  config with `layout: { name: "preset", positions }`, where `positions` comes
  from `computePosterLayout(networkData)`. Drop the fcose `cytoscape.use(...)`
  registration for this view. Everything else (theme re-skin effect, category /
  edge-type filters, selection focus + fit/zoom) is unchanged.

## Edges

**Decision for v1: keep the existing bezier edges.** The layout change is the
focus; edge styling is independent and reversible. The poster uses
elbow/orthogonal connectors, so switching `curve-style` to `taxi` would read as
more poster-faithful — recorded as a cosmetic follow-up, not part of this change.

## Optional, not in v1 (YAGNI)

- Column/tier header captions ("Innate immune response", etc.) drawn behind the
  graph. Nice poster touch; deferred.
- Re-flowing the layout when category/edge-type filters hide nodes (today the
  layout is static and filtering just hides elements — kept as-is).
- A toggle between poster layout and the old force layout.

## Out of scope

- Changing node/edge data, colors, theme, or the info panel.
- Hand-digitizing exact poster coordinates (rejected: brittle, high-effort).

## Risks / trade-offs

- **Whitespace:** table sizing to the widest bucket can leave sparse cells looking
  airy. Acceptable given the pannable canvas; tunable via gaps/pitches.
- **Edge crossings:** inherent to a cyclic biological network; barycenter ordering
  mitigates but won't eliminate them. Straight/taxi edges can be revisited later.
- **Fixed pitch wastes horizontal space** for short-labeled nodes. Accepted in
  exchange for a measurement-free hard guarantee.
