import { describe, it, expect } from "vitest";
import { networkData } from "../data/network";
import {
  COLUMN_ORDER,
  DEFAULT_OPTIONS,
  TIER_ORDER,
  computePosterLayout,
} from "./posterLayout";
import type { Category, Subsystem } from "../types";

const catOf = new Map(networkData.nodes.map((n) => [n.id, n.category]));
const subOf = new Map(networkData.nodes.map((n) => [n.id, n.subsystem]));

describe("poster swimlane layout", () => {
  const pos = computePosterLayout(networkData);

  it("assigns a position to every node", () => {
    expect(pos.size).toBe(networkData.nodes.length);
    for (const p of pos.values()) {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    }
  });

  it("orders subsystems left -> right (innate < humoral)", () => {
    const meanX = (s: Subsystem) => {
      const xs = networkData.nodes
        .filter((n) => n.subsystem === s)
        .map((n) => pos.get(n.id)!.x);
      return xs.reduce((a, b) => a + b, 0) / xs.length;
    };
    for (let i = 1; i < COLUMN_ORDER.length; i++) {
      expect(meanX(COLUMN_ORDER[i - 1])).toBeLessThan(meanX(COLUMN_ORDER[i]));
    }
  });

  it("orders tiers top -> bottom (cell < function)", () => {
    const meanY = (c: Category) => {
      const ys = networkData.nodes
        .filter((n) => n.category === c)
        .map((n) => pos.get(n.id)!.y);
      return ys.reduce((a, b) => a + b, 0) / ys.length;
    };
    for (let i = 1; i < TIER_ORDER.length; i++) {
      expect(meanY(TIER_ORDER[i - 1])).toBeLessThan(meanY(TIER_ORDER[i]));
    }
  });

  it("guarantees no two node label-boxes overlap", () => {
    // Each node owns a box of pitchX x pitchY centered on its position. If no two
    // boxes overlap, neither do the circles or their labels (which fit inside).
    const halfW = DEFAULT_OPTIONS.nodePitchX / 2;
    const halfH = DEFAULT_OPTIONS.nodePitchY / 2;
    const ids = [...pos.keys()];
    // Allow exact edge-touching (shared boundary) but not interpenetration.
    const eps = 1e-6;
    for (let i = 0; i < ids.length; i++) {
      const a = pos.get(ids[i])!;
      for (let j = i + 1; j < ids.length; j++) {
        const b = pos.get(ids[j])!;
        const overlapX = Math.abs(a.x - b.x) < 2 * halfW - eps;
        const overlapY = Math.abs(a.y - b.y) < 2 * halfH - eps;
        if (overlapX && overlapY) {
          throw new Error(
            `nodes overlap: ${ids[i]} (${catOf.get(ids[i])}/${subOf.get(
              ids[i],
            )}) and ${ids[j]} (${catOf.get(ids[j])}/${subOf.get(ids[j])})`,
          );
        }
      }
    }
  });

  it("is deterministic across runs", () => {
    const a = computePosterLayout(networkData);
    const b = computePosterLayout(networkData);
    for (const [id, p] of a) {
      expect(b.get(id)).toEqual(p);
    }
  });
});
