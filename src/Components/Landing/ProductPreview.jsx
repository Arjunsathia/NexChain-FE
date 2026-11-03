import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ChevronDown, MoreHorizontal } from "lucide-react";

const chartPaths = {
  "1D": "M0 160L18 153L36 158L54 140L72 145L90 118L108 126L126 114L144 133L162 108L180 112L198 80L216 89L234 68L252 83L270 54L288 63L306 49L324 70L342 45L360 56L378 23L396 32L414 15L432 28L450 10L468 18L486 5",
  "1W": "M0 173L18 160L36 165L54 151L72 169L90 143L108 128L126 136L144 108L162 112L180 91L198 107L216 92L234 97L252 80L270 102L288 88L306 62L324 74L342 65L360 39L378 48L396 32L414 49L432 24L450 32L468 15L486 5",
  "1M": "M0 174L18 172L36 179L54 159L72 166L90 150L108 157L126 128L144 137L162 142L180 119L198 127L216 104L234 115L252 81L270 94L288 61L306 82L324 68L342 88L360 51L378 58L396 32L414 48L432 23L450 37L468 16L486 5",
};

/** Illustrative product UI. No simulated values are presented as live data. */
export default function ProductPreview({ compact = false }) {
  const [period, setPeriod] = useState("1W");
  return <div className={`product-preview showcase-card ${compact ? "product-preview-compact" : ""}`}>
    <div className="preview-toolbar"><span className="preview-window-dots" aria-hidden="true"><i /><i /><i /></span><span>nexchain / overview</span><span className="preview-demo">DEMO PREVIEW</span></div>
    <div className="preview-body">
      <div className="preview-account"><span className="preview-label">YOUR PRACTICE PORTFOLIO</span><span className="preview-account-select">USD <ChevronDown size={11} /></span></div>
      <div className="preview-balance"><span>$112,840<span>.50</span></span><span className="preview-gain"><ArrowUpRight size={13} /> 12.84%</span></div>
      <div className="preview-chart-heading"><span><span className="preview-chart-dot" /> Portfolio performance</span><div aria-label="Preview chart period" className="preview-periods">{Object.keys(chartPaths).map(p => <button key={p} type="button" onClick={() => setPeriod(p)} aria-pressed={period === p} className={period === p ? "is-active" : ""}>{p}</button>)}</div></div>
      <div className="preview-chart" aria-label={`Illustrative portfolio performance over ${period}`} role="img">
        <div className="preview-chart-labels"><span>115k</span><span>110k</span><span>105k</span><span>100k</span></div>
        <svg viewBox="0 0 490 200" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={compact ? "preview-fill-compact" : "preview-fill"} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8cbde8" stopOpacity=".22" /><stop offset="100%" stopColor="#8cbde8" stopOpacity="0" /></linearGradient></defs>{[15,65,115,165].map(y => <path key={y} d={`M0 ${y}H490`} stroke="#26303b" strokeDasharray="3 6" strokeWidth=".7" />)}<path key={period + "fill"} d={`${chartPaths[period]}V200H0Z`} fill={`url(#${compact ? "preview-fill-compact" : "preview-fill"})`} /><path key={period} className="preview-chart-line" d={chartPaths[period]} fill="none" stroke="#8cbde8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" /></svg>
      </div>
      <div className="preview-chart-dates"><span>Oct 20</span><span>Oct 22</span><span>Oct 24</span><span>Oct 26</span></div>
      {!compact && <>
        <div className="preview-holdings-title"><span>Your assets</span><MoreHorizontal size={17} /></div>
        <div className="preview-asset"><span className="preview-coin bitcoin">₿</span><span className="preview-asset-name">Bitcoin<small>BTC</small></span><span className="preview-asset-price">$68,250.00<small className="preview-positive">+2.40%</small></span><svg viewBox="0 0 80 26" aria-hidden="true"><path d="M1 24L10 17L18 21L25 12L34 17L43 8L51 12L61 5L69 8L79 1" fill="none" stroke="#8cbde8" strokeWidth="1.5" /></svg><span className="preview-asset-allocation">48.2%</span></div>
        <div className="preview-asset"><span className="preview-coin ethereum">Ξ</span><span className="preview-asset-name">Ethereum<small>ETH</small></span><span className="preview-asset-price">$3,520.00<small className="preview-positive">+1.28%</small></span><svg viewBox="0 0 80 26" aria-hidden="true"><path d="M1 22L10 18L18 23L25 16L34 18L43 10L51 16L61 7L69 12L79 4" fill="none" stroke="#8cbde8" strokeWidth="1.5" /></svg><span className="preview-asset-allocation">32.6%</span></div>
        <div className="preview-bottom"><span><ArrowDownLeft size={13} /> Virtual funds. Real market experience.</span><span className="preview-status"><i /> Practice mode</span></div>
      </>}
    </div>
  </div>;
}
