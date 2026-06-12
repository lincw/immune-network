import { useEffect, useId, useState } from "react";
import type { ThemeName } from "../theme";

interface MermaidDiagramProps {
  source: string;
  theme: ThemeName;
}

const FONT_FAMILY = '"IBM Plex Sans", system-ui, sans-serif';

/** Mermaid `themeVariables` matching the app's accent palette, so diagrams
 * look like part of the UI rather than mermaid's default boxes. */
const MERMAID_THEME_VARIABLES: Record<ThemeName, Record<string, string>> = {
  dark: {
    darkMode: "true",
    background: "transparent",
    fontFamily: FONT_FAMILY,
    fontSize: "16px",
    primaryColor: "rgba(57, 216, 230, 0.14)",
    primaryTextColor: "#e7ecf6",
    primaryBorderColor: "#39d8e6",
    secondaryColor: "rgba(255, 93, 115, 0.14)",
    secondaryBorderColor: "#ff5d73",
    secondaryTextColor: "#e7ecf6",
    tertiaryColor: "rgba(255, 255, 255, 0.05)",
    tertiaryBorderColor: "rgba(255, 255, 255, 0.18)",
    tertiaryTextColor: "#e7ecf6",
    lineColor: "#5d6883",
    textColor: "#e7ecf6",
    mainBkg: "rgba(57, 216, 230, 0.14)",
    nodeBorder: "#39d8e6",
    nodeTextColor: "#e7ecf6",
    clusterBkg: "rgba(255, 255, 255, 0.03)",
    clusterBorder: "rgba(255, 255, 255, 0.16)",
    edgeLabelBackground: "#0d1220",
    titleColor: "#e7ecf6",
  },
  light: {
    darkMode: "false",
    background: "transparent",
    fontFamily: FONT_FAMILY,
    fontSize: "16px",
    primaryColor: "rgba(12, 159, 176, 0.1)",
    primaryTextColor: "#1a2233",
    primaryBorderColor: "#0c9fb0",
    secondaryColor: "rgba(226, 58, 85, 0.1)",
    secondaryBorderColor: "#e23a55",
    secondaryTextColor: "#1a2233",
    tertiaryColor: "rgba(20, 30, 60, 0.05)",
    tertiaryBorderColor: "rgba(20, 30, 60, 0.18)",
    tertiaryTextColor: "#1a2233",
    lineColor: "#8893ab",
    textColor: "#1a2233",
    mainBkg: "rgba(12, 159, 176, 0.1)",
    nodeBorder: "#0c9fb0",
    nodeTextColor: "#1a2233",
    clusterBkg: "rgba(20, 30, 60, 0.03)",
    clusterBorder: "rgba(20, 30, 60, 0.14)",
    edgeLabelBackground: "#ffffff",
    titleColor: "#1a2233",
  },
};

/** Renders a Mermaid diagram to inline SVG. Lazy-loads `mermaid` so the
 * ~600KB library only loads on articles that actually contain a diagram. */
export default function MermaidDiagram({ source, theme }: MermaidDiagramProps) {
  const rawId = useId();
  const id = `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setFailed(false);

    import("mermaid").then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: MERMAID_THEME_VARIABLES[theme],
        flowchart: { curve: "basis" },
      });
      try {
        const result = await mermaid.render(id, source);
        if (!cancelled) setSvg(result.svg);
      } catch {
        if (!cancelled) setFailed(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [id, source, theme]);

  if (failed) {
    return (
      <pre className="mermaid-fallback">
        <code>{source}</code>
      </pre>
    );
  }
  if (!svg) {
    return <div className="mermaid-diagram" aria-hidden="true" />;
  }
  // eslint-disable-next-line react/no-danger
  return <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
}
