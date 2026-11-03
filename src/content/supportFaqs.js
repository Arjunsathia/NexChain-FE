// Help-centre answers. Keep them in line with what the app and API actually do.
export const FAQ_TOPICS = [
  { value: "all", label: "All" },
  { value: "trading", label: "Trading" },
  { value: "account", label: "Account" },
  { value: "security", label: "Security" },
  { value: "identity", label: "Identity" },
  { value: "data", label: "Market data" },
];

export const FAQS = [
  {
    topic: "trading",
    q: "Is any of this real money?",
    a: "No. NexChain is a paper-trading platform. Every account starts with $10,000 in virtual cash, trades carry no fees, and nothing can be deposited or withdrawn.",
  },
  {
    topic: "trading",
    q: "How do I buy or sell a coin?",
    a: "Press Trade next to any coin in Markets, or open the coin's page. You can place market, limit, stop and OCO orders. Orders that haven't filled yet are listed under Portfolio, where you can edit or cancel them.",
  },
  {
    topic: "trading",
    q: "Why can't I buy a particular coin?",
    a: "Admins can freeze a coin, for example while its data looks wrong. A frozen coin can't be bought, but you can still sell any amount you already hold.",
  },
  {
    topic: "trading",
    q: "How do price alerts work?",
    a: "Use the bell next to a coin to choose a target price. When the price crosses it you get a notification and an email, and the alert is then removed. See and delete active alerts in Settings → Price alerts.",
    link: { to: "/user/settings?tab=alerts", label: "Open price alerts" },
  },
  {
    topic: "account",
    q: "I forgot my password.",
    a: "Choose “Forgot password” on the sign-in page and we'll email you a link to set a new one. Accounts created with Google sign in through Google and don't have a NexChain password.",
  },
  {
    topic: "account",
    q: "How do I change my name, username, email or photo?",
    a: "Go to Settings → Profile. Changing your email asks for your current password. If you signed up with Google, your email stays tied to that Google account.",
    link: { to: "/user/settings", label: "Open profile settings" },
  },
  {
    topic: "security",
    q: "How do I turn on two-factor authentication?",
    a: "Go to Settings → Security and choose Set up. Scan the QR code with an authenticator app such as Google Authenticator or 1Password, then enter the 6-digit code to confirm.",
    link: { to: "/user/settings?tab=security", label: "Open security settings" },
  },
  {
    topic: "security",
    q: "I lost access to my authenticator app.",
    a: "If you're still signed in somewhere, turn 2FA off in Settings → Security with a current code, or send us a message below. An admin will confirm it's you before helping you regain access.",
  },
  {
    topic: "security",
    q: "I think someone else used my account.",
    a: "Change your password right away, then use “Sign out everywhere” in Settings → Security to end every session. Turn on two-factor authentication and message us with what you noticed.",
    link: { to: "/user/settings?tab=security", label: "Open security settings" },
  },
  {
    topic: "identity",
    q: "Do I need to verify my identity to trade?",
    a: "No. Trading works without verification. Verifying adds a badge to your account and lets us help faster with account recovery.",
  },
  {
    topic: "identity",
    q: "How does identity verification work?",
    a: "In Settings → Identity, enter your details and upload a photo or PDF of your ID (up to 5 MB). An admin reviews it and you get a notification with the result. If changes are needed you'll see the reason and can submit again.",
    link: { to: "/user/settings?tab=identity", label: "Open identity settings" },
  },
  {
    topic: "data",
    q: "Where do prices come from?",
    a: "Live prices and charts come from CoinGecko and Binance, and news headlines from CryptoCompare. Prices update in real time through Binance where a coin is listed there.",
  },
  {
    topic: "data",
    q: "Why do some numbers show “–” or look out of date?",
    a: "The free market-data providers limit how often we can ask for data. When that happens we keep showing the last values and refresh automatically a little later.",
  },
];
