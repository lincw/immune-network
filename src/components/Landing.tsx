import { useMemo } from "react";
import SearchBar from "./SearchBar";
import type { NetworkIndex } from "../graph";
import { CATEGORY_LABELS, type NetworkNode } from "../types";
import { CATEGORY_COLOR } from "../theme";

interface LandingProps {
  index: NetworkIndex;
  onPick: (id: string) => void;
  onOpenFullMap: () => void;
  onOpenLibrary: () => void;
}

// Curated entry points — recognizable, well-connected hubs spanning categories.
const EXAMPLE_IDS = ["dc", "th17", "il6", "inflammation", "macrophage", "ifng"];

export default function Landing({ index, onPick, onOpenFullMap, onOpenLibrary }: LandingProps) {
  const examples = useMemo(
    () =>
      EXAMPLE_IDS.map((id) => index.getNode(id)).filter(
        (n): n is NetworkNode => Boolean(n),
      ),
    [index],
  );

  return (
    <div className="landing">
      <div className="landing-hero">
        <h1 className="landing-title">Immune Network Explorer</h1>
        <p className="landing-tagline">
          Search a cell, cytokine, or factor and walk its connections — one
          click expands the next layer of the network.
        </p>
        <div className="landing-search">
          <SearchBar onSelect={onPick} />
        </div>
        <div className="landing-links">
          <button className="landing-fullmap" onClick={onOpenFullMap}>
            Explore the full map →
          </button>
          <button className="landing-fullmap" onClick={onOpenLibrary}>
            Browse the article library →
          </button>
        </div>
      </div>

      <div className="landing-examples">
        <span className="landing-examples-label">Start from a hub</span>
        <div className="example-grid">
          {examples.map((node) => (
            <ExampleCard key={node.id} node={node} index={index} onPick={onPick} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExampleCard({
  node,
  index,
  onPick,
}: {
  node: NetworkNode;
  index: NetworkIndex;
  onPick: (id: string) => void;
}) {
  const neighborIds = useMemo(() => [...index.neighborIds(node.id)], [index, node.id]);
  const color = CATEGORY_COLOR[node.category];

  return (
    <button className="example-card" onClick={() => onPick(node.id)}>
      <MiniGraph index={index} centerId={node.id} neighborIds={neighborIds} />
      <div className="example-meta">
        <span className="example-chip" style={{ background: color }}>
          {CATEGORY_LABELS[node.category]}
        </span>
        <span className="example-count">{neighborIds.length} connections</span>
      </div>
      <h3 className="example-name">{node.label}</h3>
      <p className="example-desc">{node.description}</p>
    </button>
  );
}

/** Tiny radial preview: the hub in the center, a sample of neighbors ringed. */
function MiniGraph({
  index,
  centerId,
  neighborIds,
}: {
  index: NetworkIndex;
  centerId: string;
  neighborIds: string[];
}) {
  const W = 220;
  const H = 110;
  const cx = W / 2;
  const cy = H / 2;
  const r = 38;
  const sample = neighborIds.slice(0, 7);
  const center = index.getNode(centerId);

  const pts = sample.map((id, i) => {
    const a = (2 * Math.PI * i) / sample.length - Math.PI / 2;
    const node = index.getNode(id);
    return {
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
      color: node ? CATEGORY_COLOR[node.category] : "#888",
    };
  });

  return (
    <svg className="mini-graph" viewBox={`0 0 ${W} ${H}`} aria-hidden>
      {pts.map((p, i) => (
        <line
          key={`l${i}`}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          className="mini-edge"
        />
      ))}
      {pts.map((p, i) => (
        <circle key={`n${i}`} cx={p.x} cy={p.y} r={4} fill={p.color} />
      ))}
      <circle
        cx={cx}
        cy={cy}
        r={7}
        fill={center ? CATEGORY_COLOR[center.category] : "#fff"}
        className="mini-center"
      />
    </svg>
  );
}
