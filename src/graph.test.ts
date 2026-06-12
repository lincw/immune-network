import { describe, it, expect } from "vitest";
import { NetworkIndex, searchNodes } from "./graph";
import { networkData } from "./data/network";
import { CATEGORY_ORDER } from "./types";

const index = new NetworkIndex(networkData);

describe("searchNodes", () => {
  it("returns nothing for an empty query", () => {
    expect(searchNodes(networkData.nodes, "")).toEqual([]);
    expect(searchNodes(networkData.nodes, "   ")).toEqual([]);
  });

  it("finds an exact label match and ranks it first", () => {
    const results = searchNodes(networkData.nodes, "IL-6");
    expect(results[0]?.id).toBe("il6");
  });

  it("matches via synonyms (interferon gamma -> IFN-γ)", () => {
    const results = searchNodes(networkData.nodes, "interferon gamma");
    expect(results.map((n) => n.id)).toContain("ifng");
  });

  it("matches case-insensitively and by prefix", () => {
    const results = searchNodes(networkData.nodes, "th1");
    expect(results[0]?.id).toBe("th1");
  });

  it("respects the result limit", () => {
    const results = searchNodes(networkData.nodes, "il", 5);
    expect(results.length).toBeLessThanOrEqual(5);
  });
});

describe("NetworkIndex", () => {
  it("looks up nodes by id", () => {
    expect(index.getNode("th17")?.label).toBe("Th17");
    expect(index.getNode("does-not-exist")).toBeUndefined();
  });

  it("returns 1-hop neighbors in both directions", () => {
    const neighbors = index.neighborIds("th1");
    // Th1 differentiates from naive CD4 (incoming) and secretes IFN-γ (outgoing).
    expect(neighbors.has("naive-cd4")).toBe(true);
    expect(neighbors.has("ifng")).toBe(true);
  });

  it("lists connections with direction and connecting edge", () => {
    const conns = index.connections("th1");
    const ifng = conns.find((c) => c.node.id === "ifng");
    expect(ifng?.direction).toBe("outgoing");
    expect(ifng?.edge.type).toBe("secretes");
  });

  it("groups connections by category, then natural-sorts by label", () => {
    const conns = index.connections("th1");

    // Categories appear in CATEGORY_ORDER and never interleave.
    const ranks = conns.map((c) => CATEGORY_ORDER.indexOf(c.node.category));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));

    // Within each category, labels are in natural (numeric-aware) order.
    const byCat = new Map<string, string[]>();
    for (const c of conns) {
      const arr = byCat.get(c.node.category) ?? [];
      arr.push(c.node.label);
      byCat.set(c.node.category, arr);
    }
    for (const labels of byCat.values()) {
      const sorted = [...labels].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
      );
      expect(labels).toEqual(sorted);
    }
  });
});
