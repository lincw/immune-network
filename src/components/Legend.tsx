import { CATEGORY_ORDER, CATEGORY_LABELS, type Category } from "../types";
import { CATEGORY_COLOR } from "../theme";

interface LegendProps {
  active: Set<Category>;
  counts: Record<Category, number>;
  onToggle: (category: Category) => void;
}

export default function Legend({ active, counts, onToggle }: LegendProps) {
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
    </div>
  );
}
