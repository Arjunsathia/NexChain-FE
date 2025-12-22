import { getCoins } from "@/api/coinApis";
import { useQuery } from "@tanstack/react-query";

const useLiveCoins = () => {
  return useQuery({
    queryKey: ["live-coins"],
    queryFn: getCoins,
    refetchInterval: 60000, 
    staleTime: 55000,       
    refetchOnWindowFocus: true,
  });
};

export default useLiveCoins;
