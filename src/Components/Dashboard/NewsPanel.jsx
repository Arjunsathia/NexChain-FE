import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Newspaper, ArrowRight } from "lucide-react";
import useNews from "@/hooks/useNews";
import { Card, CardHeader, CardLink, EmptyState } from "@/Components/ui/card";
import { Skeleton } from "@/Components/ui/skeleton";
import { formatTimeAgo } from "@/utils/format";

const Thumb = ({ src }) => {
  const [failed, setFailed] = React.useState(false);
  return src && !failed ? (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="size-16 shrink-0 rounded-lg bg-surface-2 object-cover sm:size-[72px]"
    />
  ) : (
    <span className="grid size-16 shrink-0 place-items-center rounded-lg bg-surface-2 text-fg-subtle sm:size-[72px]">
      <Newspaper size={18} />
    </span>
  );
};

/** Latest crypto headlines (CryptoCompare via our API) */
function NewsPanel() {
  const navigate = useNavigate();
  // Shares the News page's cached request
  const { articles, isLoading, isError } = useNews();
  const data = articles.slice(0, 6).map((a) => ({
    id: a.id,
    title: a.title,
    image: a.image,
    source: a.source,
    time: formatTimeAgo(a.publishedAt / 1000),
    link: a.url,
  }));

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        icon={Newspaper}
        title="Market news"
        action={
          <CardLink onClick={() => navigate("/news")}>
            All news <ArrowRight size={12} />
          </CardLink>
        }
      />
      {isLoading ? (
        <div className="grid gap-x-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex gap-3 px-4 py-3">
              <Skeleton className="size-16 shrink-0 rounded-lg sm:size-[72px]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : isError || data.length === 0 ? (
        <EmptyState icon={Newspaper} title="News is unavailable right now" description="Try again in a few minutes." className="flex-1" />
      ) : (
        <ul className="grid flex-1 content-start sm:grid-cols-2">
          {data.map((item) => (
            <li key={item.id}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
              >
                <Thumb src={item.image} />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-fg group-hover:text-brand">
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-xs text-fg-subtle">
                    {item.source}
                    {item.time && ` · ${item.time}`}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default memo(NewsPanel);
