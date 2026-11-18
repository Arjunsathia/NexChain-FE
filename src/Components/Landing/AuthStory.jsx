import ProductPreview from "./ProductPreview";

export default function AuthStory() {
  return <section className="auth-story" aria-label="About NexChain">
    <span className="public-eyebrow"><span className="public-status-dot" aria-hidden="true" /> Crypto paper trading</span>
    <h2>Practice trading.<br /><span>Without the risk.</span></h2>
    <p>Follow real market prices and place practice orders with virtual funds.</p>
    <ProductPreview compact />
  </section>;
}
