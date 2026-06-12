// Shared Cytoscape element + stylesheet builders used by both the full poster
// map (GraphView) and the expandable subnetwork explorer (SubnetworkView).

import type cytoscape from "cytoscape";
import type { ElementDefinition } from "cytoscape";
import { networkData } from "../data/network";
import type { Category } from "../types";
import type { GraphPalette } from "../theme";

/** All network nodes + edges as Cytoscape elements (used by the full map). */
export function buildAllElements(): ElementDefinition[] {
  return [...nodeElements(networkData.nodes.map((n) => n.id)), ...allEdgeElements()];
}

export function nodeElements(ids: Iterable<string>): ElementDefinition[] {
  const byId = new Map(networkData.nodes.map((n) => [n.id, n]));
  const out: ElementDefinition[] = [];
  for (const id of ids) {
    const n = byId.get(id);
    if (n) out.push({ data: { id: n.id, label: n.label, category: n.category } });
  }
  return out;
}

function allEdgeElements(): ElementDefinition[] {
  return networkData.edges.map((e, i) => edgeElement(e.source, e.target, e.type, e.label, i));
}

export function edgeElement(
  source: string,
  target: string,
  type: string,
  label: string | undefined,
  i: number,
): ElementDefinition {
  return {
    data: { id: `e${i}`, source, target, type, label: label ?? "" },
  };
}

/**
 * Edge elements among a given set of visible node ids — used to build the
 * induced subgraph for the subnetwork explorer.
 */
export function edgeElementsWithin(visible: Set<string>): ElementDefinition[] {
  const out: ElementDefinition[] = [];
  networkData.edges.forEach((e, i) => {
    if (visible.has(e.source) && visible.has(e.target)) {
      out.push(edgeElement(e.source, e.target, e.type, e.label, i));
    }
  });
  return out;
}

export function buildStylesheet(p: GraphPalette): cytoscape.StylesheetStyle[] {
  const categoryStyles = (Object.keys(p.fill) as Category[]).map((cat) => ({
    selector: `node[category = "${cat}"]`,
    style: {
      "background-color": p.fill[cat],
      "border-color": p.glow[cat],
    },
  }));

  return [
    {
      selector: "node",
      style: {
        label: "data(label)",
        width: 26,
        height: 26,
        "border-width": 1.5,
        "font-family": "IBM Plex Sans, system-ui, sans-serif",
        "font-size": 13,
        "font-weight": 500,
        color: p.text,
        "text-valign": "bottom",
        "text-margin-y": 5,
        // Generous max-width: Cytoscape horizontally condenses any wrapped line
        // that exceeds this, which made long labels look squished. Keeping it
        // wider than the longest word avoids that compression.
        "text-max-width": "220px",
        "text-wrap": "wrap",
        "text-background-color": p.labelBg,
        "text-background-opacity": 0.82,
        "text-background-padding": "3px",
        "text-background-shape": "roundrectangle",
        "transition-property": "opacity, width, height, border-width",
        "transition-duration": 180,
      },
    },
    ...categoryStyles,
    {
      selector: "edge",
      style: {
        width: 1,
        "line-color": p.edge,
        "target-arrow-color": p.edge,
        "target-arrow-shape": "triangle",
        "arrow-scale": 0.8,
        "curve-style": "bezier",
        opacity: 0.5,
        "transition-property": "opacity, line-color, width",
        "transition-duration": 180,
      },
    },
    // --- focus states ---
    // Dimmed nodes keep a faint dot but DROP their label so the focused
    // neighborhood reads clearly without overlapping text.
    { selector: "node.dim", style: { opacity: 0.16, "text-opacity": 0 } },
    { selector: "edge.dim", style: { opacity: 0.06 } },
    {
      selector: "node.neighbor",
      style: { width: 30, height: 30, "border-width": 2.5, "z-index": 50, "font-size": 14 },
    },
    {
      selector: "node.selected",
      style: {
        width: 46,
        height: 46,
        "border-width": 4,
        "font-size": 17,
        "font-weight": 600,
        "z-index": 100,
      },
    },
    // Subnetwork explorer: a node whose connections have NOT yet been pulled in
    // gets a dashed ring to signal "click to expand".
    {
      selector: "node.expandable",
      style: { "border-style": "dashed", "border-width": 2.5 },
    },
    {
      selector: "edge.active",
      style: {
        opacity: 0.95,
        width: 2,
        "line-color": p.edgeActive,
        "target-arrow-color": p.edgeActive,
        label: "data(label)",
        "font-family": "IBM Plex Mono, monospace",
        "font-size": 11,
        color: p.textDim,
        "text-background-color": p.labelBg,
        "text-background-opacity": 0.9,
        "text-background-padding": "2px",
      },
    },
    { selector: "node.hidden", style: { display: "none" } },
    { selector: "edge.hidden", style: { display: "none" } },
  ] as cytoscape.StylesheetStyle[];
}
