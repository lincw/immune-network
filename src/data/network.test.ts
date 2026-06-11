import { describe, it, expect } from "vitest";
import { networkData } from "./network";
import { CATEGORY_ORDER, type Category, type Subsystem } from "../types";

const VALID_SUBSYSTEMS: Subsystem[] = ["humoral", "cellular", "innate", "shared"];
const VALID_CATEGORIES = new Set<Category>(CATEGORY_ORDER);

describe("network data integrity", () => {
  const ids = networkData.nodes.map((n) => n.id);
  const idSet = new Set(ids);

  it("has no duplicate node ids", () => {
    expect(ids.length).toBe(idSet.size);
  });

  it("every edge references existing source and target nodes", () => {
    const dangling = networkData.edges.filter(
      (e) => !idSet.has(e.source) || !idSet.has(e.target),
    );
    expect(dangling).toEqual([]);
  });

  it("has no self-loops", () => {
    const loops = networkData.edges.filter((e) => e.source === e.target);
    expect(loops).toEqual([]);
  });

  it("uses only valid categories and subsystems", () => {
    for (const node of networkData.nodes) {
      expect(VALID_CATEGORIES.has(node.category)).toBe(true);
      expect(VALID_SUBSYSTEMS).toContain(node.subsystem);
    }
  });

  it("gives every node a non-empty label and description", () => {
    for (const node of networkData.nodes) {
      expect(node.label.trim().length).toBeGreaterThan(0);
      expect(node.description.trim().length).toBeGreaterThan(10);
    }
  });

  it("has no fully isolated nodes (every node has at least one edge)", () => {
    const connected = new Set<string>();
    for (const e of networkData.edges) {
      connected.add(e.source);
      connected.add(e.target);
    }
    const isolated = networkData.nodes
      .map((n) => n.id)
      .filter((id) => !connected.has(id));
    expect(isolated).toEqual([]);
  });

  it("provides broad coverage (>= 100 nodes across all categories)", () => {
    expect(networkData.nodes.length).toBeGreaterThanOrEqual(100);
    const present = new Set(networkData.nodes.map((n) => n.category));
    for (const c of CATEGORY_ORDER) expect(present.has(c)).toBe(true);
  });
});
