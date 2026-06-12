import { useCallback, useEffect, useMemo, useState } from "react";
import GraphView from "./components/GraphView";
import SubnetworkView from "./components/SubnetworkView";
import Landing from "./components/Landing";
import SearchBar from "./components/SearchBar";
import InfoPanel from "./components/InfoPanel";
import Legend from "./components/Legend";
import Library from "./components/Library";
import { NetworkIndex } from "./graph";
import { networkData } from "./data/network";
import { buildArticleNodeIndex } from "./content/articles/nodeLinks";
import {
  CATEGORY_ORDER,
  EDGE_TYPE_ORDER,
  type Category,
  type EdgeType,
} from "./types";
import type { ThemeName } from "./theme";
import "./styles/app.css";

type Mode = "landing" | "explore" | "fullmap" | "library";

// Browser-history state for the "major" views (landing, an explore root,
// the full map, and the library list/an article). Interactions within the
// explorer (expanding/hiding nodes) don't push new entries.
type NavState =
  | { mode: "landing" }
  | { mode: "explore"; nodeId: string }
  | { mode: "fullmap" }
  | { mode: "library"; articleId?: string };

function navUrl(state: NavState): string {
  switch (state.mode) {
    case "landing":
      return window.location.pathname + window.location.search;
    case "explore":
      return `#/explore/${encodeURIComponent(state.nodeId)}`;
    case "fullmap":
      return "#/map";
    case "library":
      return state.articleId
        ? `#/library/${encodeURIComponent(state.articleId)}`
        : "#/library";
  }
}

/** Parse `#/explore/<id>`, `#/map`, `#/library` or `#/library/<id>` from the
 * current URL hash. Anything else (including in-page TOC anchors like
 * `#some-heading`, which don't start with `#/`) falls back to landing. */
function parseNavState(): NavState {
  const m = window.location.hash.match(/^#\/([a-z]+)(?:\/(.+))?$/);
  if (!m) return { mode: "landing" };
  const [, seg, rest] = m;
  switch (seg) {
    case "explore":
      return rest ? { mode: "explore", nodeId: decodeURIComponent(rest) } : { mode: "landing" };
    case "map":
      return { mode: "fullmap" };
    case "library":
      return { mode: "library", articleId: rest ? decodeURIComponent(rest) : undefined };
    default:
      return { mode: "landing" };
  }
}

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
  const articleNodeIndex = useMemo(() => buildArticleNodeIndex(), []);

  const [mode, setMode] = useState<Mode>("landing");
  // Exploration state. `visibleIds` is the explicit subnetwork (so hidden nodes
  // aren't re-derived back in); `expanded` are the nodes whose neighbors have
  // been pulled in (drives the dashed "expandable" affordance); `selectedId`
  // is the node shown in the info panel.
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set());
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [libraryArticleId, setLibraryArticleId] = useState<string | null>(null);

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

  // Apply a NavState to React state without touching browser history (used
  // both by `navigate` and by the popstate handler).
  const applyNavState = useCallback(
    (state: NavState) => {
      switch (state.mode) {
        case "landing":
          setMode("landing");
          setVisibleIds(new Set());
          setExpanded(new Set());
          setSelectedId(null);
          setLibraryArticleId(null);
          break;
        case "explore": {
          const vis = new Set<string>([state.nodeId]);
          for (const nb of index.neighborIds(state.nodeId)) vis.add(nb);
          setVisibleIds(vis);
          setExpanded(new Set([state.nodeId]));
          setSelectedId(state.nodeId);
          setMode("explore");
          break;
        }
        case "fullmap":
          setMode("fullmap");
          break;
        case "library":
          setMode("library");
          setLibraryArticleId(state.articleId ?? null);
          break;
      }
    },
    [index],
  );

  // Apply a NavState and push it onto the browser history, so Back/Forward
  // moves between major views (e.g. an article -> a search result -> back).
  const navigate = useCallback(
    (state: NavState) => {
      applyNavState(state);
      window.history.pushState(state, "", navUrl(state));
    },
    [applyNavState],
  );

  // Restore the initial view from the URL on first load, and keep in sync
  // with Back/Forward afterwards.
  useEffect(() => {
    const initial = parseNavState();
    if (initial.mode !== "landing") applyNavState(initial);
    window.history.replaceState(initial, "", navUrl(initial));

    const onPopState = (e: PopStateEvent) => {
      const state = e.state as NavState | null;
      // A null state means this entry came from an in-page anchor (e.g. a
      // TOC link's `#heading-slug`) — leave the current view as-is.
      if (state) applyNavState(state);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [applyNavState]);

  const goHome = useCallback(() => navigate({ mode: "landing" }), [navigate]);

  // Start a fresh exploration rooted on a node (from search or an example card).
  const exploreNode = useCallback(
    (id: string) => navigate({ mode: "explore", nodeId: id }),
    [navigate],
  );

  // Open a library article (e.g. from a node's "Mentioned in" list).
  const openArticle = useCallback(
    (articleId: string) => navigate({ mode: "library", articleId }),
    [navigate],
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
        <GithubLink className="github-link--fixed" />
        <Landing
          index={index}
          onPick={exploreNode}
          onOpenFullMap={() => navigate({ mode: "fullmap" })}
          onOpenLibrary={() => navigate({ mode: "library" })}
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
            <button className="ghost-btn" onClick={() => navigate({ mode: "fullmap" })}>
              Full map
            </button>
          )}
          {(mode === "fullmap" || mode === "library") && (
            <button className="ghost-btn" onClick={goHome}>
              Home
            </button>
          )}
          {mode !== "library" && (
            <button className="ghost-btn" onClick={() => navigate({ mode: "library" })}>
              Library
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
          <GithubLink />
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
              onOpenArticle={openArticle}
              articleMentions={selectedNode ? articleNodeIndex.get(selectedNode.id) : undefined}
            />
            <p className="explore-hint">
              Click a ringed node to expand · right-click a node to hide it
            </p>
          </>
        ) : mode === "library" ? (
          <Library
            selectedId={libraryArticleId}
            theme={theme}
            index={index}
            articleNodeIndex={articleNodeIndex}
            onSelect={(articleId) => navigate({ mode: "library", articleId })}
            onBack={() => navigate({ mode: "library" })}
            onOpenInExplore={exploreNode}
          />
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

function GithubLink({ className }: { className?: string }) {
  return (
    <a
      className={`icon-btn github-link${className ? ` ${className}` : ""}`}
      href="https://github.com/lincw/immune-network"
      target="_blank"
      rel="noreferrer"
      aria-label="View source on GitHub"
      title="View source on GitHub"
    >
      <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    </a>
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
