import React, { memo, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Newspaper, RefreshCw, SearchX, X } from "lucide-react";
import useNews from "@/hooks/useNews";
import useMediaQuery from "@/hooks/useMediaQuery";
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
const PHONE_PAGE_SIZE = 10;

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
      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-line py-0.5 pl-1 pr-2.5 text-xs transition-colors sm:min-h-0 sm:pl-0.5 sm:pr-2 hover:border-line-strong"
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
    <div className="mt-2.5 flex flex-wrap gap-2 sm:gap-1.5">
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
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <SourceLine article={article} />
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          <h2 className="mt-2 text-lg font-semibold leading-snug text-fg [overflow-wrap:anywhere] hover:text-brand sm:text-xl">{article.title}</h2>
        </a>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-fg-muted [overflow-wrap:anywhere]">{article.body}</p>
        <CoinChips coins={article.coins} />
      </div>
    </article>
  );
}

function SecondaryStory({ article }) {
  return (
    <article className="flex gap-3 rounded-xl border border-line bg-surface p-4 shadow-card sm:gap-4">
      <div className="min-w-0 flex-1">
        <SourceLine article={article} />
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          <h3 className="mt-1.5 line-clamp-3 text-[15px] font-semibold leading-snug text-fg [overflow-wrap:anywhere] hover:text-brand">{article.title}</h3>
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
    <article className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="shrink-0" tabIndex={-1} aria-hidden="true">
        <Thumb src={article.image} className="h-20 w-24 rounded-lg sm:h-24 sm:w-36" />
      </a>
      <div className="min-w-0 flex-1">
        <SourceLine article={article} />
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="group">
          <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-fg [overflow-wrap:anywhere] group-hover:text-brand">
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

/* ---------- Phones ---------- */

/** Lead story: the photo fills the card and the headline sits on a dark gradient */
function PhoneLead({ article }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block h-[220px] overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-card"
    >
      <Thumb src={article.image} className="absolute inset-0 size-full" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" aria-hidden="true" />
      <span className="absolute inset-x-0 bottom-0 p-4">
        <span className="mb-1.5 flex items-center gap-1.5 text-xs text-white/80">
          {article.sourceLogo && <img src={article.sourceLogo} alt="" className="size-4 rounded-full" loading="lazy" />}
          <span className="truncate font-medium text-white">{article.source}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{ago(article.publishedAt)}</span>
        </span>
        <span className="line-clamp-3 text-lg leading-snug font-semibold text-white [overflow-wrap:anywhere]">{article.title}</span>
      </span>
    </a>
  );
}

/** Swipeable "Top stories" card */
function PhoneCard({ article }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
    >
      <Thumb src={article.image} className="h-28 w-full" />
      <span className="flex flex-1 flex-col p-3">
        <SourceLine article={article} />
        <span className="mt-1.5 line-clamp-3 text-[15px] leading-snug font-semibold text-fg [overflow-wrap:anywhere]">{article.title}</span>
      </span>
    </a>
  );
}

/** Compact list row: text on the left, a small photo on the right */
function PhoneRow({ article }) {
  const coin = article.coins[0];
  return (
    <article className="flex gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <SourceLine article={article} />
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          <h3 className="mt-1 line-clamp-2 text-[15px] leading-snug font-semibold text-fg [overflow-wrap:anywhere]">{article.title}</h3>
        </a>
        {coin && (
          <div className="mt-2 flex">
            <CoinChip coin={coin} />
          </div>
        )}
      </div>
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="shrink-0" tabIndex={-1} aria-hidden="true">
        <Thumb src={article.image} className="size-16 rounded-xl" />
      </a>
    </article>
  );
}

/** "Coins in the news" chip: tap to filter the feed by that coin */
const TrendChip = memo(({ coin, count, active, onSelect }) => {
  const live = useLivePrice(coin.id, coin.symbol);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex min-h-14 shrink-0 snap-start items-center gap-2.5 rounded-2xl border py-2 pr-3.5 pl-2.5 text-left transition-colors",
        active ? "border-brand bg-brand-soft" : "border-line bg-surface",
      )}
    >
      <CoinAvatar src={coin.image} symbol={coin.symbol} size={28} />
      <span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-fg">
          {coin.symbol?.toUpperCase()}
          <Delta value={live?.price_change_percentage_24h ?? coin.price_change_percentage_24h} className="text-xs" />
        </span>
        <span className="block text-xs text-fg-subtle">
          {count} {count === 1 ? "story" : "stories"}
        </span>
      </span>
    </button>
  );
});
TrendChip.displayName = "TrendChip";

const SectionTitle = ({ children, action }) => (
  <div className="mb-2.5 flex items-center justify-between gap-3">
    <h2 className="text-base font-semibold text-fg">{children}</h2>
    {action}
  </div>
);

