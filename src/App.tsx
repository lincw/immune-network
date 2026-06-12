import { useCallback, useEffect, useMemo, useState } from "react";
import GraphView from "./components/GraphView";
import SubnetworkView from "./components/SubnetworkView";
import Landing from "./components/Landing";
import SearchBar from "./components/SearchBar";
import InfoPanel from "./components/InfoPanel";
import Legend from "./components/Legend";
import { NetworkIndex } from "./graph";
import { networkData } from "./data/network";
import {
  CATEGORY_ORDER,
  EDGE_TYPE_ORDER,
  type Category,
  type EdgeType,
} from "./types";
import type { ThemeName } from "./theme";
import "./styles/app.css";

type Mode = "landing" | "explore" | "fullmap";

function initialTheme(): ThemeName {
  const saved = localStorage.getItem("inet-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export default function App() {
  const index = useMemo(() => new NetworkIndex(networkData), []);
  const counts = useMemo(() => countByCategory(), []);
  const edgeCounts = useMemo(() => countByEdgeType(), []);

  const [mode, setMode] = useState<Mode>("landing");
  // Exploration state. `visibleIds` is the explicit subnetwork (so hidden nodes
  // aren't re-derived back in); `expanded` are the nodes whose neighbors have
  // been pulled in (drives the dashed "expandable" affordance); `selectedId`
  // is the node shown in the info panel.
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set());
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(
    () => new Set(CATEGORY_ORDER),
  );
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Set<EdgeType>>(
    () => new Set(EDGE_TYPE_ORDER),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("inet-theme", theme);
  }, [theme]);

  const selectedNode = selectedId ? (index.getNode(selectedId) ?? null) : null;

  const goHome = useCallback(() => {
    setMode("landing");
    setVisibleIds(new Set());
    setExpanded(new Set());
    setSelectedId(null);
  }, []);

  // Start a fresh exploration rooted on a node (from search or an example card).
  const exploreNode = useCallback(
    (id: string) => {
      const vis = new Set<string>([id]);
      for (const nb of index.neighborIds(id)) vis.add(nb);
      setVisibleIds(vis);
      setExpanded(new Set([id]));
      setSelectedId(id);
      setMode("explore");
    },
    [index],
  );

  // Tapping a node inside the explorer selects it AND expands it (grows the
  // subnetwork). Clicking an already-expanded node just re-selects it.
  const tapNode = useCallback(
    (id: string) => {
      setSelectedId(id);
      setExpanded((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
      setVisibleIds((prev) => {
        let changed = !prev.has(id);
        const next = new Set(prev);
        next.add(id);
        for (const nb of index.neighborIds(id)) {
          if (!next.has(nb)) {
            next.add(nb);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    },
    [index],
  );

  // Hide a node from the subnetwork, then drop any of its direct neighbors that
  // are left without a link to anything else still on screen.
  const hideNode = useCallback(
    (id: string) => {
      if (!visibleIds.has(id)) return;
      const next = new Set(visibleIds);
      const removed = new Set<string>([id]);
      next.delete(id);
      for (const nb of index.neighborIds(id)) {
        if (!next.has(nb)) continue;
        let linked = false;
        for (const nb2 of index.neighborIds(nb)) {
          if (next.has(nb2)) {
            linked = true;
            break;
          }
        }
        if (!linked) {
          next.delete(nb);
          removed.add(nb);
        }
      }
      if (next.size === 0) {
        goHome();
        return;
      }
      setVisibleIds(next);
      setExpanded((prev) => {
        const e = new Set(prev);
        for (const r of removed) e.delete(r);
        return e;
      });
      setSelectedId((prev) => (prev && removed.has(prev) ? null : prev));
    },
    [visibleIds, index, goHome],
  );

  const toggleCategory = (cat: Category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      // Never allow an empty graph — re-enable all if the last one is removed.
      return next.size === 0 ? new Set(CATEGORY_ORDER) : next;
    });
  };

  const toggleEdgeType = (type: EdgeType) => {
    setActiveEdgeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const setAllEdgeTypes = (on: boolean) => {
    setActiveEdgeTypes(on ? new Set(EDGE_TYPE_ORDER) : new Set());
  };

  if (mode === "landing") {
    return (
      <div className="app">
        <Landing
          index={index}
          onPick={exploreNode}
          onOpenFullMap={() => setMode("fullmap")}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand brand--btn" onClick={goHome} title="Back to start">
          <h1 className="brand-title">Immune Network</h1>
          <span className="brand-sub">Explorer</span>
        </button>
        <SearchBar onSelect={exploreNode} />
        <div className="topbar-actions">
          {mode === "explore" && (
            <button className="ghost-btn" onClick={() => setMode("fullmap")}>
              Full map
            </button>
          )}
          {mode === "fullmap" && (
            <button className="ghost-btn" onClick={goHome}>
              Home
            </button>
          )}
          <button
            className="icon-btn"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </header>

      <main className="stage">
        {mode === "explore" ? (
          <>
            <SubnetworkView
              index={index}
              visibleIds={visibleIds}
              expanded={expanded}
              selectedId={selectedId}
              theme={theme}
              onTapNode={tapNode}
              onHideNode={hideNode}
            />
            <InfoPanel
              node={selectedNode}
              index={index}
              onSelect={tapNode}
              onHide={hideNode}
            />
            <p className="explore-hint">
              Click a ringed node to expand · right-click a node to hide it
            </p>
          </>
        ) : (
          <>
            <GraphView
              activeCategories={activeCategories}
              activeEdgeTypes={activeEdgeTypes}
              theme={theme}
              onOpenNode={exploreNode}
            />
            <Legend
              active={activeCategories}
              counts={counts}
              onToggle={toggleCategory}
              activeEdgeTypes={activeEdgeTypes}
              edgeCounts={edgeCounts}
              onToggleEdgeType={toggleEdgeType}
              onSetAllEdgeTypes={setAllEdgeTypes}
            />
            <p className="explore-hint">Click any node to explore its subnetwork</p>
          </>
        )}
      </main>

      <footer className="footof">
        <span>
          {networkData.nodes.length} entities · {networkData.edges.length} relationships
        </span>
        <span className="footof-note">
          Curated immunology graph · concept after PeproTech “Immunologic networks”
        </span>
      </footer>
    </div>
  );
}

function countByCategory(): Record<Category, number> {
  const counts = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c, 0]),
  ) as Record<Category, number>;
  for (const node of networkData.nodes) counts[node.category] += 1;
  return counts;
}

function countByEdgeType(): Record<EdgeType, number> {
  const counts = Object.fromEntries(
    EDGE_TYPE_ORDER.map((t) => [t, 0]),
  ) as Record<EdgeType, number>;
  for (const edge of networkData.edges) counts[edge.type] += 1;
  return counts;
}
