import { useEffect, useMemo, useState } from "react";
import GraphView from "./components/GraphView";
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

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1 className="brand-title">Immune Network</h1>
          <span className="brand-sub">Explorer</span>
        </div>
        <SearchBar onSelect={setSelectedId} />
        <div className="topbar-actions">
          {selectedId && (
            <button className="ghost-btn" onClick={() => setSelectedId(null)}>
              Reset view
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
        <GraphView
          selectedId={selectedId}
          activeCategories={activeCategories}
          activeEdgeTypes={activeEdgeTypes}
          theme={theme}
          onSelect={setSelectedId}
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
        <InfoPanel node={selectedNode} index={index} onSelect={setSelectedId} />
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
