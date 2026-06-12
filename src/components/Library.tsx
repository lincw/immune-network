import ArticleView from "./ArticleView";
import type { NetworkIndex } from "../graph";
import { ARTICLES, type ArticleEntry, type ArticleGroup } from "../content/articles";
import type { ThemeName } from "../theme";

interface LibraryProps {
  selectedId: string | null;
  theme: ThemeName;
  index: NetworkIndex;
  articleNodeIndex: Map<string, string[]>;
  onSelect: (id: string) => void;
  onBack: () => void;
  onOpenInExplore: (id: string) => void;
}

const GROUP_ORDER: ArticleGroup[] = ["intro", "course", "reference"];

const GROUP_LABELS: Record<ArticleGroup, string> = {
  intro: "Introduction",
  course: "Course",
  reference: "Reference",
};

export default function Library({
  selectedId,
  theme,
  index,
  articleNodeIndex,
  onSelect,
  onBack,
  onOpenInExplore,
}: LibraryProps) {
  if (selectedId) {
    return (
      <ArticleView
        id={selectedId}
        theme={theme}
        index={index}
        articleNodeIndex={articleNodeIndex}
        onBack={onBack}
        onSelect={onSelect}
        onOpenInExplore={onOpenInExplore}
      />
    );
  }

  return (
    <div className="library">
      {GROUP_ORDER.map((group) => {
        const items = ARTICLES.filter((a) => a.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group}>
            <div className="library-group-label">{GROUP_LABELS[group]}</div>
            <div className="library-grid">
              {items.map((item) => (
                <ArticleCard key={item.id} item={item} onSelect={onSelect} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ArticleCard({
  item,
  onSelect,
}: {
  item: ArticleEntry;
  onSelect: (id: string) => void;
}) {
  return (
    <button className="library-card" onClick={() => onSelect(item.id)}>
      <h3 className="library-card-title">{item.titleZh || item.titleEn}</h3>
      {item.titleZh && <span className="library-card-subtitle">{item.titleEn}</span>}
      <p className="library-card-desc">{item.description}</p>
    </button>
  );
}
