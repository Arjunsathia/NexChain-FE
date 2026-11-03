// Learning hub guides. Plain data so the hub, the article page and search share
// one source. Statements about NexChain match how the app and API behave
// (starting balance, no fees, order rules, reset cooldown).

export const CATEGORIES = [
  { id: "start", label: "Getting started" },
  { id: "markets", label: "Markets" },
  { id: "orders", label: "Order types" },
  { id: "risk", label: "Risk & returns" },
  { id: "security", label: "Security" },
];

export const GUIDES = [
  {
    slug: "how-nexchain-works",
    title: "How NexChain paper trading works",
    summary: "Your virtual account, live prices, what a trade does and how to start over.",
    category: "start",
    level: "Beginner",
    sections: [
      {
        body: [
          "NexChain is a paper-trading simulator: you trade real cryptocurrencies at real market prices, but with virtual money. Nothing you do here can lose or make real money, which makes it a safe place to learn how trading works and to test ideas.",
        ],
      },
      {
        heading: "Your account",
        body: [
          "Every account starts with $10,000 in virtual cash. Buying a coin spends cash and adds the coin to your holdings; selling does the reverse. Your total equity is your cash plus the current value of everything you hold.",
        ],
        bullets: [
          "Prices come from Binance's live market feed and update every second.",
          "Trades carry no fees, so your results reflect price movement only.",
          "Pending limit and stop orders reserve the cash or coins they need until they fill or you cancel them.",
        ],
      },
      {
        heading: "Making your first trade",
        body: [
          "Open Markets, pick a coin and press Trade. Choose Buy, enter a quantity or a dollar total, and confirm. A market order fills straight away at the current price, and the coin appears under Portfolio → Positions with its live value and profit or loss.",
        ],
      },
      {
        heading: "Starting over",
        body: [
          "If you want a clean slate, Portfolio → Reset account puts your cash back to $10,000, removes all holdings and cancels open orders. Your trade history is kept. You can reset once every 24 hours.",
        ],
        callout: { tone: "tip", text: "Treat the virtual money as if it were real. Habits you build here carry over." },
      },
    ],
    cta: { label: "Explore markets", to: "/cryptolist" },
  },
  {
    slug: "reading-price-charts",
    title: "Reading a price chart",
    summary: "Timeframes, trends, support and resistance, and what volume tells you.",
    category: "markets",
    level: "Beginner",
    sections: [
      {
        body: [
          "A price chart shows how a coin's price changed over time. The horizontal axis is time and the vertical axis is price. Learning to read one is the first step to understanding what the market has been doing.",
        ],
      },
      {
        heading: "Pick a timeframe",
        body: [
          "The same coin can look very different over 24 hours and over a year. Short timeframes show noise and intraday swings; long timeframes show the broader trend. Check more than one before drawing conclusions.",
        ],
      },
      {
        heading: "Line and candlestick charts",
        body: [
          "A line chart connects closing prices and is easy to read at a glance. A candlestick chart shows four prices for each period: open, high, low and close. The body spans open to close and the thin wicks reach the high and low. A green candle closed higher than it opened; a red one closed lower.",
        ],
      },
      {
        heading: "Trend, support and resistance",
        bullets: [
          "An uptrend makes higher highs and higher lows; a downtrend makes lower highs and lower lows.",
          "Support is a price area where buying has repeatedly stopped a fall.",
          "Resistance is a price area where selling has repeatedly stopped a rise.",
          "When price breaks through one of these levels, the old resistance often becomes the new support, and the other way round.",
        ],
      },
      {
        heading: "Volume",
        body: [
          "Volume is how much was traded in a period. A price move on high volume has more participation behind it than the same move on thin volume, so it is generally considered more meaningful.",
        ],
        callout: { tone: "warn", text: "Patterns describe the past. They suggest probabilities, never certainties." },
      },
    ],
    cta: { label: "Open a coin chart", to: "/coin/coin-details/bitcoin" },
  },
  {
    slug: "market-cap-volume-dominance",
    title: "Market cap, volume and dominance",
    summary: "The three numbers at the top of the Markets page, and how to use them.",
    category: "markets",
    level: "Beginner",
    sections: [
      {
        heading: "Market capitalisation",
        body: [
          "Market cap is the price of one coin multiplied by the number of coins in circulation. A coin priced at $2 with 500 million coins in circulation has a market cap of $1 billion. It is a better measure of size than price alone: a $0.10 coin can be worth far more in total than a $500 coin.",
        ],
      },
      {
        heading: "24-hour volume",
        body: [
          "Volume is the dollar value of all trades in the last 24 hours. High volume usually means the coin is liquid: you can buy or sell meaningful amounts without moving the price much. Very low volume relative to market cap is a warning sign.",
        ],
      },
      {
        heading: "Dominance",
        body: [
          "Bitcoin dominance is Bitcoin's market cap as a share of the whole crypto market. Rising dominance often means money is moving towards Bitcoin, typically in uncertain times; falling dominance often means traders are taking more risk in other coins.",
        ],
        callout: { tone: "tip", text: "Sort the Markets table by market cap or volume to see which coins really carry weight." },
      },
    ],
    cta: { label: "View market stats", to: "/cryptolist" },
  },
  {
    slug: "stablecoins",
    title: "What are stablecoins?",
    summary: "Coins designed to hold $1, why traders use them, and their risks.",
    category: "markets",
    level: "Beginner",
    sections: [
      {
        body: [
          "A stablecoin is a cryptocurrency designed to keep a steady value, usually $1. USDT (Tether) and USDC are the largest. On exchanges they work as a digital dollar: traders move into them to lock in gains or wait out volatility without leaving the crypto market.",
        ],
      },
      {
        heading: "How they hold their value",
        bullets: [
          "Fiat-backed stablecoins hold cash and short-term government debt in reserve for every coin issued.",
          "Crypto-backed stablecoins are over-collateralised with other cryptocurrencies.",
          "Algorithmic designs try to hold the peg with supply rules alone; several have failed.",
        ],
      },
      {
        heading: "Risks",
        body: [
          "A stablecoin is only as reliable as its reserves and its issuer. Prices can briefly drift from $1 (a 'depeg') during market stress. That is why NexChain leaves stablecoins out of 'Most traded' and the dashboard chart: they barely move by design.",
        ],
      },
    ],
    cta: { label: "Compare coins", to: "/cryptolist" },
  },
  {
    slug: "market-vs-limit-orders",
    title: "Market orders vs limit orders",
    summary: "Fill now at the current price, or wait for a price you choose.",
    category: "orders",
    level: "Beginner",
    sections: [
      {
        heading: "Market orders",
        body: [
          "A market order buys or sells immediately at the current price. Use it when getting in or out now matters more than the exact price. In NexChain, market orders fill at the live Binance price.",
        ],
      },
      {
        heading: "Limit orders",
        body: [
          "A limit order sets the worst price you will accept. A buy limit only fills at your price or lower; a sell limit only fills at your price or higher. If the market never reaches it, the order simply waits.",
        ],
        bullets: [
          "Buy limit below the current price: waits for a dip.",
          "Sell limit above the current price: waits to take profit.",
          "A buy limit above the market (or a sell limit below it) fills straight away. NexChain warns you with 'Fills instantly' and asks you to confirm.",
        ],
      },
      {
        heading: "While an order is open",
        body: [
          "A pending buy reserves the cash it needs, and a pending sell reserves the coins, so you can't spend them twice. Find, edit or cancel open orders under Portfolio → Open orders, which also shows how far the market has to move for each one to fill.",
        ],
        callout: { tone: "tip", text: "Limit orders give price control at the cost of certainty: a price you never reach means a trade you never make." },
      },
    ],
    cta: { label: "Place a limit order", to: "/cryptolist" },
  },
  {
    slug: "stop-orders",
    title: "Stop-limit and stop-market orders",
    summary: "Orders that wake up when price crosses a trigger, for exits and breakouts.",
    category: "orders",
    level: "Intermediate",
    sections: [
      {
        body: [
          "A stop order sits dormant until the price reaches its stop (trigger) price. It is most often used to limit losses, but it can also buy into a breakout.",
        ],
      },
      {
        heading: "Stop-market",
        body: [
          "When the stop price is reached, a stop-market order becomes a market order and fills at the next available price. It is the most reliable way to get out, but in a fast market the fill can be worse than the stop price.",
        ],
      },
      {
        heading: "Stop-limit",
        body: [
          "A stop-limit order has two prices. When the stop price is reached, a limit order is placed at your limit price. You control the worst price you accept, but if the market jumps past your limit the order may not fill at all.",
        ],
      },
      {
        heading: "Which side of the market?",
        bullets: [
          "A sell stop must be below the current price: it protects you if the price falls.",
          "A buy stop must be above the current price: it buys if the price breaks upwards.",
          "NexChain checks this when you place the order and explains if the stop is on the wrong side.",
        ],
        callout: { tone: "warn", text: "A stop-loss limits a loss; it does not prevent one. Decide where you'd be wrong before you enter a trade." },
      },
    ],
    cta: { label: "Try a stop order", to: "/cryptolist" },
  },
  {
    slug: "oco-orders",
    title: "OCO orders: take profit and stop loss together",
    summary: "Two orders linked so that when one fills, the other is cancelled.",
    category: "orders",
    level: "Intermediate",
    sections: [
      {
        body: [
          "OCO stands for one-cancels-the-other. You place two orders at once; as soon as one fills, the other is cancelled automatically. It lets you plan both outcomes of a trade in advance.",
        ],
      },
      {
        heading: "Selling with an OCO",
        body: [
          "The classic use is protecting a position you already hold: a take-profit limit above the current price and a stop-loss below it. Whichever price the market reaches first closes the position, and the other order disappears.",
        ],
      },
      {
        heading: "Buying with an OCO",
        body: [
          "A buy OCO combines a buy limit below the current price (to catch a dip) with a buy stop above it (to catch a breakout). You enter on whichever happens first.",
        ],
      },
      {
        heading: "In NexChain",
        bullets: [
          "Choose OCO as the order type and enter both prices; the app checks each sits on the correct side of the market.",
          "The stop side executes as a stop-market order once triggered.",
          "OCO orders can't be edited, only cancelled. Cancelling one leg cancels both.",
        ],
      },
    ],
    cta: { label: "Set up an OCO", to: "/portfolio" },
  },
  {
    slug: "pnl-and-cost-basis",
    title: "Profit, loss and cost basis",
    summary: "How your returns are calculated, with a worked example.",
    category: "risk",
    level: "Beginner",
    sections: [
      {
        heading: "Cost basis and average cost",
        body: [
          "Your cost basis is what you paid for the coins you still hold. Average cost is that amount divided by the quantity. If you buy 0.05 BTC at $60,000 ($3,000) and later 0.05 BTC at $70,000 ($3,500), you hold 0.1 BTC with a cost basis of $6,500 and an average cost of $65,000.",
        ],
      },
      {
        heading: "Unrealised and realised P&L",
        body: [
          "Unrealised profit or loss is the difference between what your holdings are worth now and their cost basis. It changes with every price tick and only becomes realised when you sell. In the example, at $66,000 your 0.1 BTC is worth $6,600: an unrealised gain of $100, or about +1.5%.",
        ],
      },
      {
        heading: "Total return",
        body: [
          "On the dashboard and Portfolio page, total return compares your total equity (cash plus holdings at market price) with the $10,000 every account starts with. It includes everything: realised gains, unrealised gains and losses.",
        ],
        callout: { tone: "tip", text: "Judge a strategy by total return over many trades, not by a single winning position." },
      },
    ],
    cta: { label: "Open your portfolio", to: "/portfolio" },
  },
  {
    slug: "position-sizing",
    title: "Position sizing and diversification",
    summary: "How much to put into one trade, and why spreading risk matters.",
    category: "risk",
    level: "Intermediate",
    sections: [
      {
        body: [
          "Most traders who fail don't pick bad coins; they bet too much on one idea. Position sizing decides how much of your account goes into a single trade so that being wrong is survivable.",
        ],
      },
      {
        heading: "Risk a fixed share per trade",
        body: [
          "A common rule is to risk 1–2% of your account on any single trade. With $10,000 and a 1% rule, the most you should lose on one trade is $100.",
          "Work backwards from your stop-loss. If you buy at $100 with a stop at $95, you risk $5 per coin. To keep the loss at $100, buy 20 coins: a $2,000 position. The stop decides the size, not the other way round.",
        ],
      },
      {
        heading: "Diversify",
        bullets: [
          "Crypto prices often move together, so holding five similar coins is less diversification than it looks.",
          "Keeping part of the account in cash gives you room to act on new opportunities.",
          "Check Portfolio → Allocation to see how concentrated you are.",
        ],
        callout: { tone: "warn", text: "Never add to a losing position just to lower your average cost without a plan." },
      },
    ],
    cta: { label: "Check your allocation", to: "/portfolio" },
  },
  {
    slug: "staying-safe",
    title: "Staying safe: wallets, keys and scams",
    summary: "Protect your accounts and recognise the most common crypto scams.",
    category: "security",
    level: "Beginner",
    sections: [
      {
        heading: "Wallets and keys",
        body: [
          "A crypto wallet is controlled by a private key, often written as a 12- or 24-word recovery phrase. Whoever has the phrase controls the funds. On an exchange, the exchange holds the keys for you (custodial); with your own wallet, you do (self-custody).",
        ],
        bullets: [
          "Never share your recovery phrase with anyone, including 'support staff'.",
          "Store it offline; never in screenshots, email or cloud notes.",
        ],
      },
      {
        heading: "Common scams",
        bullets: [
          "Giveaways that ask you to send crypto first to receive more back.",
          "Fake support accounts that message you first and ask for codes or keys.",
          "Look-alike websites and links in ads or direct messages.",
          "Guaranteed-return schemes. In real markets, nothing is guaranteed.",
        ],
      },
      {
        heading: "Protect your NexChain account",
        body: [
          "Turn on two-factor authentication under Settings → Security. After that, signing in needs a code from an authenticator app on your phone as well as your password.",
        ],
        callout: { tone: "warn", text: "NexChain will never ask for your password, 2FA codes or a recovery phrase." },
      },
    ],
    cta: { label: "Open security settings", to: "/user/settings?tab=security" },
  },
];

// Roughly 220 words a minute, rounded up
export const readMinutes = (guide) => {
  const words = guide.sections
    .flatMap((s) => [s.heading, ...(s.body || []), ...(s.bullets || []), s.callout?.text])
    .filter(Boolean)
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
};
