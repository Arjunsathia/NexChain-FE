import { getCoins } from "@/api/coinApis";
import { useQuery } from "@tanstack/react-query";

const useLiveCoins = () => {
  return useQuery({
    queryKey: ["live-coins"],
    queryFn: getCoins,
    refetchInterval: 60000, // 1 minute
    staleTime: 55000,       // Don't refetch within 55s
    refetchOnWindowFocus: true,
  });
};

export default useLiveCoins;
