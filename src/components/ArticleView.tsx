import { isValidElement, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import MermaidDiagram from "./MermaidDiagram";
import InfoPanel from "./InfoPanel";
import type { NetworkIndex } from "../graph";
import { ARTICLES, getArticle, getArticleIndex } from "../content/articles";
import { extractToc } from "../content/articles/toc";
import { buildNodeTerms, linkNodeTerms } from "../content/articles/nodeLinks";
import type { ThemeName } from "../theme";

const NODE_TERMS = buildNodeTerms();

interface ArticleViewProps {
  id: string;
  theme: ThemeName;
  index: NetworkIndex;
  onBack: () => void;
  onSelect: (id: string) => void;
  onOpenInExplore: (id: string) => void;
}

interface CodeElementProps {
  className?: string;
  children?: ReactNode;
}

function codeText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(codeText).join("");
  return "";
}

/** If `children` (a `<pre>`'s children) is a single ```mermaid code block,
 * returns its source text; otherwise returns null. */
function getMermaidSource(children: ReactNode): string | null {
  const child = Array.isArray(children) ? children[0] : children;
  if (!isValidElement<CodeElementProps>(child)) return null;
  if (!child.props.className?.includes("language-mermaid")) return null;
  return codeText(child.props.children).replace(/\n$/, "");
}

export default function ArticleView({
  id,
  theme,
  index,
  onBack,
  onSelect,
  onOpenInExplore,
}: ArticleViewProps) {
  const article = getArticle(id);
  const toc = useMemo(() => (article ? extractToc(article.file) : []), [article]);
  const linkedMarkdown = useMemo(
    () => (article ? linkNodeTerms(article.file, NODE_TERMS) : ""),
    [article],
  );
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [linkedNodeId, setLinkedNodeId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!article) onBack();
  }, [article, onBack]);

  useEffect(() => {
    setLinkedNodeId(null);
  }, [id]);

  useEffect(() => {
    setActiveSlug(toc[0]?.slug ?? null);

    const container = contentRef.current;
    if (!container) return;
    const headings = container.querySelectorAll("h2[id], h3[id]");
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSlug(entry.target.id);
        }
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [id, toc]);

  if (!article) return null;

  const linkedNode = linkedNodeId ? index.getNode(linkedNodeId) ?? null : null;
  const idx = getArticleIndex(id);
  const prev = idx > 0 ? ARTICLES[idx - 1] : undefined;
  const next = idx < ARTICLES.length - 1 ? ARTICLES[idx + 1] : undefined;

  return (
    <div className="article-view">
      <aside className="article-toc">
        <button className="article-back" onClick={onBack}>
          ← Library
        </button>
        {toc.length > 0 && (
          <details className="article-toc-details" open>
            <summary>On this page</summary>
            <ul>
              {toc.map((item) => (
                <li key={item.slug} className={item.depth === 3 ? "toc-sub" : undefined}>
                  <a
                    href={`#${item.slug}`}
                    className={activeSlug === item.slug ? "is-active" : ""}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
      </aside>

      <article className="article-content prose" ref={contentRef}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={{
            pre({ children }) {
              const mermaidSource = getMermaidSource(children);
              if (mermaidSource !== null) {
                return <MermaidDiagram source={mermaidSource} theme={theme} />;
              }
              return <pre>{children}</pre>;
            },
            a({ href, children }) {
              if (href?.startsWith("#node:")) {
                const nodeId = href.slice("#node:".length);
                return (
                  <a
                    href="#"
                    className="node-term-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setLinkedNodeId(nodeId);
                    }}
                  >
                    {children}
                  </a>
                );
              }
              return <a href={href}>{children}</a>;
            },
          }}
        >
          {linkedMarkdown}
        </ReactMarkdown>

        <nav className="article-pager">
          {prev ? (
            <button className="ghost-btn" onClick={() => onSelect(prev.id)}>
              ← {prev.titleEn}
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button className="ghost-btn" onClick={() => onSelect(next.id)}>
              {next.titleEn} →
            </button>
          ) : (
            <span />
          )}
        </nav>
      </article>

      {linkedNode && (
        <aside className="article-info">
          <InfoPanel
            node={linkedNode}
            index={index}
            onSelect={setLinkedNodeId}
            onClose={() => setLinkedNodeId(null)}
            onExplore={onOpenInExplore}
          />
        </aside>
      )}
    </div>
  );
}
