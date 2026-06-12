import { useEffect, useId, useRef, useState } from "react";
import {
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  EDGE_TYPE_ORDER,
  EDGE_TYPE_FILTER_LABELS,
  type Category,
  type EdgeType,
} from "../types";
import { CATEGORY_COLOR } from "../theme";

interface LegendProps {
  active: Set<Category>;
  counts: Record<Category, number>;
  onToggle: (category: Category) => void;
  activeEdgeTypes: Set<EdgeType>;
  edgeCounts: Record<EdgeType, number>;
  onToggleEdgeType: (type: EdgeType) => void;
  onSetAllEdgeTypes: (on: boolean) => void;
}

/** Collapsible disclosure that opens upward (the legend sits at the bottom). */
function Dropdown({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`dropdown ${open ? "is-open" : ""}`} ref={ref}>
      <button
        className="dropdown-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={menuId}
      >
        <span className="dropdown-title">{title}</span>
        <span className="dropdown-summary">{summary}</span>
        <span className="dropdown-caret" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="dropdown-menu" id={menuId} role="menu">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Legend({
  active,
  counts,
  onToggle,
  activeEdgeTypes,
  edgeCounts,
  onToggleEdgeType,
  onSetAllEdgeTypes,
}: LegendProps) {
  const allEdgesOn = activeEdgeTypes.size === EDGE_TYPE_ORDER.length;

  return (
    <div className="legend">
      <Dropdown
        title="Filter"
        summary={`${active.size}/${CATEGORY_ORDER.length}`}
      >
        <ul className="legend-list">
          {CATEGORY_ORDER.map((cat) => {
            const on = active.has(cat);
            return (
              <li key={cat}>
                <button
                  className={`legend-item ${on ? "" : "is-off"}`}
                  onClick={() => onToggle(cat)}
                  aria-pressed={on}
                >
                  <span
                    className="legend-swatch"
                    style={{
                      background: on ? CATEGORY_COLOR[cat] : "transparent",
                      borderColor: CATEGORY_COLOR[cat],
                    }}
                  />
                  <span className="legend-label">{CATEGORY_LABELS[cat]}</span>
                  <span className="legend-count">{counts[cat]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Dropdown>

      <Dropdown
        title="Relationships"
        summary={`${activeEdgeTypes.size}/${EDGE_TYPE_ORDER.length}`}
      >
        <div className="dropdown-toolbar">
          <button
            className="legend-allbtn"
            onClick={() => onSetAllEdgeTypes(!allEdgesOn)}
          >
            {allEdgesOn ? "none" : "all"}
          </button>
        </div>
        <ul className="legend-list legend-list--edges">
          {EDGE_TYPE_ORDER.map((type) => {
            const on = activeEdgeTypes.has(type);
            return (
              <li key={type}>
                <button
                  className={`legend-item ${on ? "" : "is-off"}`}
                  onClick={() => onToggleEdgeType(type)}
                  aria-pressed={on}
                >
                  <span className={`legend-edge-mark ${on ? "is-on" : ""}`} />
                  <span className="legend-label">
                    {EDGE_TYPE_FILTER_LABELS[type]}
                  </span>
                  <span className="legend-count">{edgeCounts[type]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Dropdown>
    </div>
  );
}