/** Crypto headlines with topic filters, coin tags and a live "coins in the news" panel */
export default function NewsPage() {
  const { articles, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useNews();
  const isPhone = useMediaQuery("(max-width: 639px)");
  const pageSize = isPhone ? PHONE_PAGE_SIZE : PAGE_SIZE;
  const [topic, setTopic] = useState("ALL");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(pageSize);

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

  useEffect(() => setVisibleCount(pageSize), [topic, query, pageSize]);

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
  const topicTabs = ["ALL", ...topics, ...(topic !== "ALL" && !topics.includes(topic) ? [topic] : [])];

  if (isPhone) {
    // Phones: a lead photo story, swipeable top stories, coins in the news, then a compact list
    const top = showLead ? rest.slice(0, 4) : [];
    const list = showLead ? rest.slice(4) : filtered;
    return (
      <div className="space-y-5 px-4 py-5">
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-fg">News</h1>
            <p className="mt-0.5 truncate text-xs text-fg-subtle">
              {articles.length ? `${sourceCount} publishers` : "Latest crypto headlines"}
              {dataUpdatedAt ? ` · updated ${ago(dataUpdatedAt).toLowerCase()}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh news"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface text-fg-muted transition-colors hover:text-fg disabled:opacity-60"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          </button>
        </header>

        {/* Topics and search stay under the top bar while scrolling */}
        <div className="sticky top-[var(--topbar-h)] z-10 -mx-4 space-y-2.5 bg-canvas/90 px-4 py-2.5 backdrop-blur-md">
          <div role="tablist" aria-label="Topics" className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
            {topicTabs.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={topic === t}
                onClick={() => setTopic(t)}
                className={cn(
                  "min-h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium whitespace-nowrap transition-colors",
                  topic === t ? "border-brand bg-brand text-brand-fg" : "border-line bg-surface text-fg-muted",
                )}
              >
                {t === "ALL" ? "All news" : TOPIC_LABELS[t] || t}
              </button>
            ))}
          </div>
          <SearchInput value={query} onChange={setQuery} placeholder="Search headlines" />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[220px] rounded-2xl" />
            <div className="flex gap-3 overflow-hidden">
              <Skeleton className="h-[220px] w-[260px] shrink-0 rounded-2xl" />
              <Skeleton className="h-[220px] w-[260px] shrink-0 rounded-2xl" />
            </div>
          </div>
        ) : isError && articles.length === 0 ? (
          <Card>
            <EmptyState icon={Newspaper} title="News is unavailable right now" description="The news provider didn't respond. Try refreshing in a minute." className="py-16" />
          </Card>
        ) : (
          <>
            {showLead && <PhoneLead article={lead} />}

            {top.length > 0 && (
              <section aria-label="Top stories">
                <SectionTitle>Top stories</SectionTitle>
                <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
                  {top.map((a) => (
                    <PhoneCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            )}

            {trending.length > 0 && (
              <section aria-label="Coins in the news">
                <SectionTitle>Coins in the news</SectionTitle>
                <div className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
                  {trending.map(({ coin, count }) => {
                    const sym = coin.symbol.toUpperCase();
                    return (
                      <TrendChip key={coin.id} coin={coin} count={count} active={topic === sym} onSelect={() => setTopic(topic === sym ? "ALL" : sym)} />
                    );
                  })}
                </div>
              </section>
            )}

            <section aria-label={topic === "ALL" ? "Latest" : topicLabel}>
              <SectionTitle
                action={
                  topic !== "ALL" ? (
                    <button type="button" onClick={() => setTopic("ALL")} className="inline-flex min-h-9 items-center gap-1 text-[13px] font-medium text-fg-muted">
                      <X size={14} /> Clear
                    </button>
                  ) : (
                    <span className="text-xs text-fg-subtle">
                      {filtered.length} {filtered.length === 1 ? "story" : "stories"}
                    </span>
                  )
                }
              >
                {topic === "ALL" ? "Latest" : topicLabel}
              </SectionTitle>
              <Card className="overflow-hidden">
                {list.length === 0 ? (
                  <EmptyState icon={SearchX} title="No stories match" description="Try another topic or search term." className="py-12" />
                ) : (
                  <div className="divide-y divide-line">
                    {list.slice(0, visibleCount).map((a) => (
                      <PhoneRow key={a.id} article={a} />
                    ))}
                  </div>
                )}
                {list.length > visibleCount && (
                  <div className="border-t border-line p-2">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((n) => n + pageSize)}
                      className="min-h-11 w-full rounded-xl text-sm font-semibold text-brand hover:bg-brand-soft"
                    >
                      Load more stories
                    </button>
                  </div>
                )}
              </Card>
            </section>

            {sources.length > 0 && (
              <section aria-label="Top sources">
                <SectionTitle>Top sources</SectionTitle>
                <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
                  {sources.map(([name, { logo, count }]) => (
                    <span key={name} className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1.5 text-[13px] text-fg">
                      {logo ? <img src={logo} alt="" className="size-6 rounded-full" loading="lazy" /> : <span className="size-6 rounded-full bg-surface-2" />}
                      {name}
                      <span className="tabular text-xs text-fg-subtle">{count}</span>
                    </span>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-5 sm:p-0">
      <header className="flex items-start justify-between gap-3 sm:items-end">
        <div className="min-w-0">
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
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3.5 text-sm font-semibold sm:min-h-0 sm:py-2 text-fg transition-colors hover:bg-surface-hover disabled:opacity-60"
        >
          <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} /> Refresh
        </button>
      </header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Topics" className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {topicTabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={topic === t}
              onClick={() => setTopic(t)}
              className={cn(
                "min-h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-medium transition-colors sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-xs",
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
              <div className="min-w-0 lg:col-span-2">
                <LeadStory article={lead} />
              </div>
              <div className="grid min-w-0 gap-4 lg:gap-5">
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
                      className="inline-flex min-h-9 items-center gap-1 px-1 text-[13px] font-medium text-fg-muted hover:text-fg sm:min-h-0 sm:text-xs"
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
                    onClick={() => setVisibleCount((n) => n + pageSize)}
                    className="min-h-11 w-full rounded-lg px-4 text-sm font-semibold text-brand hover:bg-brand-soft sm:min-h-0 sm:w-auto sm:py-2"
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
