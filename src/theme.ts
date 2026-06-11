import type { Category } from "./types";

export type ThemeName = "dark" | "light";

// Category palette for the DARK canvas — saturated hues that glow against the
// near-black background, echoing fluorescence-microscopy imaging.
export const CATEGORY_COLOR: Record<Category, string> = {
  cell: "#ff5d73", // coral red
  cytokine: "#39d8e6", // cyan
  transcriptionFactor: "#f4b740", // amber
  antibody: "#a98bff", // violet
  receptor: "#3ddc84", // green
  function: "#ff86c2", // rose
};

// Slightly deeper variants used as node fills on the LIGHT canvas so colors
// keep contrast against white rather than washing out.
export const CATEGORY_COLOR_LIGHT: Record<Category, string> = {
  cell: "#e23a55",
  cytokine: "#0c9fb0",
  transcriptionFactor: "#cf8500",
  antibody: "#7a55e6",
  receptor: "#14a25a",
  function: "#db4f9c",
};

/** Brighter rim color used for node halos / selection glow (dark theme). */
export const CATEGORY_GLOW: Record<Category, string> = {
  cell: "#ff97a6",
  cytokine: "#8aecf4",
  transcriptionFactor: "#ffd587",
  antibody: "#c8b6ff",
  receptor: "#86eeb1",
  function: "#ffb6db",
};

/** Colors the Cytoscape canvas needs (text, edges, label backdrops). */
export interface GraphPalette {
  fill: Record<Category, string>;
  glow: Record<Category, string>;
  text: string;
  textDim: string;
  labelBg: string;
  edge: string;
  edgeActive: string;
}

const DARK_PALETTE: GraphPalette = {
  fill: CATEGORY_COLOR,
  glow: CATEGORY_GLOW,
  text: "#e7ecf6",
  textDim: "#9aa6be",
  labelBg: "#070a12",
  edge: "#3a4565",
  edgeActive: "#e7ecf6",
};

const LIGHT_PALETTE: GraphPalette = {
  fill: CATEGORY_COLOR_LIGHT,
  glow: {
    cell: "#b32237",
    cytokine: "#067a89",
    transcriptionFactor: "#a86b00",
    antibody: "#5b39c4",
    receptor: "#0c7a43",
    function: "#b83a7e",
  },
  text: "#1a2233",
  textDim: "#4a5570",
  labelBg: "#f4f6fb",
  edge: "#aab4cc",
  edgeActive: "#1a2233",
};

export function graphPalette(theme: ThemeName): GraphPalette {
  return theme === "light" ? LIGHT_PALETTE : DARK_PALETTE;
}
