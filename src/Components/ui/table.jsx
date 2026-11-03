import * as React from "react";
import { ArrowUp, ArrowDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/utils/utils";

/** Column header; clickable when `sortKey` is set */
function SortHeader({ label, sortKey, sort, onSort, align = "right", className }) {
  const active = sortKey && sort?.key === sortKey;
  const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  const right = align === "right";
  return (
    <th
      scope="col"
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
      className={cn("whitespace-nowrap px-3 py-2.5 text-xs font-medium text-fg-subtle", right ? "text-right" : "text-left", className)}
    >
      {sortKey ? (
        <button
          type="button"
          onClick={() => onSort(sortKey)}
          className={cn("inline-flex items-center gap-1 hover:text-fg", active && "text-fg", right && "flex-row-reverse")}
        >
          {label}
          <Icon size={12} className={active ? "" : "opacity-50"} />
        </button>
      ) : (
        label
      )}
    </th>
  );
}

/** Page buttons with a "1–25 of 100" range label */
function Pagination({ page, pageSize, total, onPage, className }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;

  // Show at most 7 page buttons, centered on the current page
  const span = Math.min(7, pageCount);
  const start = Math.min(Math.max(1, page - Math.floor(span / 2)), pageCount - span + 1);
  const pages = Array.from({ length: span }, (_, i) => start + i);
  const arrow =
    "grid size-8 place-items-center rounded-md border border-line text-fg transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className={cn("premium-pagination flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-fg-subtle", className)}>
      <span className="tabular">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page === 1} aria-label="Previous page" className={arrow}>
          <ChevronLeft size={15} />
        </button>
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              "tabular grid size-8 place-items-center rounded-md text-xs font-medium transition-colors",
              n === page ? "bg-brand text-brand-fg" : "text-fg-muted hover:bg-surface-hover",
            )}
          >
            {n}
          </button>
        ))}
        <button type="button" onClick={() => onPage(page + 1)} disabled={page === pageCount} aria-label="Next page" className={arrow}>
          <ChevronRight size={15} />
        </button>
      </nav>
    </div>
  );
}

/** Search field used in table toolbars */
function SearchInput({ value, onChange, placeholder, label, className }) {
  return (
    <div className={cn("relative", className)}>
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label || placeholder}
        className="h-9 w-full rounded-lg border border-line bg-surface-2 pl-9 pr-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-brand focus:bg-surface"
      />
    </div>
  );
}

export { SortHeader, Pagination, SearchInput };
