import type { NetworkData, NetworkEdge, NetworkNode } from "./types";

/** A node together with the edge that connects it to a focused node. */
export interface Connection {
  node: NetworkNode;
  edge: NetworkEdge;
  direction: "outgoing" | "incoming";
}

/** Fast lookup helpers derived once from the raw network data. */
export class NetworkIndex {
  readonly nodesById: Map<string, NetworkNode>;
  private readonly outgoing: Map<string, NetworkEdge[]>;
  private readonly incoming: Map<string, NetworkEdge[]>;

  constructor(data: NetworkData) {
    this.nodesById = new Map(data.nodes.map((n) => [n.id, n]));
    this.outgoing = new Map();
    this.incoming = new Map();
    for (const edge of data.edges) {
      pushTo(this.outgoing, edge.source, edge);
      pushTo(this.incoming, edge.target, edge);
    }
  }

  getNode(id: string): NetworkNode | undefined {
    return this.nodesById.get(id);
  }

  /** Direct (1-hop) neighbor node ids of the given node, both directions. */
  neighborIds(id: string): Set<string> {
    const ids = new Set<string>();
    for (const e of this.outgoing.get(id) ?? []) ids.add(e.target);
    for (const e of this.incoming.get(id) ?? []) ids.add(e.source);
    return ids;
  }

  /** Connections of a node, sorted for stable display in the info panel. */
  connections(id: string): Connection[] {
    const out = (this.outgoing.get(id) ?? []).map((edge) => ({
      edge,
      direction: "outgoing" as const,
      node: this.nodesById.get(edge.target)!,
    }));
    const inc = (this.incoming.get(id) ?? []).map((edge) => ({
      edge,
      direction: "incoming" as const,
      node: this.nodesById.get(edge.source)!,
    }));
    return [...out, ...inc].sort((a, b) => a.node.label.localeCompare(b.node.label));
  }
}

function pushTo(map: Map<string, NetworkEdge[]>, key: string, edge: NetworkEdge): void {
  const arr = map.get(key);
  if (arr) arr.push(edge);
  else map.set(key, [edge]);
}

/**
 * Rank nodes against a free-text query. Matches label and synonyms; an exact or
 * prefix match on the label outranks a substring synonym match. Returns at most
 * `limit` results, best first. An empty query returns no results.
 */
export function searchNodes(
  nodes: NetworkNode[],
  query: string,
  limit = 8,
): NetworkNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored: { node: NetworkNode; score: number }[] = [];
  for (const node of nodes) {
    const score = scoreNode(node, q);
    if (score > 0) scored.push({ node, score });
  }
  scored.sort((a, b) => b.score - a.score || a.node.label.localeCompare(b.node.label));
  return scored.slice(0, limit).map((s) => s.node);
}

function scoreNode(node: NetworkNode, q: string): number {
  const label = node.label.toLowerCase();
  if (label === q) return 100;
  if (label.startsWith(q)) return 80;

  for (const syn of node.synonyms) {
    const s = syn.toLowerCase();
    if (s === q) return 70;
    if (s.startsWith(q)) return 55;
  }

  if (label.includes(q)) return 40;
  for (const syn of node.synonyms) {
    if (syn.toLowerCase().includes(q)) return 30;
  }
  if (node.description.toLowerCase().includes(q)) return 10;
  return 0;
}
