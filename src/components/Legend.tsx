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
      <span className="legend-title">Filter</span>
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

      <div className="legend-subhead">
        <span className="legend-title">Relationships</span>
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
                <span className="legend-label">{EDGE_TYPE_FILTER_LABELS[type]}</span>
                <span className="legend-count">{edgeCounts[type]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
