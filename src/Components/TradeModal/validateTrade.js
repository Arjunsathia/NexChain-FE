/**
 * Client-side checks for the trade modal, before anything is sent to the API
 * (which validates everything again). Returns an error message, or null when
 * the order may proceed.
 *
 * Stop rules follow how the engine triggers stops: a buy stop fires once the
 * price rises to it, a sell stop once the price falls to it. A stop on the
 * wrong side of the market would fire immediately, so it's rejected here.
 */
export function validateTrade({
  side,
  orderType,
  usdAmount,
  coinAmount,
  stopPrice,
  limitPrice,
  currentPrice,
  available = 0,
  maxAvailable = Infinity,
  symbol = "",
}) {
  const isBuy = side === "buy";
  const sym = String(symbol).toUpperCase();
  const price = Number(currentPrice).toLocaleString();

  if (!usdAmount || parseFloat(usdAmount) <= 0) return "Please enter a valid amount";

  if (!isBuy) {
    const quantity = parseFloat(coinAmount);
    if (!(available > 0)) return "No holdings found for this coin. Please refresh and try again.";
    if (!(quantity > 0)) return "Please enter a valid amount to sell";
    if (quantity > available + 1e-9) return `You only have ${available.toFixed(8)} ${sym} available`;
    if (quantity < 0.000001) return "Minimum sell amount is 0.000001";
  }

  if (orderType === "stop_limit" || orderType === "stop_market" || orderType === "oco") {
    const stop = parseFloat(stopPrice);
    const limit = parseFloat(limitPrice);

    if (orderType === "stop_market" && isNaN(stop)) return "Please enter a stop price";
    if (orderType === "oco" && (isNaN(stop) || isNaN(limit)))
      return "Please enter both the take-profit (limit) and stop-loss (stop) prices";
    if (orderType === "stop_limit" && (isNaN(stop) || isNaN(limit)))
      return "Please enter both stop and limit prices";

    if (orderType === "oco") {
      // Buy OCO: limit catches a dip (below market), stop buys a breakout (above market).
      // Sell OCO: limit takes profit (above market), stop cuts losses (below market).
      if (isBuy && limit >= currentPrice)
        return `For a buy OCO, the buy limit must be below the current price ($${price}).`;
      if (isBuy && stop <= currentPrice)
        return `For a buy OCO, the buy stop must be above the current price ($${price}).`;
      if (!isBuy && limit <= currentPrice)
        return `For a sell OCO, take profit must be above the current price ($${price}).`;
      if (!isBuy && stop >= currentPrice)
        return `For a sell OCO, the stop loss must be below the current price ($${price}).`;
    } else {
      if (isBuy && stop <= currentPrice)
        return `A buy stop must be above the current price ($${price}). Use a limit order to buy lower.`;
      if (!isBuy && stop >= currentPrice)
        return `A sell stop must be below the current price ($${price}). Use a limit order to sell higher.`;
    }
  }

  if (isBuy && parseFloat(coinAmount) > maxAvailable) return "Insufficient balance for this purchase";

  return null;
}

/** A limit price already past the market fills immediately, so the modal confirms first */
export function fillsImmediately({ side, orderType, limitPrice, currentPrice }) {
  if ((orderType !== "limit" && orderType !== "stop_limit") || !limitPrice) return false;
  const lp = parseFloat(limitPrice);
  return side === "buy" ? lp >= currentPrice : lp <= currentPrice;
}
