import React, { memo, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Newspaper, RefreshCw, SearchX, X } from "lucide-react";
import useNews from "@/hooks/useNews";
import { useLivePrice } from "@/hooks/useBinanceTicker";
import { Card, CardHeader, EmptyState } from "@/Components/ui/card";
import { Skeleton } from "@/Components/ui/skeleton";
import { Delta } from "@/Components/ui/delta";
import { CoinAvatar } from "@/Components/ui/coin-avatar";
import { SearchInput } from "@/Components/ui/table";
import LiveCoinRow from "@/Components/Crypto/LiveCoinRow";
import { formatTimeAgo } from "@/utils/format";
import { cn } from "@/utils/utils";

const PAGE_SIZE = 12;

// Feed categories worth filtering by, with readable names
const TOPIC_LABELS = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  ALTCOIN: "Altcoins",
  MARKET: "Market",
  TRADING: "Trading",
  REGULATION: "Regulation",
  BUSINESS: "Business",
  TECHNOLOGY: "Technology",
  EXCHANGE: "Exchanges",
  BLOCKCHAIN: "Blockchain",
  MACROECONOMICS: "Macro",
  MINING: "Mining",
  WALLET: "Wallets",
};

const ago = (ms) => formatTimeAgo(ms / 1000);

function Thumb({ src, className }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className={cn("bg-surface-2 object-cover", className)} />
  ) : (
    <span className={cn("grid place-items-center bg-surface-2 text-fg-subtle", className)}>
      <Newspaper size={20} />
    </span>
  );
}

function SourceLine({ article, className }) {
  return (
    <p className={cn("flex items-center gap-1.5 text-xs text-fg-subtle", className)}>
      {article.sourceLogo && <img src={article.sourceLogo} alt="" className="size-4 rounded-full" loading="lazy" />}
      <span className="truncate font-medium text-fg-muted">{article.source}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={new Date(article.publishedAt).toISOString()} className="shrink-0">
        {ago(article.publishedAt)}
      </time>
    </p>
  );
}

