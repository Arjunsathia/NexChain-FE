import React from "react";
import { Link } from "react-router-dom";
import { Info, Database, LifeBuoy, ArrowRight } from "lucide-react";
import { DISCLAIMER, DATA_SOURCES } from "@/Components/layout/siteInfo";
import SettingsSection from "./SettingsSection";

const Row = ({ icon: Icon, title, children }) => (
  <div className="flex gap-4 py-4 first:pt-0 last:pb-0">
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-fg-muted">
      <Icon size={17} />
    </span>
    <div className="min-w-0">
      <h3 className="text-sm font-semibold text-fg">{title}</h3>
      <div className="mt-1 text-sm leading-relaxed text-fg-muted">{children}</div>
    </div>
  </div>
);

/** Product information that a public site would keep in its footer */
export default function AboutSettings() {
  return (
    <SettingsSection title="About NexChain" description="How the platform works, where data comes from, and where to get help." footerHint={`© ${new Date().getFullYear()} NexChain`} footer={<span />}>
      <div className="divide-y divide-line">
        <Row icon={Info} title="Paper trading only">
          {DISCLAIMER} Every account starts with $10,000 in virtual cash, and trades carry no fees.
        </Row>
        <Row icon={Database} title="Market data">
          Live prices and charts come from {DATA_SOURCES.slice(0, 2).join(" and ")}; news headlines come from {DATA_SOURCES[2]}. Data can be
          delayed or briefly unavailable when a provider limits requests.
        </Row>
        <Row icon={LifeBuoy} title="Help">
          Questions or a problem with your account?
          <Link to="/user/support" className="ml-1 inline-flex items-center gap-1 font-medium text-brand hover:underline">
            Contact support <ArrowRight size={13} />
          </Link>
        </Row>
      </div>
    </SettingsSection>
  );
}
