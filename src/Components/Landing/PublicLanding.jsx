import { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, BarChart3, Check, ChevronDown, Compass, Crosshair, FlaskConical, Layers3, Menu, ShieldCheck, Sparkles, Wallet, X } from "lucide-react";
import useDemoLogin from "@/hooks/useDemoLogin";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { useLivePrice } from "@/hooks/useBinanceTicker";
import { formatUSD } from "@/utils/format";
import PublicBrand from "./PublicBrand";
import ProductPreview from "./ProductPreview";
import HeroOrbit from "./HeroOrbit";
import { DISCLAIMER } from "@/Components/layout/siteInfo";

function Reveal({ children, className = "", id }) {
  const reduced = useReducedMotion();
  return <motion.div id={id} className={className} initial={reduced ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

const MarketTile = memo(function MarketTile({ id, name, symbol, mark, color }) {
  const price = useLivePrice(id, symbol);
  const change = price?.price_change_percentage_24h;
  return <div className="landing-market-tile"><span className="landing-market-icon" style={{ color }}>{mark}</span><div className="landing-market-name"><strong>{name}</strong><span>{symbol.toUpperCase()} / USD</span></div><div className="landing-market-price"><strong>{price?.current_price ? formatUSD(price.current_price) : "—"}</strong><span className={change == null ? "" : change >= 0 ? "market-positive" : "market-negative"}>{change == null ? "Waiting for feed" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`}</span></div></div>;
});

const features = [
  { icon: BarChart3, number: "01", title: "See the whole market.", description: "Follow live prices, explore market movements, and build a watchlist around the assets that matter to you.", tag: "MARKET INTELLIGENCE" },
  { icon: Crosshair, number: "02", title: "Put your ideas to work.", description: "Practice entries and exits with virtual funds. Place market and limit orders as your trading strategy takes shape.", tag: "PAPER TRADING" },
  { icon: Layers3, number: "03", title: "Know your next move.", description: "Bring holdings, allocation, performance, and trade history together in one clear portfolio workspace.", tag: "PORTFOLIO ANALYTICS" },
];
const faqs = [
  ["Is NexChain a real-money exchange?", "NexChain is a paper-trading simulator. Every balance, order, and trade uses virtual funds. You can practice with real market data without depositing money."],
  ["Where does the market data come from?", "NexChain uses market data from sources including Binance and CoinGecko. Prices update when the live feed is connected; availability and timing depend on the data providers."],
  ["Can I track my trading performance?", "Yes. The portfolio workspace brings together your holdings, allocation, performance, open orders, and transaction history so you can review your decisions."],
  ["Do I need trading experience to start?", "No. Start with virtual funds, explore the markets, and use the learning hub to build your understanding before trying a strategy."],
];

export default function PublicLanding() {
  const authenticated = useSelector(state => state.user.status === "authenticated");
  const [openFaq, setOpenFaq] = useState(null);
  const heroSentinel = useRef(null);
  const [headerRaised, setHeaderRaised] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setHeaderRaised(!entry.isIntersecting));
    if (heroSentinel.current) observer.observe(heroSentinel.current);
    return () => observer.disconnect();
  }, []);
  const start = authenticated ? "/dashboard" : "/auth?mode=register";
  const { startDemo, loading: demoLoading } = useDemoLogin();
  return <div className="landing-page">
    <div className="landing-starfield" aria-hidden="true"><span /><span /><span /></div>
    <span ref={heroSentinel} className="landing-top-sentinel" aria-hidden="true" /><a href="#landing-main" className="public-skip-link">Skip to content</a>
    <Disclosure as="header" className="landing-header" data-raised={headerRaised}>{({ open, close }) => <>
      <div className="landing-nav public-container"><PublicBrand /><nav aria-label="Main navigation" className="landing-desktop-nav"><a href="#platform">Platform</a><a href="#markets">Markets</a><a href="#how-it-works">How it works</a><Link to="/public-learning">Learn <ArrowUpRight size={12} /></Link></nav><div className="landing-nav-actions"><Link className="landing-sign-in" to="/auth">Sign in</Link><Link to={start} className="public-button public-button-small">{authenticated ? "Dashboard" : "Get started"}<ArrowUpRight size={15} /></Link><DisclosureButton className="landing-menu-button" aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X size={21} /> : <Menu size={21} />}</DisclosureButton></div></div>
      <DisclosurePanel as="nav" aria-label="Mobile navigation" className="landing-mobile-nav public-container">{[["Platform", "#platform"],["Markets", "#markets"],["How it works", "#how-it-works"]].map(([label,href]) => <a key={href} href={href} onClick={() => close()}>{label}<ArrowUpRight size={15} /></a>)}<Link to="/public-learning" onClick={() => close()}>Learning hub<ArrowUpRight size={15} /></Link><Link to="/auth" onClick={() => close()}>Sign in<ArrowRight size={15} /></Link></DisclosurePanel>
    </>}</Disclosure>

    <main id="landing-main">
      <section className="landing-hero public-container">
        <Reveal className="landing-hero-copy"><span className="public-eyebrow"><span className="public-status-dot" /> REAL MARKETS. A NEW PERSPECTIVE.</span><h1>A sharper perspective.<br /><span>A stronger next move.</span></h1><p className="landing-hero-description">Your space to understand crypto, test your strategy, and grow as a trader. All the market experience. None of the financial risk.</p><div className="landing-hero-actions"><Link to={start} className="public-button">{authenticated ? "Open dashboard" : "Start practicing"}<ArrowUpRight size={18} /></Link>{authenticated ? <a href="#platform" className="public-button public-button-outline">Explore platform<ArrowRight size={16} /></a> : <button type="button" onClick={startDemo} disabled={demoLoading} className="public-button public-button-outline landing-demo-button"><FlaskConical size={16} />{demoLoading ? "Preparing demo…" : "Try the demo"}</button>}</div><p className="landing-hero-note"><Check size={14} /> Virtual funds included <span /> No deposit required</p></Reveal>
        <div className="landing-hero-orbit"><HeroOrbit /></div>
      </section>

      <section className="landing-market-band" id="markets" aria-label="Live market prices"><div className="public-container"><div className="landing-market-intro"><span className="public-eyebrow">THE MARKET NEVER STANDS STILL</span><span>Live prices · 24h change</span></div><div className="landing-market-grid"><MarketTile id="bitcoin" name="Bitcoin" symbol="btc" mark="₿" color="#f4b66b" /><MarketTile id="ethereum" name="Ethereum" symbol="eth" mark="Ξ" color="#b4c3ed" /><MarketTile id="solana" name="Solana" symbol="sol" mark="◎" color="#b3a2f7" /><MarketTile id="chainlink" name="Chainlink" symbol="link" mark="⬡" color="#80b5ff" /></div></div></section>

      <section className="public-container landing-terminal-section"><Reveal className="landing-terminal-copy"><span className="public-eyebrow">YOUR WORKSPACE. YOUR NEW PERSPECTIVE.</span><h2>A clear view.<br /><span>From every angle.</span></h2><p>Bring your trading ideas into focus with a workspace built around you. Explore live markets, practice with virtual capital, and make sense of every decision.</p><Link to={start} className="public-text-link">Find your workspace<ArrowUpRight size={16} /></Link><div className="landing-terminal-stamp"><ShieldCheck size={17} /><span>REAL MARKETS · VIRTUAL CAPITAL</span></div></Reveal><Reveal className="landing-terminal-preview"><ProductPreview /><p>Illustrative portfolio · Practice mode</p></Reveal></section>

      <section className="landing-section public-container" id="platform"><Reveal className="landing-section-heading"><div><span className="public-eyebrow">A CLEARER VIEW. A STRONGER STRATEGY.</span><h2>Serious tools.<br /><span>Room to experiment.</span></h2></div><p>From your first watchlist to a strategy of your own. Everything you need to turn market curiosity into informed decisions.</p></Reveal><div className="landing-feature-grid">{features.map(({icon:Icon,number,title,description,tag}) => <Reveal key={number} className="landing-feature-card"><div className="landing-feature-top"><span className="landing-feature-icon"><Icon size={23} strokeWidth={1.5} /></span><span>{number}</span></div><span className="landing-feature-tag">{tag}</span><h3>{title}</h3><p>{description}</p><Link to={start} aria-label={`Explore ${tag.toLowerCase()}`} className="landing-feature-link">Explore feature<ArrowUpRight size={16} /></Link></Reveal>)}</div></section>

      <section className="landing-workflow-section" id="how-it-works"><div className="public-container landing-workflow"><Reveal className="landing-workflow-copy"><span className="public-eyebrow">LESS GUESSWORK. MORE EXPERIENCE.</span><h2>Your learning curve.<br /><span>Meet your workspace.</span></h2><p>Markets move fast. Give yourself the space to slow down, learn the tools, and build a process you can trust.</p><div className="landing-steps">{[["01","Make yourself at home","Create your account and step into your personal trading workspace."],["02","Find your focus","Explore assets, build a watchlist, and follow the market in real time."],["03","Practice. Review. Repeat.","Trade with virtual funds, review your portfolio, and refine your approach."]].map(([n,title,body]) => <div key={n} className="landing-step"><span>{n}</span><div><h3>{title}</h3><p>{body}</p></div></div>)}</div><Link to={start} className="public-text-link">Create your workspace<ArrowRight size={17} /></Link></Reveal><Reveal className="landing-strategy-card showcase-card"><div className="landing-strategy-top"><span><Compass size={18} /> A little more perspective.</span><Sparkles size={18} /></div><div className="landing-allocation-visual"><div className="landing-allocation-ring"><div><span>YOUR PORTFOLIO</span><strong>See the<br />bigger picture.</strong></div></div><span className="landing-allocation-orbit orbit-one">BTC <b>48%</b></span><span className="landing-allocation-orbit orbit-two">ETH <b>33%</b></span><span className="landing-allocation-orbit orbit-three">OTHER <b>19%</b></span></div><div className="landing-strategy-bottom"><Wallet size={20} /><div><strong>Every decision tells a story.</strong><p>Understand your allocation. Find your balance.</p></div></div><span className="landing-illustration-label">Illustrative allocation</span></Reveal></div></section>

      <section className="landing-section public-container landing-learning"><Reveal><div className="landing-learning-art showcase-card" aria-hidden="true"><span className="learning-art-line" /><span className="learning-art-line" /><span className="learning-art-line" /><span className="learning-art-number">N<span>↗</span></span><span className="learning-art-caption">THE NEXT CHAPTER<br />IS YOURS TO WRITE.</span></div></Reveal><Reveal className="landing-learning-copy"><span className="public-eyebrow">KNOWLEDGE IS YOUR FIRST ASSET.</span><h2>Stay curious.<br /><span>Get a little sharper.</span></h2><p>Build your understanding one idea at a time. Explore guides on crypto fundamentals, trading concepts, and making sense of the market.</p><Link to="/public-learning" className="public-button public-button-outline">Visit the learning hub<ArrowUpRight size={17} /></Link><div className="landing-learning-topics"><span>Crypto fundamentals</span><span>Trading essentials</span><span>Risk & strategy</span></div></Reveal></section>

      <section className="landing-faq public-container"><Reveal className="landing-faq-heading"><span className="public-eyebrow">GOOD QUESTIONS. CLEAR ANSWERS.</span><h2>A few things<br /><span>you might be wondering.</span></h2></Reveal><div className="landing-faq-list">{faqs.map(([q,a],i) => <div key={q} className="landing-faq-item"><h3><button type="button" aria-expanded={openFaq === i} aria-controls={`landing-faq-${i}`} id={`landing-faq-button-${i}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>{q}<ChevronDown size={18} className={openFaq === i ? "is-open" : ""} /></button></h3><div id={`landing-faq-${i}`} role="region" aria-labelledby={`landing-faq-button-${i}`} hidden={openFaq !== i}><p>{a}</p></div></div>)}</div></section>

      <section className="public-container landing-final-section"><Reveal className="landing-final-cta showcase-card"><div className="landing-cta-grid" aria-hidden="true" /><span className="public-eyebrow">YOUR NEXT MOVE STARTS HERE.</span><h2>A little practice.<br /><span>A whole new perspective.</span></h2><p>Explore the markets. Find your rhythm. Make progress.</p><div className="landing-final-actions"><Link to={start} className="public-button">{authenticated ? "Go to dashboard" : "Create your free account"}<ArrowUpRight size={18} /></Link>{!authenticated && <button type="button" onClick={startDemo} disabled={demoLoading} className="public-button public-button-outline landing-demo-button"><FlaskConical size={17} />{demoLoading ? "Preparing demo…" : "Try the demo first"}</button>}</div><span className="landing-final-note">No deposit. No real-money trades. Just possibilities.</span></Reveal></section>
    </main>
    <footer className="landing-footer public-container"><div className="landing-footer-top"><div><PublicBrand /><p>A better place to practice.<br />A clearer path forward.</p></div><nav aria-label="Footer product navigation"><span>PLATFORM</span><a href="#platform">Features</a><a href="#markets">Market overview</a><Link to="/public-learning">Learning hub</Link></nav><nav aria-label="Footer account navigation"><span>YOUR WORKSPACE</span><Link to="/auth">Sign in</Link><Link to={start}>Get started</Link><a href="#how-it-works">How it works</a></nav><div className="landing-footer-message"><span className="public-status-dot" /> Built for your next chapter.</div></div><div className="landing-footer-bottom"><span>© {new Date().getFullYear()} NexChain</span><p>{DISCLAIMER}</p><a href="#landing-main">Back to top ↑</a></div></footer>
  </div>;
}
