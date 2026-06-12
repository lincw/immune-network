import { useEffect, useMemo, useRef } from "react";
import cytoscape, { type Core, type ElementDefinition } from "cytoscape";
import { networkData } from "../data/network";
import { computePosterLayout } from "../layout/posterLayout";
import type { Category, EdgeType } from "../types";
import { graphPalette, type GraphPalette, type ThemeName } from "../theme";

interface GraphViewProps {
  selectedId: string | null;
  activeCategories: Set<Category>;
  activeEdgeTypes: Set<EdgeType>;
  theme: ThemeName;
  onSelect: (id: string | null) => void;
}

function buildElements(): ElementDefinition[] {
  const nodes: ElementDefinition[] = networkData.nodes.map((n) => ({
    data: { id: n.id, label: n.label, category: n.category },
  }));
  const edges: ElementDefinition[] = networkData.edges.map((e, i) => ({
    data: {
      id: `e${i}`,
      source: e.source,
      target: e.target,
      type: e.type,
      label: e.label ?? "",
    },
  }));
  return [...nodes, ...edges];
}

function buildStylesheet(p: GraphPalette): cytoscape.StylesheetStyle[] {
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

export default function GraphView({
  selectedId,
  activeCategories,
  activeEdgeTypes,
  theme,
  onSelect,
}: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const elements = useMemo(buildElements, []);
  // Poster-faithful swimlane positions (columns = subsystem, tiers = category).
  // Deterministic, computed once; guarantees no node/label overlap by construction.
  const positions = useMemo(() => computePosterLayout(networkData), []);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Initialize Cytoscape once.
  useEffect(() => {
    if (!containerRef.current) return;
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      wheelSensitivity: 0.25,
      minZoom: 0.2,
      maxZoom: 3,
      style: buildStylesheet(graphPalette(theme)),
      layout: {
        name: "preset",
        positions: (el: cytoscape.NodeSingular) =>
          positions.get(el.id()) ?? { x: 0, y: 0 },
        padding: 60,
        fit: true,
      } as cytoscape.LayoutOptions,
    });

    cy.on("tap", "node", (evt) => onSelectRef.current(evt.target.id()));
    cy.on("tap", (evt) => {
      if (evt.target === cy) onSelectRef.current(null);
    });

    cyRef.current = cy;
    const handleResize = () => cy.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cy.destroy();
      cyRef.current = null;
    };
    // theme intentionally excluded: applied via the dedicated effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, positions]);

  // Re-skin the canvas when the theme changes (classes/positions preserved).
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.style().fromJson(buildStylesheet(graphPalette(theme))).update();
  }, [theme]);

  // Apply category + edge-type visibility filters. An edge is hidden if either
  // endpoint's category is hidden or its relationship type is toggled off.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.nodes().forEach((n) => {
        const visible = activeCategories.has(n.data("category") as Category);
        n.toggleClass("hidden", !visible);
      });
      cy.edges().forEach((e) => {
        const typeOff = !activeEdgeTypes.has(e.data("type") as EdgeType);
        const endpointHidden =
          e.source().hasClass("hidden") || e.target().hasClass("hidden");
        e.toggleClass("hidden", typeOff || endpointHidden);
      });
    });
  }, [activeCategories, activeEdgeTypes]);

  // Apply focus highlighting whenever the selection changes.
  //
  // The poster layout deliberately spreads the full network across a wide
  // canvas, so a node's neighbors can sit columns/tiers away. On focus we
  // therefore PULL the selected node's neighborhood into a compact concentric
  // cluster (selected node centered, neighbors ringed around it) so the
  // sub-network reads as its own small graph. Clearing the selection animates
  // every node back to its canonical poster position.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Reset classes and return all nodes to their canonical poster spots so we
    // always start the focus animation from a known state (also undoes a prior
    // selection's compacting).
    cy.batch(() => {
      cy.elements().removeClass("dim neighbor selected active");
      cy.nodes().forEach((n) => {
        const p = positions.get(n.id());
        if (p) n.position({ x: p.x, y: p.y });
      });
    });

    if (!selectedId) {
      cy.animate(
        { fit: { eles: cy.elements(":visible"), padding: 50 } },
        { duration: 420, easing: "ease-in-out-cubic" },
      );
      return;
    }

    const node = cy.getElementById(selectedId);
    if (node.empty()) return;

    const connectedEdges = node.connectedEdges();
    const neighbors = connectedEdges.connectedNodes();

    cy.batch(() => {
      cy.nodes().addClass("dim");
      cy.edges().addClass("dim");
      neighbors.removeClass("dim").addClass("neighbor");
      node.removeClass("dim neighbor").addClass("selected");
      connectedEdges.removeClass("dim").addClass("active");
    });

    // Compact the neighborhood with a concentric layout: the selected node in
    // the center, its neighbors ringed around it. Spacing accounts for label
    // size so even hub nodes with many neighbors stay readable and non-overlapping
    // (the ring grows as needed); the subsequent fit zooms the cluster in.
    const layout = node.closedNeighborhood().nodes().layout({
      name: "concentric",
      animate: true,
      animationDuration: 380,
      animationEasing: "ease-in-out-cubic",
      fit: false,
      nodeDimensionsIncludeLabels: true,
      concentric: (n: cytoscape.NodeSingular) => (n.id() === selectedId ? 100 : 1),
      levelWidth: () => 1,
      minNodeSpacing: 24,
      spacingFactor: 1.1,
    } as cytoscape.LayoutOptions);

    layout.one("layoutstop", () => {
      cy.animate(
        { fit: { eles: node.closedNeighborhood(), padding: 90 } },
        {
          duration: 340,
          easing: "ease-in-out-cubic",
          // Shift the focused cluster left so right-side neighbors aren't
          // hidden behind the info panel that overlays the right edge.
          complete: () => cy.animate({ panBy: { x: -150, y: 0 } }, { duration: 200 }),
        },
      );
    });
    layout.run();
  }, [selectedId, positions]);

  return <div ref={containerRef} className="graph-canvas" />;
}
