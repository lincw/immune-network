import { useEffect, useState } from "react";
import type { NetworkIndex, Connection } from "../graph";
import {
  CATEGORY_LABELS,
  EDGE_TYPE_LABELS,
  type NetworkNode,
} from "../types";
import { CATEGORY_COLOR } from "../theme";
import { wikipediaUrl, fetchWikiSummary } from "../data/wikipedia";
import { getArticle } from "../content/articles";

interface InfoPanelProps {
  node: NetworkNode | null;
  index: NetworkIndex;
  onSelect: (id: string) => void;
  /** Remove this node from the subnetwork (explorer only). */
  onHide?: (id: string) => void;
  /** Dismiss this panel (article reader only). */
  onClose?: () => void;
  /** Switch to the full explorer focused on this node (article reader only). */
  onExplore?: (id: string) => void;
  /** Ids of library articles that mention this node. */
  articleMentions?: string[];
  /** Open a library article by id. */
  onOpenArticle?: (id: string) => void;
}

const SUBSYSTEM_LABELS: Record<NetworkNode["subsystem"], string> = {
  humoral: "Humoral",
  cellular: "Cellular",
  innate: "Innate",
  shared: "Shared",
};

export default function InfoPanel({
  node,
  index,
  onSelect,
  onHide,
  onClose,
  onExplore,
  articleMentions,
  onOpenArticle,
}: InfoPanelProps) {
  if (!node) {
    return (
      <aside className="info info--empty">
        <p className="info-hint">
          Search above or click any node to focus it. Its direct connections
          light up and you can walk the network from the list that appears here.
        </p>
      </aside>
    );
  }
  return (
    <NodeCard
      node={node}
      index={index}
      onSelect={onSelect}
      onHide={onHide}
      onClose={onClose}
      onExplore={onExplore}
      articleMentions={articleMentions}
      onOpenArticle={onOpenArticle}
    />
  );
}

function NodeCard({
  node,
  index,
  onSelect,
  onHide,
  onClose,
  onExplore,
  articleMentions,
  onOpenArticle,
}: {
  node: NetworkNode;
  index: NetworkIndex;
  onSelect: (id: string) => void;
  onHide?: (id: string) => void;
  onClose?: () => void;
  onExplore?: (id: string) => void;
  articleMentions?: string[];
  onOpenArticle?: (id: string) => void;
}) {
  const [thumb, setThumb] = useState<string | null>(null);

  // Pull the lead image from Wikipedia for the current node.
  useEffect(() => {
    const ctrl = new AbortController();
    setThumb(null);
    fetchWikiSummary(node, ctrl.signal).then((summary) => {
      if (!ctrl.signal.aborted) setThumb(summary?.thumb ?? null);
    });
    return () => ctrl.abort();
  }, [node]);

  const connections = index.connections(node.id);
  const outgoing = connections.filter((c) => c.direction === "outgoing");
  const incoming = connections.filter((c) => c.direction === "incoming");
  const color = CATEGORY_COLOR[node.category];

  return (
    <aside className="info" key={node.id}>
      <div className="info-head">
        <span className="info-chip" style={{ background: color }}>
          {CATEGORY_LABELS[node.category]}
        </span>
        <span className="info-sub">{SUBSYSTEM_LABELS[node.subsystem]} immunity</span>
        {onHide && (
          <button
            className="info-hide"
            onClick={() => onHide(node.id)}
            title="Hide this node from the subnetwork"
          >
            Hide
          </button>
        )}
        {onClose && (
          <button className="info-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
      </div>

      <h2 className="info-title" style={{ borderColor: color }}>
        {node.label}
      </h2>

      {onExplore && (
        <button className="ghost-btn info-explore" onClick={() => onExplore(node.id)}>
          Explore in network →
        </button>
      )}

      {thumb && (
        <figure className="info-figure">
          <img src={thumb} alt={`${node.label} — illustration from Wikipedia`} loading="lazy" />
          <figcaption>via Wikipedia</figcaption>
        </figure>
      )}

      <p className="info-desc">{node.description}</p>

      {node.synonyms.length > 0 && (
        <p className="info-synonyms">
          <span className="info-synonyms-key">also:</span>{" "}
          {node.synonyms.join(", ")}
        </p>
      )}

      <a
        className="info-wiki"
        href={wikipediaUrl(node)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Read more on Wikipedia
        <span aria-hidden> ↗</span>
      </a>

      {onOpenArticle && articleMentions && articleMentions.length > 0 && (
        <section className="conn-group">
          <h3 className="conn-title">
            Mentioned in <span className="conn-count">{articleMentions.length}</span>
          </h3>
          <ul className="conn-list">
            {articleMentions.map((articleId) => {
              const article = getArticle(articleId);
              if (!article) return null;
              return (
                <li key={articleId}>
                  <button
                    className="conn-item"
                    onClick={() => onOpenArticle(articleId)}
                  >
                    <span className="conn-node">{article.titleZh || article.titleEn}</span>
                    {article.titleZh && (
                      <span className="conn-rel">{article.titleEn}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <ConnectionGroup
        title="Acts on / produces"
        list={outgoing}
        onSelect={onSelect}
      />
      <ConnectionGroup
        title="Driven by / upstream"
        list={incoming}
        onSelect={onSelect}
      />
    </aside>
  );
}

function ConnectionGroup({
  title,
  list,
  onSelect,
}: {
  title: string;
  list: Connection[];
  onSelect: (id: string) => void;
}) {
  if (list.length === 0) return null;
  return (
    <section className="conn-group">
      <h3 className="conn-title">
        {title} <span className="conn-count">{list.length}</span>
      </h3>
      <ul className="conn-list">
        {list.map((c) => {
          const verb = EDGE_TYPE_LABELS[c.edge.type];
          // The verb always reads source -> target. For incoming connections
          // the neighbor is the source, so show "[neighbor] [verb]"; for
          // outgoing the focused node is the source, so "[verb] [neighbor]".
          const incoming = c.direction === "incoming";
          return (
            <li key={`${c.edge.source}-${c.edge.target}-${c.edge.type}`}>
              <button className="conn-item" onClick={() => onSelect(c.node.id)}>
                <span
                  className="conn-dot"
                  style={{ background: CATEGORY_COLOR[c.node.category] }}
                />
                {incoming ? (
                  <>
                    <span className="conn-node">{c.node.label}</span>
                    <span className="conn-rel">{verb}</span>
                  </>
                ) : (
                  <>
                    <span className="conn-rel">{verb}</span>
                    <span className="conn-node">{c.node.label}</span>
                  </>
                )}
                {c.edge.label && <span className="conn-edge-label">{c.edge.label}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
