import { describe, it, expect } from "vitest";
import { ARTICLES, getArticle, getArticleIndex } from "./index";

describe("article registry", () => {
  it("has exactly 9 entries", () => {
    expect(ARTICLES).toHaveLength(9);
  });

  it("has unique ids", () => {
    const ids = ARTICLES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has non-empty markdown content for every entry", () => {
    for (const article of ARTICLES) {
      expect(article.file.trim().length).toBeGreaterThan(0);
    }
  });

  it("has exactly 1 intro, 6 course, and 2 reference entries", () => {
    const counts = { intro: 0, course: 0, reference: 0 };
    for (const a of ARTICLES) counts[a.group] += 1;
    expect(counts).toEqual({ intro: 1, course: 6, reference: 2 });
  });

  it("has unique order values forming 0..8", () => {
    const orders = ARTICLES.map((a) => a.order).sort((a, b) => a - b);
    expect(orders).toEqual(ARTICLES.map((_, i) => i));
  });

  it("getArticle finds an entry by id and returns undefined for unknown ids", () => {
    expect(getArticle("overview")?.titleEn).toBe("Overview");
    expect(getArticle("does-not-exist")).toBeUndefined();
  });

  it("getArticleIndex returns -1 for unknown ids", () => {
    expect(getArticleIndex("overview")).toBeGreaterThanOrEqual(0);
    expect(getArticleIndex("does-not-exist")).toBe(-1);
  });
});
