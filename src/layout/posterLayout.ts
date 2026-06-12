// Poster-faithful hierarchical "swimlane" layout.
//
// The Peprotech *Immunologic networks* poster is not a strict tree — it is a
// curated map organized on two axes that our data model already encodes:
//
//   * horizontal = immune arm      -> NetworkNode.subsystem (columns)
//   * vertical   = flow of causation -> NetworkNode.category (tiers)
//
// We lay nodes out as a TABLE: each (subsystem, category) bucket is a mini-grid,
// and columns/tiers are sized to their largest bucket. Because every bucket fits
// inside its sized cell and node slots use a fixed pitch wider than the largest
// possible label box, no two nodes — labels included — can overlap. The
// non-overlap guarantee is structural, not the result of tuning a force layout.

import type { Category, NetworkData, Subsystem } from "../types";

export interface Point {
  x: number;
  y: number;
}

/** Column order, left -> right, mirroring the poster's innate -> adaptive read. */
export const COLUMN_ORDER: Subsystem[] = ["innate", "shared", "cellular", "humoral"];

/** Tier order, top -> bottom, following the poster's flow of causation. */
export const TIER_ORDER: Category[] = [
  "cell", // sources / actors
  "receptor", // surface molecules on those cells
  "cytokine", // secreted signals
  "transcriptionFactor", // intracellular programs driven by signals
  "antibody", // humoral effectors
  "function", // downstream outcomes
];

export interface PosterLayoutOptions {
  /**
   * Horizontal slot pitch. Must exceed the widest possible label box. Labels
   * wrap at text-max-width 220px, so the default leaves a comfortable margin.
   */
  nodePitchX: number;
  /** Vertical slot pitch: node circle + wrapped label height + margin. */
  nodePitchY: number;
  /** Gap inserted between adjacent table columns. */
  columnGap: number;
  /** Gap inserted between adjacent table tiers. */
  tierGap: number;
}

export const DEFAULT_OPTIONS: PosterLayoutOptions = {
  nodePitchX: 250,
  nodePitchY: 96,
  columnGap: 80,
  tierGap: 70,
};

const columnIndex = (s: Subsystem) => COLUMN_ORDER.indexOf(s);
const tierIndex = (c: Category) => TIER_ORDER.indexOf(c);

/** Square-ish sub-grid: ceil(sqrt(n)) sub-columns. */
function subGridCols(n: number): number {
  return Math.max(1, Math.ceil(Math.sqrt(n)));
}

/**
 * Order node ids within each tier to reduce edge crossings. A node's key is the
 * mean column index of its graph neighbors (barycenter); ties keep the original
 * dataset order for determinism. Applied per tier across the whole row so the
 * ordering is consistent between that tier's buckets.
 */
function orderByBarycenter(data: NetworkData): Map<string, number> {
  const colOf = new Map<string, number>();
  for (const n of data.nodes) colOf.set(n.id, columnIndex(n.subsystem));

  const neighbors = new Map<string, string[]>();
  for (const n of data.nodes) neighbors.set(n.id, []);
  for (const e of data.edges) {
    neighbors.get(e.source)?.push(e.target);
    neighbors.get(e.target)?.push(e.source);
  }

  const bary = new Map<string, number>();
  for (const n of data.nodes) {
    const nbrs = neighbors.get(n.id) ?? [];
    if (nbrs.length === 0) {
      bary.set(n.id, columnIndex(n.subsystem));
      continue;
    }
    const sum = nbrs.reduce((acc, id) => acc + (colOf.get(id) ?? 0), 0);
    bary.set(n.id, sum / nbrs.length);
  }
  return bary;
}

/**
 * Compute absolute (x, y) positions for every node as a poster-faithful swimlane
 * table. Returns a Map keyed by node id, ready to feed Cytoscape's `preset`
 * layout.
 */
