import { useContext } from "react";
import { CoinContext } from "@/Context/CoinContext/CoinContext";

const useCoinContext = () => useContext(CoinContext);

export default useCoinContext;
