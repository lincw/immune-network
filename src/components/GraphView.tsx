import { useEffect, useMemo, useRef } from "react";
import cytoscape, { type Core } from "cytoscape";
import { networkData } from "../data/network";
import { computePosterLayout } from "../layout/posterLayout";
import type { Category, EdgeType } from "../types";
import { graphPalette, type ThemeName } from "../theme";
import { buildAllElements, buildStylesheet } from "./graphStyle";

interface GraphViewProps {
  activeCategories: Set<Category>;
  activeEdgeTypes: Set<EdgeType>;
  theme: ThemeName;
  /** Tapping a node opens it in the subnetwork explorer. */
  onOpenNode: (id: string) => void;
}

/**
 * The full poster "map" overview: every node placed by the deterministic
 * swimlane layout (columns = subsystem, tiers = category), with the legend
 * filters applied. This is the optional bird's-eye view; tapping any node drops
 * into the subnetwork explorer rooted on it.
 */
export default function GraphView({
  activeCategories,
  activeEdgeTypes,
  theme,
  onOpenNode,
}: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const elements = useMemo(buildAllElements, []);
  // Poster-faithful swimlane positions; deterministic, computed once.
  const positions = useMemo(() => computePosterLayout(networkData), []);
  const onOpenRef = useRef(onOpenNode);
  onOpenRef.current = onOpenNode;

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
        positions: (el: cytoscape.NodeSingular) => positions.get(el.id()) ?? { x: 0, y: 0 },
        padding: 60,
        fit: true,
      } as cytoscape.LayoutOptions,
    });

    cy.on("tap", "node", (evt) => onOpenRef.current(evt.target.id()));

    cyRef.current = cy;
    const handleResize = () => cy.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cy.destroy();
      cyRef.current = null;
    };
    // theme handled by the dedicated effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, positions]);

  // Re-skin on theme change (positions preserved).
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.style().fromJson(buildStylesheet(graphPalette(theme))).update();
  }, [theme]);

  // Category + edge-type visibility filters. An edge is hidden if either
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
        const endpointHidden = e.source().hasClass("hidden") || e.target().hasClass("hidden");
        e.toggleClass("hidden", typeOff || endpointHidden);
      });
    });
  }, [activeCategories, activeEdgeTypes]);

  return <div ref={containerRef} className="graph-canvas" />;
}
