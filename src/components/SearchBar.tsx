import { useEffect, useMemo, useRef, useState } from "react";
import { searchNodes } from "../graph";
import { networkData } from "../data/network";
import { CATEGORY_LABELS } from "../types";
import { CATEGORY_COLOR } from "../theme";

interface SearchBarProps {
  onSelect: (id: string) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchNodes(networkData.nodes, query, 8), [query]);

  useEffect(() => setActive(0), [query]);

  // Close the dropdown on outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const choose = (id: string, label: string) => {
    onSelect(id);
    setQuery(label);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) choose(r.id, r.label);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="search" ref={rootRef}>
      <span className="search-icon" aria-hidden>
        ⌕
      </span>
      <input
        className="search-input"
        type="text"
        value={query}
        placeholder="Search a cell, cytokine, factor…  (e.g. IL-6, Th17, FOXP3)"
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {query && (
        <button
          className="search-clear"
          aria-label="Clear search"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
        >
          ×
        </button>
      )}

      {open && results.length > 0 && (
        <ul className="search-results" role="listbox">
          {results.map((node, i) => (
            <li
              key={node.id}
              role="option"
              aria-selected={i === active}
              className={i === active ? "is-active" : ""}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(node.id, node.label);
              }}
            >
              <span
                className="result-dot"
                style={{ background: CATEGORY_COLOR[node.category] }}
              />
              <span className="result-label">{node.label}</span>
              <span className="result-cat">{CATEGORY_LABELS[node.category]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