export function computePosterLayout(
  data: NetworkData,
  options: Partial<PosterLayoutOptions> = {},
): Map<string, Point> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const cols = COLUMN_ORDER.length;
  const tiers = TIER_ORDER.length;

  // Stable original order, then a barycenter sweep for crossing reduction.
  const originalIndex = new Map<string, number>();
  data.nodes.forEach((n, i) => originalIndex.set(n.id, i));
  const bary = orderByBarycenter(data);

  // Bucket nodes by (tier, column).
  const buckets: string[][][] = Array.from({ length: tiers }, () =>
    Array.from({ length: cols }, () => [] as string[]),
  );
  for (const n of data.nodes) {
    const t = tierIndex(n.category);
    const c = columnIndex(n.subsystem);
    if (t < 0 || c < 0) continue; // defensive: unknown category/subsystem
    buckets[t][c].push(n.id);
  }

  // Sort each bucket by barycenter, breaking ties with the original order.
  for (let t = 0; t < tiers; t++) {
    for (let c = 0; c < cols; c++) {
      buckets[t][c].sort((a, b) => {
        const d = (bary.get(a) ?? 0) - (bary.get(b) ?? 0);
        if (d !== 0) return d;
        return (originalIndex.get(a) ?? 0) - (originalIndex.get(b) ?? 0);
      });
    }
  }

  // Bucket footprints (in slot counts), and the derived table sizing.
  const bucketCols: number[][] = Array.from({ length: tiers }, () =>
    new Array(cols).fill(0),
  );
  const bucketRows: number[][] = Array.from({ length: tiers }, () =>
    new Array(cols).fill(0),
  );
  for (let t = 0; t < tiers; t++) {
    for (let c = 0; c < cols; c++) {
      const n = buckets[t][c].length;
      const sc = subGridCols(n);
      bucketCols[t][c] = n === 0 ? 0 : sc;
      bucketRows[t][c] = n === 0 ? 0 : Math.ceil(n / sc);
    }
  }

  // Column width = max sub-columns across that column's tiers; tier height =
  // max sub-rows across that tier's columns. Empty -> 1 slot so the table keeps
  // a regular shape.
  const colSlotCount = new Array(cols).fill(1);
  for (let c = 0; c < cols; c++) {
    let m = 1;
    for (let t = 0; t < tiers; t++) m = Math.max(m, bucketCols[t][c]);
    colSlotCount[c] = m;
  }
  const tierSlotCount = new Array(tiers).fill(1);
  for (let t = 0; t < tiers; t++) {
    let m = 1;
    for (let c = 0; c < cols; c++) m = Math.max(m, bucketRows[t][c]);
    tierSlotCount[t] = m;
  }

  // Cumulative pixel origins (left edge of each column, top edge of each tier).
  const colWidthPx = colSlotCount.map((s) => s * opts.nodePitchX);
  const tierHeightPx = tierSlotCount.map((s) => s * opts.nodePitchY);

  const colLeft = new Array(cols).fill(0);
  for (let c = 1; c < cols; c++) {
    colLeft[c] = colLeft[c - 1] + colWidthPx[c - 1] + opts.columnGap;
  }
  const tierTop = new Array(tiers).fill(0);
  for (let t = 1; t < tiers; t++) {
    tierTop[t] = tierTop[t - 1] + tierHeightPx[t - 1] + opts.tierGap;
  }

  // Emit positions: center each bucket's sub-grid within its sized cell.
  const positions = new Map<string, Point>();
  for (let t = 0; t < tiers; t++) {
    for (let c = 0; c < cols; c++) {
      const ids = buckets[t][c];
      if (ids.length === 0) continue;
      const sc = bucketCols[t][c];
      const sr = bucketRows[t][c];

      // Pixel size of this bucket's sub-grid, centered in the sized cell.
      const gridW = sc * opts.nodePitchX;
      const gridH = sr * opts.nodePitchY;
      const cellW = colWidthPx[c];
      const cellH = tierHeightPx[t];
      const offsetX = colLeft[c] + (cellW - gridW) / 2;
      const offsetY = tierTop[t] + (cellH - gridH) / 2;

      ids.forEach((id, i) => {
        const sx = i % sc;
        const sy = Math.floor(i / sc);
        positions.set(id, {
          // +half pitch to land on slot centers.
          x: offsetX + sx * opts.nodePitchX + opts.nodePitchX / 2,
          y: offsetY + sy * opts.nodePitchY + opts.nodePitchY / 2,
        });
      });
    }
  }

  return positions;
}
