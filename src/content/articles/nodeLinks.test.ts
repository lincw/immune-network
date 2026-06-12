import { describe, it, expect } from "vitest";
import { buildNodeTerms, linkNodeTerms, type NodeTermMatch } from "./nodeLinks";
import { networkData } from "../../data/network";

describe("buildNodeTerms", () => {
  const terms = buildNodeTerms();

  it("includes one entry per node label", () => {
    expect(terms.length).toBe(networkData.nodes.length);
  });

  it("sorts terms longest-first", () => {
    for (let i = 1; i < terms.length; i++) {
      expect(terms[i - 1].term.length).toBeGreaterThanOrEqual(terms[i].term.length);
    }
  });

  it("includes IL-1 and IFN-γ from the dataset", () => {
    const byTerm = new Map(terms.map((t) => [t.term, t.id]));
    expect(byTerm.get("IL-1")).toBe("il1");
    expect(byTerm.get("IFN-γ")).toBe("ifng");
  });
});

describe("linkNodeTerms", () => {
  const terms: NodeTermMatch[] = [
    { term: "IFN-γ", id: "ifng" },
    { term: "IL-10", id: "il10" },
    { term: "IL-1", id: "il1" },
    { term: "Th1", id: "th1" },
  ];

  it("links the first mention of a term", () => {
    const out = linkNodeTerms("Macrophages activated by IFN-γ kill pathogens.", terms);
    expect(out).toBe("Macrophages activated by [IFN-γ](#node:ifng) kill pathogens.");
  });

  it("links each node only once, even if mentioned repeatedly", () => {
    const out = linkNodeTerms("IFN-γ ... more IFN-γ later", terms);
    expect(out).toBe("[IFN-γ](#node:ifng) ... more IFN-γ later");
  });

  it("prefers the longer term so IL-10 is not split into IL-1 + 0", () => {
    const out = linkNodeTerms("Treg cells secrete IL-10 and IL-1.", terms);
    expect(out).toContain("[IL-10](#node:il10)");
    expect(out).toContain("[IL-1](#node:il1)");
    expect(out).not.toContain("[IL-1](#node:il1)0");
  });

  it("does not link inside fenced code blocks", () => {
    const out = linkNodeTerms("```\nIFN-γ\n```\nIFN-γ again", terms);
    expect(out).toBe("```\nIFN-γ\n```\n[IFN-γ](#node:ifng) again");
  });

  it("does not link inside inline code or existing links", () => {
    const out = linkNodeTerms("see `IFN-γ` or [IFN-γ](https://example.com)", terms);
    expect(out).toBe("see `IFN-γ` or [IFN-γ](https://example.com)");
  });

  it("does not link inside headings", () => {
    const out = linkNodeTerms("## IFN-γ overview\n\nIFN-γ activates macrophages.", terms);
    expect(out).toBe(
      "## IFN-γ overview\n\n[IFN-γ](#node:ifng) activates macrophages.",
    );
  });
});
