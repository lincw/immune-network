import immuneSystemIntro from "./immune-system-intro.md?raw";
import overview from "./overview.md?raw";
import innateImmunity from "./innate-immunity.md?raw";
import adaptiveImmunity from "./adaptive-immunity.md?raw";
import immuneCells from "./immune-cells.md?raw";
import regulationDysregulation from "./regulation-dysregulation.md?raw";
import clinicalApplications from "./clinical-applications.md?raw";
import immuneDiseases from "./immune-diseases.md?raw";
import glossary from "./glossary.md?raw";

export type ArticleGroup = "intro" | "course" | "reference";

export interface ArticleEntry {
  id: string;
  file: string;
  titleZh: string;
  titleEn: string;
  description: string;
  group: ArticleGroup;
  order: number;
}

export const ARTICLES: ArticleEntry[] = [
  {
    id: "immune-system-intro",
    file: immuneSystemIntro,
    titleZh: "人體免疫系統",
    titleEn: "Immune System",
    description:
      "A combined overview of innate and adaptive immunity, including the Th1/Th2 balance.",
    group: "intro",
    order: 0,
  },
  {
    id: "overview",
    file: overview,
    titleZh: "概述",
    titleEn: "Overview",
    description:
      "Components of the immune system and the phases of an immune response.",
    group: "course",
    order: 1,
  },
  {
    id: "innate-immunity",
    file: innateImmunity,
    titleZh: "先天免疫",
    titleEn: "Innate Immunity",
    description:
      "Fast, non-specific defenses: macrophages, neutrophils, NK cells, complement.",
    group: "course",
    order: 2,
  },
  {
    id: "adaptive-immunity",
    file: adaptiveImmunity,
    titleZh: "後天免疫",
    titleEn: "Adaptive Immunity",
    description:
      "B cells, T cells, antibodies, MHC presentation, and immunological memory.",
    group: "course",
    order: 3,
  },
  {
    id: "immune-cells",
    file: immuneCells,
    titleZh: "主要免疫細胞時序與分泌物質",
    titleEn: "Immune Cells Timeline and Secreted Molecules",
    description:
      "Activation timeline and secreted molecules for the major immune cell types.",
    group: "course",
    order: 4,
  },
  {
    id: "regulation-dysregulation",
    file: regulationDysregulation,
    titleZh: "免疫系統的調節與失調",
    titleEn: "Regulation and Dysregulation of the Immune System",
    description:
      "Immune tolerance, negative feedback, and what happens when regulation fails.",
    group: "course",
    order: 5,
  },
  {
    id: "clinical-applications",
    file: clinicalApplications,
    titleZh: "免疫學的臨床應用",
    titleEn: "Clinical Applications of Immunology",
    description: "Diagnostics, immunotherapy, vaccines, and transplantation.",
    group: "course",
    order: 6,
  },
  {
    id: "immune-diseases",
    file: immuneDiseases,
    titleZh: "免疫疾病",
    titleEn: "Immune Diseases",
    description: "Autoimmune disease, allergy, and immunodeficiency disorders.",
    group: "reference",
    order: 7,
  },
  {
    id: "glossary",
    file: glossary,
    titleZh: "",
    titleEn: "Glossary",
    description: "Key immunology terms and definitions.",
    group: "reference",
    order: 8,
  },
];

export function getArticle(id: string): ArticleEntry | undefined {
  return ARTICLES.find((a) => a.id === id);
}

export function getArticleIndex(id: string): number {
  return ARTICLES.findIndex((a) => a.id === id);
}
