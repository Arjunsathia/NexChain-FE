import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/api/axiosConfig";
import useCoinContext from "@/hooks/useCoinContext";
import { safeUrl } from "@/utils/safeUrl";

const toArticle = (item) => ({
  id: item.id,
  title: item.title,
  body: item.body || "",
  image: item.imageurl,
  source: item.source_info?.name || item.source,
  sourceLogo: item.source_info?.img,
  publishedAt: (item.published_on || 0) * 1000,
  url: safeUrl(item.url),
  categories: item.categories ? item.categories.split("|").filter(Boolean) : [],
});

/**
 * Latest headlines (CryptoCompare through our API, cached there for 5 minutes).
 * Each article gets `coins`: market-list coins whose ticker it is tagged with.
 */
export default function useNews() {
  const { coins } = useCoinContext();
  const query = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const data = await getData("/news");
      const list = Array.isArray(data) ? data : data?.data || data?.news || [];
      return list.map(toArticle);
    },
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });

  const articles = useMemo(() => {
    const bySymbol = new Map(coins.map((c) => [c.symbol?.toUpperCase(), c]));
    return (query.data || []).map((a) => ({
      ...a,
      coins: a.categories.map((cat) => bySymbol.get(cat)).filter(Boolean),
    }));
  }, [query.data, coins]);

  return { ...query, articles };
}
