import { useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import {
  ArrowDown, ArrowLeftRight, ArrowUpRight, ChartNoAxesCombined,
  ChevronDown, Compass, Layers3, Menu, PieChart, Radar, X,
} from "lucide-react";
import useDemoLogin from "@/hooks/useDemoLogin";
import { useActiveSection, useReveal, useScrolled } from "@/hooks/useReveal";
import { DISCLAIMER } from "@/Components/layout/siteInfo";
import PublicBrand from "./PublicBrand";
import "./landing.css";

const navigation = [
  ["Simulator", "platform"],
  ["How it works", "how-it-works"],
  ["Learn", "learn"],
];
const sectionIds = navigation.map(([, id]) => id);

const tools = [
  { icon: Radar, title: "Follow the market", description: "Track crypto prices, create a watchlist, and set alerts for price levels you want to follow." },
  { icon: ArrowLeftRight, title: "Try different order types", description: "See how market, limit, stop, and OCO orders behave in a simulation." },
  { icon: Layers3, title: "Review your decisions", description: "Use your trade history and holdings to see how each practice trade affected your strategy." },
];

const steps = [
  ["Pick a market", "Open the demo or create an account. Choose a crypto pair you want to follow."],
  ["Place a practice order", "Decide when you want to enter or exit. Use virtual funds to put your idea to the test."],
  ["Review the outcome", "Check what filled, revisit your reasoning, and adjust your next trade."],
];

const guides = [
  { slug: "reading-price-charts", title: "Reading a price chart", topic: "Market basics", icon: ChartNoAxesCombined },
  { slug: "market-vs-limit-orders", title: "Market orders vs limit orders", topic: "Order types", icon: ArrowLeftRight },
  { slug: "position-sizing", title: "Position sizing and diversification", topic: "Risk management", icon: PieChart },
];

const faqs = [
  ["What is paper trading?", "Paper trading lets you practice buying and selling crypto using virtual funds. NexChain uses market prices to run the simulation. Simulated fills can differ from live execution."],
  ["What’s the difference between the demo and an account?", "The demo opens a temporary workspace without registration and expires after 24 hours. Create an account to keep your watchlist and practice history across sessions."],
  ["Where do prices come from?", "NexChain uses Binance market data. Prices can be delayed or unavailable if the provider connection is interrupted."],
  ["Can I deposit or withdraw money?", "NexChain uses virtual funds for simulated orders. There are no deposits, withdrawals, or real-money trades."],
];

function LandingHeader({ authenticated, start }) {
  const scrolled = useScrolled();
  const active = useActiveSection(sectionIds);
  const linkProps = (id) => ({ href: `#${id}`, "aria-current": active === id ? "true" : undefined });

  return (
    <Disclosure as="header" className={`nx-header${scrolled ? " is-scrolled" : ""}`}>
      {({ open, close }) => (
        <>
          <div className="nx-container nx-nav">
            <PublicBrand />
            <nav className="nx-desktop-nav" aria-label="Main navigation">
              {navigation.map(([label, id]) => <a key={id} {...linkProps(id)}>{label}</a>)}
            </nav>
            <div className="nx-nav-actions">
              {!authenticated && <Link className="nx-sign-in" to="/auth">Sign in</Link>}
              <Link className="nx-button nx-button-small" to={start}>
                {authenticated ? "Open app" : "Get started"} <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <DisclosureButton className="nx-menu" aria-label={open ? "Close navigation" : "Open navigation"}>
                {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
              </DisclosureButton>
            </div>
          </div>
          <DisclosurePanel as="nav" className="nx-mobile-nav" aria-label="Mobile navigation">
            <div className="nx-container">
              {navigation.map(([label, id]) => <a key={id} {...linkProps(id)} onClick={() => close()}>{label}</a>)}
              {!authenticated && <Link to="/auth" className="nx-button nx-button-outline" onClick={() => close()}>Sign in</Link>}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

export default function PublicLanding() {
  const authenticated = useSelector((state) => state.user.status === "authenticated");
  const { startDemo, loading: demoLoading } = useDemoLogin();
  const start = authenticated ? "/dashboard" : "/auth?mode=register";
  const rootRef = useRef(null);
  useReveal(rootRef);

  return (
    <div className="nx-landing" id="landing-top" ref={rootRef}>
      <a className="nx-skip nx-button" href="#landing-main">Skip to content</a>
      <LandingHeader authenticated={authenticated} start={start} />

      <main id="landing-main" tabIndex={-1}>
        <section className="nx-hero" aria-labelledby="hero-title">
          <div className="nx-container nx-hero-copy">
            <span className="nx-eyebrow nx-hero-kicker"><span aria-hidden="true" /> Crypto paper trading</span>
            <h1 id="hero-title">Learn to trade crypto<br /><span>by doing.</span></h1>
            <p>Practice with virtual funds, follow real market prices, and test your ideas in a trading simulator.</p>
            <div className="nx-actions">
              {authenticated ? (
                <Link to={start} className="nx-button">Open your workspace <ArrowUpRight size={17} aria-hidden="true" /></Link>
              ) : (
                <button type="button" className="nx-button" onClick={startDemo} disabled={demoLoading}>
                  {demoLoading ? "Preparing demo…" : "Try the demo"} <ArrowUpRight size={17} aria-hidden="true" />
                </button>
              )}
              <a href="#how-it-works" className="nx-button nx-button-outline">How it works <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
            {!authenticated && <p className="nx-hero-note">No deposit or registration required for the demo.</p>}
          </div>
          <div className="nx-hero-art" aria-hidden="true" />
        </section>

        <section className="nx-band" id="platform" aria-labelledby="platform-title">
          <div className="nx-container nx-section nx-split">
            <div data-reveal>
              <span className="nx-eyebrow">01 / The simulator</span>
              <h2 id="platform-title">A space to test your strategy.</h2>
              <p className="nx-intro">Try the tools you’d use in a crypto market while you build your own approach.</p>
            </div>
            <ul className="nx-tool-list" role="list">
              {tools.map(({ icon: Icon, title, description }, i) => (
                <li key={title} data-reveal style={{ "--i": i }}>
                  <span className="nx-tool-icon"><Icon size={22} aria-hidden="true" /></span>
                  <div><h3>{title}</h3><p>{description}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="nx-container nx-section nx-workflow" id="how-it-works" aria-labelledby="workflow-title">
          <div data-reveal>
            <span className="nx-eyebrow">02 / How it works</span>
            <h2 id="workflow-title">Your first practice trade.</h2>
          </div>
          <ol className="nx-steps" role="list">
            {steps.map(([title, description], index) => (
              <li key={title} data-reveal style={{ "--i": index }}>
                <span className="nx-step-number" aria-hidden="true">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="nx-container nx-learning" id="learn" aria-labelledby="learn-title">
          <div className="nx-learning-inner" data-reveal>
            <div className="nx-learning-heading">
              <div>
                <span className="nx-eyebrow">03 / Learning hub</span>
                <h2 id="learn-title">Get to know the basics.</h2>
              </div>
              <Link to="/public-learning" className="nx-text-link nx-text-link-desktop">All guides <ArrowUpRight size={17} aria-hidden="true" /></Link>
            </div>
            <ul className="nx-guides" role="list">
              {guides.map(({ slug, title, topic, icon: Icon }) => (
                <li key={slug}>
                  <Link to={`/public-learning/${slug}`}>
                    <span className="nx-guide-icon"><Icon size={20} aria-hidden="true" /></span>
                    <span className="nx-guide-text">
                      <span className="nx-eyebrow">{topic}</span>
                      <strong>{title}</strong>
                    </span>
                    <ArrowUpRight className="nx-guide-arrow" size={18} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/public-learning" className="nx-text-link nx-text-link-mobile">All guides <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </section>

        <section className="nx-band" id="faq" aria-labelledby="faq-title">
          <div className="nx-container nx-section nx-split nx-faq">
            <div data-reveal>
              <span className="nx-eyebrow">04 / FAQ</span>
              <h2 id="faq-title">Before you start.</h2>
            </div>
            <div className="nx-faq-list" data-reveal>
              {faqs.map(([question, answer]) => (
                <details key={question} name="nexchain-landing-faq">
                  <summary>{question}<span className="nx-faq-icon"><ChevronDown size={16} aria-hidden="true" /></span></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-final" aria-labelledby="final-title">
          <div className="nx-container nx-final-inner" data-reveal>
            <div>
              <span className="nx-eyebrow"><Compass size={15} aria-hidden="true" /> Your practice account</span>
              <h2 id="final-title">Put your first idea to the test.</h2>
            </div>
            <Link to={start} className="nx-button">
              {authenticated ? "Open your workspace" : "Create an account"} <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="nx-footer">
        <div className="nx-container">
          <div className="nx-footer-top">
            <PublicBrand />
            <nav aria-label="Footer navigation">
              <Link to="/public-learning">Learn</Link>
              <a href="#faq">FAQ</a>
              <Link to={authenticated ? start : "/auth"}>{authenticated ? "Open app" : "Sign in"}</Link>
            </nav>
          </div>
          <div className="nx-footer-bottom">
            <span>© {new Date().getFullYear()} NexChain</span>
            <p>{DISCLAIMER}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