/** Mentioned coin with its live 24h move; links to the coin page */
const CoinChip = memo(({ coin }) => {
  const live = useLivePrice(coin.id, coin.symbol);
  return (
    <Link
      to={`/coin/coin-details/${coin.id}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-line py-0.5 pl-0.5 pr-2 text-xs transition-colors hover:border-line-strong"
    >
      <CoinAvatar src={coin.image} symbol={coin.symbol} size={18} />
      <span className="font-medium text-fg">{coin.symbol?.toUpperCase()}</span>
      <Delta value={live?.price_change_percentage_24h ?? coin.price_change_percentage_24h} />
    </Link>
  );
});
CoinChip.displayName = "CoinChip";

const CoinChips = ({ coins }) =>
  coins.length > 0 && (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {coins.slice(0, 4).map((c) => (
        <CoinChip key={c.id} coin={c} />
      ))}
    </div>
  );

function LeadStory({ article }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden">
        <Thumb src={article.image} className="aspect-[2/1] max-h-[340px] w-full transition-transform duration-500 group-hover:scale-[1.02]" />
      </a>
      <div className="flex flex-1 flex-col p-5">
        <SourceLine article={article} />
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          <h2 className="mt-2 text-xl font-semibold leading-snug text-fg hover:text-brand">{article.title}</h2>
        </a>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-fg-muted">{article.body}</p>
        <CoinChips coins={article.coins} />
      </div>
    </article>
  );
}

function SecondaryStory({ article }) {
  return (
    <article className="flex gap-4 rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="min-w-0 flex-1">
        <SourceLine article={article} />
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          <h3 className="mt-1.5 line-clamp-3 text-[15px] font-semibold leading-snug text-fg hover:text-brand">{article.title}</h3>
        </a>
        <p className="mt-1.5 line-clamp-3 text-sm text-fg-muted">{article.body}</p>
        <CoinChips coins={article.coins} />
      </div>
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="shrink-0" tabIndex={-1} aria-hidden="true">
        <Thumb src={article.image} className="size-20 rounded-lg" />
      </a>
    </article>
  );
}

function FeedItem({ article }) {
  return (
    <article className="flex gap-4 px-4 py-4 sm:px-5">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="shrink-0" tabIndex={-1} aria-hidden="true">
        <Thumb src={article.image} className="h-20 w-24 rounded-lg sm:h-24 sm:w-36" />
      </a>
      <div className="min-w-0 flex-1">
        <SourceLine article={article} />
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="group">
          <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-fg group-hover:text-brand">
            {article.title}
            <ExternalLink size={12} className="ml-1.5 inline align-baseline text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
          </h3>
        </a>
        {/* sm:line-clamp-2 also sets the display; "sm:block" would undo the clamp */}
        <p className="mt-1 hidden text-sm text-fg-muted sm:line-clamp-2">{article.body}</p>
        <CoinChips coins={article.coins} />
      </div>
    </article>
  );
}

/** Crypto headlines with topic filters, coin tags and a live "coins in the news" panel */
export default function NewsPage() {
  const { articles, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useNews();
  const [topic, setTopic] = useState("ALL");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Topics that actually appear in the feed, most common first
  const topics = useMemo(() => {
    const counts = {};
    articles.forEach((a) => a.categories.forEach((c) => TOPIC_LABELS[c] && (counts[c] = (counts[c] || 0) + 1)));
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 8);
  }, [articles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter(
      (a) =>
        (topic === "ALL" || a.categories.includes(topic)) &&
        (!q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q) || a.source?.toLowerCase().includes(q)),
    );
  }, [articles, topic, query]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [topic, query]);

  // Coins mentioned most often, and the busiest sources
  const { trending, sources, sourceCount } = useMemo(() => {
    const coinCounts = new Map();
    const sourceCounts = new Map();
    articles.forEach((a) => {
      a.coins.forEach((c) => coinCounts.set(c.id, { coin: c, count: (coinCounts.get(c.id)?.count || 0) + 1 }));
      if (a.source) sourceCounts.set(a.source, { logo: a.sourceLogo, count: (sourceCounts.get(a.source)?.count || 0) + 1 });
    });
    return {
      trending: [...coinCounts.values()].sort((a, b) => b.count - a.count).slice(0, 6),
      sources: [...sourceCounts.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 6),
      sourceCount: sourceCounts.size,
    };
  }, [articles]);

  const showLead = topic === "ALL" && !query.trim() && filtered.length >= 3;
  const [lead, ...rest] = showLead ? filtered : [];
  const feed = showLead ? rest.slice(2) : filtered;
  const topicLabel = TOPIC_LABELS[topic] || topic;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-3 py-4 sm:p-0">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">News</h1>
          <p className="mt-0.5 text-sm text-fg-subtle">
            {articles.length ? `Latest headlines from ${sourceCount} crypto publishers` : "Latest crypto headlines"}
            {dataUpdatedAt ? ` · updated ${ago(dataUpdatedAt).toLowerCase()}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-fg transition-colors hover:bg-surface-hover disabled:opacity-60"
        >
          <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} /> Refresh
        </button>
      </header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Topics" className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {["ALL", ...topics, ...(topic !== "ALL" && !topics.includes(topic) ? [topic] : [])].map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={topic === t}
              onClick={() => setTopic(t)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                topic === t ? "border-brand bg-brand-soft text-brand" : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {t === "ALL" ? "All news" : TOPIC_LABELS[t] || t}
            </button>
          ))}
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search headlines" className="md:w-64" />
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[360px] rounded-xl lg:col-span-2" />
          <div className="space-y-4">
            <Skeleton className="h-[170px] rounded-xl" />
            <Skeleton className="h-[170px] rounded-xl" />
          </div>
        </div>
      ) : isError && articles.length === 0 ? (
        <Card>
          <EmptyState icon={Newspaper} title="News is unavailable right now" description="The news provider didn't respond. Try refreshing in a minute." className="py-16" />
        </Card>
      ) : (
        <>
          {showLead && (
            <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
              <div className="lg:col-span-2">
                <LeadStory article={lead} />
              </div>
              <div className="grid gap-4 lg:gap-5">
                {rest.slice(0, 2).map((a) => (
                  <SecondaryStory key={a.id} article={a} />
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:gap-5 xl:grid-cols-12">
            <Card className="min-w-0 xl:col-span-8">
              <CardHeader
                icon={Newspaper}
                title={topic === "ALL" ? "Latest" : topicLabel}
                subtitle={`${filtered.length} ${filtered.length === 1 ? "story" : "stories"}`}
                action={
                  topic !== "ALL" && (
                    <button
                      type="button"
                      onClick={() => setTopic("ALL")}
                      className="inline-flex items-center gap-1 text-xs font-medium text-fg-muted hover:text-fg"
                    >
                      <X size={13} /> Clear filter
                    </button>
                  )
                }
              />
              {feed.length === 0 ? (
                <EmptyState icon={SearchX} title="No stories match" description="Try another topic or search term." className="py-14" />
              ) : (
                <div className="divide-y divide-line border-t border-line">
                  {feed.slice(0, visibleCount).map((a) => (
                    <FeedItem key={a.id} article={a} />
                  ))}
                </div>
              )}
              {feed.length > visibleCount && (
                <div className="border-t border-line p-3 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-soft"
                  >
                    Load more stories
                  </button>
                </div>
              )}
            </Card>

            <aside className="min-w-0 space-y-4 lg:space-y-5 xl:col-span-4">
              {trending.length > 0 && (
                <Card>
                  <CardHeader title="Coins in the news" subtitle="Most mentioned in today's headlines" />
                  <div className="divide-y divide-line">
                    {trending.map(({ coin, count }) => (
                      <LiveCoinRow
                        key={coin.id}
                        id={coin.id}
                        symbol={coin.symbol}
                        image={coin.image}
                        price={coin.current_price}
                        change={coin.price_change_percentage_24h}
                        meta={`${count} ${count === 1 ? "story" : "stories"}`}
                        onClick={() => setTopic(coin.symbol.toUpperCase())}
                      />
                    ))}
                  </div>
                </Card>
              )}
              {sources.length > 0 && (
                <Card className="pb-2">
                  <CardHeader title="Top sources" />
                  <ul>
                    {sources.map(([name, { logo, count }]) => (
                      <li key={name} className="flex items-center gap-3 px-4 py-2 text-sm">
                        {logo ? <img src={logo} alt="" className="size-6 rounded-full" loading="lazy" /> : <span className="size-6 rounded-full bg-surface-2" />}
                        <span className="min-w-0 flex-1 truncate text-fg">{name}</span>
                        <span className="tabular text-xs text-fg-subtle">{count}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
