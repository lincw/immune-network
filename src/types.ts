// Domain model for the immune network graph.

/** High-level kind of a node, drives color, shape, and legend grouping. */
export type Category =
  | "cell"
  | "cytokine"
  | "transcriptionFactor"
  | "antibody"
  | "receptor"
  | "function";

/** Which arm of the immune system a node primarily belongs to. */
export type Subsystem = "humoral" | "cellular" | "innate" | "shared";

/** Semantic type of a relationship, drives edge line style and arrow. */
export type EdgeType =
  | "differentiation" // precursor cell -> differentiated cell
  | "secretes" // cell -> cytokine/antibody it produces
  | "induces" // signal -> downstream cell/effect it promotes
  | "drivesTF" // signal/cell -> transcription factor it activates
  | "expressesTF" // cell -> master transcription factor that defines it
  | "bindsReceptor" // ligand -> receptor
  | "costimulation" // surface molecule interaction enabling activation
  | "mediates" // cell/effector -> functional outcome
  | "inhibits"; // signal/cell -> target it suppresses

export interface NetworkNode {
  id: string;
  label: string;
  category: Category;
  subsystem: Subsystem;
  /** Alternative names / abbreviations used for keyword search. */
  synonyms: string[];
  /** One to three sentences shown in the info panel. */
  description: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  type: EdgeType;
  /** Optional short annotation, e.g. the cytokine driving a differentiation. */
  label?: string;
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export const CATEGORY_ORDER: Category[] = [
  "cell",
  "cytokine",
  "transcriptionFactor",
  "antibody",
  "receptor",
  "function",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  cell: "Cells",
  cytokine: "Cytokines",
  transcriptionFactor: "Transcription factors",
  antibody: "Antibodies",
  receptor: "Receptors / surface",
  function: "Functions / outcomes",
};

export const EDGE_TYPE_LABELS: Record<EdgeType, string> = {
  differentiation: "differentiates into",
  secretes: "secretes",
  induces: "induces / promotes",
  drivesTF: "activates",
  expressesTF: "defined by",
  bindsReceptor: "binds",
  costimulation: "co-stimulates",
  mediates: "mediates",
  inhibits: "inhibits",
};
