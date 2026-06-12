import { describe, it, expect } from "vitest";
import { extractToc } from "./toc";

describe("extractToc", () => {
  it("extracts h2/h3 headings with github-slugger slugs", () => {
    const md = [
      "# Title",
      "## First Section",
      "Some text",
      "### Sub Section",
      "## Second Section",
    ].join("\n");

    expect(extractToc(md)).toEqual([
      { depth: 2, text: "First Section", slug: "first-section" },
      { depth: 3, text: "Sub Section", slug: "sub-section" },
      { depth: 2, text: "Second Section", slug: "second-section" },
    ]);
  });

  it("ignores '#' lines inside fenced code blocks", () => {
    const md = [
      "## Real Heading",
      "```mermaid",
      "## not a heading",
      "```",
      "## Another Real",
    ].join("\n");

    expect(extractToc(md).map((t) => t.text)).toEqual([
      "Real Heading",
      "Another Real",
    ]);
  });

  it("disambiguates duplicate headings the same way github-slugger does", () => {
    const md = ["## Mechanisms", "## Mechanisms"].join("\n");

    expect(extractToc(md).map((t) => t.slug)).toEqual([
      "mechanisms",
      "mechanisms-1",
    ]);
  });
});
