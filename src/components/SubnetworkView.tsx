import { useEffect, useRef } from "react";
import cytoscape, { type Core, type ElementDefinition } from "cytoscape";
import fcose from "cytoscape-fcose";
import type { NetworkIndex } from "../graph";
import { graphPalette, type ThemeName } from "../theme";
import {
  buildStylesheet,
  edgeElementsWithin,
  nodeElements,
} from "./graphStyle";

cytoscape.use(fcose);

interface SubnetworkViewProps {
  index: NetworkIndex;
  /** Every node currently in the subnetwork (expanded nodes + their neighbors). */
  visibleIds: Set<string>;
  /** Nodes the user has expanded (their connections are pulled in). */
  expanded: Set<string>;
  /** Node shown in the info panel / emphasized. */
  selectedId: string | null;
  theme: ThemeName;
  /** Tapping a node both selects and expands it (App grows the subnetwork). */
  onTapNode: (id: string) => void;
  /** Right-clicking a node hides it (and any orphaned neighbors). */
  onHideNode: (id: string) => void;
}

export default function SubnetworkView({
  index,
  visibleIds,
  expanded,
  selectedId,
  theme,
  onTapNode,
  onHideNode,
}: SubnetworkViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const onTapRef = useRef(onTapNode);
  onTapRef.current = onTapNode;
  const onHideRef = useRef(onHideNode);
  onHideRef.current = onHideNode;

  // Create the (initially empty) Cytoscape instance once.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cy = cytoscape({
      container,
      elements: [],
      wheelSensitivity: 0.25,
      minZoom: 0.2,
      maxZoom: 3,
      style: buildStylesheet(graphPalette(theme)),
    });
    cy.on("tap", "node", (evt) => onTapRef.current(evt.target.id()));
    cy.on("cxttap", "node", (evt) => onHideRef.current(evt.target.id()));
    cyRef.current = cy;

    // Suppress the browser context menu so right-click maps cleanly to "hide".
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    container.addEventListener("contextmenu", onContextMenu);
    const handleResize = () => cy.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      container.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("resize", handleResize);
      cy.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-skin on theme change (positions/classes preserved).
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.style().fromJson(buildStylesheet(graphPalette(theme))).update();
  }, [theme]);

  // Sync elements to the visible set, then run a force layout. New nodes are
  // seeded near an already-placed neighbor so growth eases out from the parent
  // rather than jumping; the first layout is randomized.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const firstLayout = cy.nodes().length === 0;
    const desiredEdges = edgeElementsWithin(visibleIds);
    const desiredEdgeIds = new Set(desiredEdges.map((e) => e.data.id as string));

    cy.batch(() => {
      // Remove anything no longer in the subnetwork.
      cy.nodes().forEach((n) => {
        if (!visibleIds.has(n.id())) n.remove();
      });
      cy.edges().forEach((e) => {
        if (!desiredEdgeIds.has(e.id())) e.remove();
      });

      // Add newly visible nodes.
      const newIds = [...visibleIds].filter((id) => cy.getElementById(id).empty());
      cy.add(nodeElements(newIds));

      // Add edges whose endpoints now both exist.
      const newEdges = desiredEdges.filter((e) => cy.getElementById(e.data.id as string).empty());
      cy.add(newEdges);

      // Seed each new node near an existing neighbor for a smooth grow-out.
      if (!firstLayout) {
        for (const id of newIds) {
          const seed = seedPositionFor(cy, id, desiredEdges, newIds);
          if (seed) cy.getElementById(id).position(seed);
        }
      }
    });

    applyClasses(cy, index, visibleIds, expanded, selectedId);

    const layout = cy.elements().layout({
      name: "fcose",
      quality: "default",
      animate: true,
      animationDuration: 420,
      animationEasing: "ease-in-out-cubic",
      fit: false,
      randomize: firstLayout,
      nodeDimensionsIncludeLabels: true,
      idealEdgeLength: 95,
      nodeSeparation: 90,
      nodeRepulsion: 6500,
      padding: 30,
    } as cytoscape.LayoutOptions);

    layout.one("layoutstop", () => {
      cy.animate(
        { fit: { eles: cy.elements(), padding: 70 } },
        {
          duration: 360,
          easing: "ease-in-out-cubic",
          // Nudge left so the info panel on the right doesn't cover nodes.
          complete: () =>
            cy.animate({ panBy: { x: -130, y: 0 } }, { duration: 160, easing: "ease-in-out-cubic" }),
        },
      );
    });
    layout.run();
    // expanded/selectedId handled here on growth; selection-only updates below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleIds]);

  // Selection-only changes (no new nodes) just restyle — no relayout.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    applyClasses(cy, index, visibleIds, expanded, selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, expanded]);

  return <div ref={containerRef} className="graph-canvas" />;
}

/** Position a new node at an already-placed neighbor's spot plus a small offset. */
function seedPositionFor(
  cy: Core,
  id: string,
  edges: ElementDefinition[],
  newIds: string[],
): cytoscape.Position | null {
  const isNew = new Set(newIds);
  for (const e of edges) {
    const data = e.data as { source?: string; target?: string };
    const other =
      data.source === id ? data.target : data.target === id ? data.source : undefined;
    if (!other || isNew.has(other)) continue;
    const node = cy.getElementById(other);
    if (node.nonempty()) {
      const p = node.position();
      const a = Math.random() * Math.PI * 2;
      return { x: p.x + Math.cos(a) * 50, y: p.y + Math.sin(a) * 50 };
    }
  }
  return null;
}

/** Apply selected / expandable styling and highlight the selected node's edges. */
function applyClasses(
  cy: Core,
  index: NetworkIndex,
  visibleIds: Set<string>,
  expanded: Set<string>,
  selectedId: string | null,
): void {
  cy.batch(() => {
    cy.elements().removeClass("selected expandable active");
    cy.nodes().forEach((n) => {
      const id = n.id();
      if (expanded.has(id)) return;
      // Expandable = has at least one neighbor not yet in the subnetwork.
      for (const nb of index.neighborIds(id)) {
        if (!visibleIds.has(nb)) {
          n.addClass("expandable");
          break;
        }
      }
    });
    if (selectedId) {
      const sel = cy.getElementById(selectedId);
      if (sel.nonempty()) {
        sel.addClass("selected");
        sel.connectedEdges().addClass("active");
      }
    }
  });
}
