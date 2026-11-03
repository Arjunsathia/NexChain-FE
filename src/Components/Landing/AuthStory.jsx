import { ShieldCheck } from "lucide-react";
import ProductPreview from "./ProductPreview";

export default function AuthStory() {
  return <section className="auth-story" aria-label="Welcome to NexChain">
    <span className="public-eyebrow"><span className="public-status-dot" /> YOUR SPACE TO FIND YOUR EDGE.</span>
    <h2>Big ideas.<br />A little practice.<br /><span>Your next move.</span></h2>
    <p>A clear view of the markets. A place to test your thinking. Build your confidence, one trade at a time.</p>
    <ProductPreview compact />
    <p className="auth-story-caption"><ShieldCheck size={13} /> Real market experience. Virtual funds only.</p>
  </section>;
}
