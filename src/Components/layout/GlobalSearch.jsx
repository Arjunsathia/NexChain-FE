import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import { Search, CornerDownLeft } from "lucide-react";
import useCoinContext from "@/hooks/useCoinContext";
import useRoleContext from "@/hooks/useRoleContext";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { Delta } from "@/Components/ui/delta";
import { formatPrice } from "@/utils/format";
import { cn } from "@/utils/utils";
import { NAV_GROUPS, ADMIN_ITEM, ACCOUNT_ITEMS } from "./navConfig";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** Pages and coins matching the query; coins whose symbol or name starts with it rank first */
function useResults(query) {
  const { coins } = useCoinContext();
  const { isAdmin } = useRoleContext();

  return useMemo(() => {
    const q = query.trim().toLowerCase();
    const pages = [...NAV_GROUPS.flatMap((g) => g.items), ...ACCOUNT_ITEMS, ...(isAdmin ? [ADMIN_ITEM] : [])]
      .filter((p) => !q || p.label.toLowerCase().includes(q))
      .map((p) => ({ kind: "page", key: p.to, to: p.to, label: p.label, icon: p.icon }))
      .slice(0, q ? 4 : 3);

    const score = (c) => {
      const sym = c.symbol?.toLowerCase() || "";
      const name = c.name?.toLowerCase() || "";
      if (sym === q) return 0;
      if (sym.startsWith(q) || name.startsWith(q)) return 1;
      if (sym.includes(q) || name.includes(q)) return 2;
      return -1;
    };
    const matched = q
      ? coins.filter((c) => score(c) >= 0).sort((a, b) => score(a) - score(b) || (a.market_cap_rank ?? 999) - (b.market_cap_rank ?? 999))
      : coins;
    const coinResults = matched.slice(0, q ? 8 : 5).map((c) => ({
      kind: "coin",
      key: c.id,
      to: `/coin/coin-details/${c.id}`,
      label: c.name,
      symbol: c.symbol,
      image: c.image,
      price: c.current_price,
      change: c.price_change_percentage_24h,
    }));
    return { pages, coins: coinResults, hasQuery: !!q };
  }, [query, coins, isAdmin]);
}

function ResultList({ results }) {
  const section = "px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle";
  const option =
    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg data-[focus]:bg-surface-hover";

  if (results.hasQuery && results.pages.length === 0 && results.coins.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-fg-subtle">No coins or pages match your search.</p>;
  }
  return (
    <>
      {results.coins.length > 0 && (
        <>
          <p className={section}>{results.hasQuery ? "Coins" : "Top coins"}</p>
          {results.coins.map((r) => (
            <ComboboxOption key={r.key} value={r} className={option}>
              <CoinAvatar src={r.image} symbol={r.symbol} size={24} />
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium">{r.label}</span>{" "}
                <span className="text-fg-subtle">{r.symbol?.toUpperCase()}</span>
              </span>
              <span className="tabular text-right text-xs">
                <span className="block text-fg">{formatPrice(r.price)}</span>
                <Delta value={r.change} />
              </span>
            </ComboboxOption>
          ))}
        </>
      )}
      {results.pages.length > 0 && (
        <>
          <p className={section}>Pages</p>
          {results.pages.map((r) => {
            const Icon = r.icon;
            return (
              <ComboboxOption key={r.key} value={r} className={cn(option, "group")}>
                <span className="grid size-6 place-items-center rounded-md bg-surface-2 text-fg-muted">
                  <Icon size={14} />
                </span>
                <span className="flex-1">{r.label}</span>
                <CornerDownLeft size={14} className="text-fg-subtle opacity-0 group-data-[focus]:opacity-100" />
              </ComboboxOption>
            );
          })}
        </>
      )}
    </>
  );
}

/** Coin and page search with a Ctrl/⌘ K shortcut */
export default function GlobalSearch({ className }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef(null);
  const results = useResults(query);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.matchMedia("(min-width: 768px)").matches) inputRef.current?.focus();
        else setMobileOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (item) => {
    if (!item) return;
    navigate(item.to);
    setQuery("");
    setMobileOpen(false);
    inputRef.current?.blur();
  };

  return (
    <>
      {/* Tablet and desktop: inline field with a dropdown */}
      <Combobox value={null} onChange={go} immediate>
        <div className={cn("relative hidden md:block", className)}>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <ComboboxInput
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coins and pages"
            autoComplete="off"
            className="h-9 w-full rounded-lg border border-line bg-surface-2 pl-9 pr-16 text-sm text-fg placeholder:text-fg-subtle outline-none transition-colors focus:border-brand focus:bg-surface"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-line bg-surface px-1.5 py-0.5 font-sans text-[10px] font-medium text-fg-subtle">
            {isMac ? "⌘" : "Ctrl"} K
          </kbd>
        </div>
        <ComboboxOptions
          anchor={{ to: "bottom start", gap: 6 }}
          transition
          className="z-[60] max-h-[min(70vh,460px)] w-[max(var(--input-width),380px)] overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-pop transition duration-100 ease-out empty:invisible data-[closed]:opacity-0"
        >
          <ResultList results={results} />
        </ComboboxOptions>
      </Combobox>

      {/* Phones: icon that opens a full-width search sheet */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Search"
        className="grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-hover hover:text-fg md:hidden"
      >
        <Search size={18} />
      </button>
      <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)} className="relative z-[2000] md:hidden">
        <DialogBackdrop transition className="fixed inset-0 bg-black/50 transition-opacity duration-150 data-[closed]:opacity-0" />
        <DialogPanel
          transition
          className="fixed inset-x-0 top-0 max-h-[85dvh] overflow-y-auto border-b border-line bg-surface p-3 shadow-pop transition duration-150 data-[closed]:-translate-y-4 data-[closed]:opacity-0"
        >
          <Combobox value={null} onChange={go}>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
              <ComboboxInput
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search coins and pages"
                autoComplete="off"
                className="h-11 w-full rounded-lg border border-line bg-surface-2 pl-9 pr-3 text-base text-fg placeholder:text-fg-subtle outline-none focus:border-brand"
              />
            </div>
            <ComboboxOptions static className="mt-1">
              <ResultList results={results} />
            </ComboboxOptions>
          </Combobox>
        </DialogPanel>
      </Dialog>
    </>
  );
}
