import React, { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Lightbulb, TriangleAlert, BookOpen } from "lucide-react";
import { CATEGORIES, GUIDES, readMinutes } from "@/content/learnGuides";
import useReadGuides from "@/hooks/useReadGuides";
import useLearnBase from "@/hooks/useLearnBase";
import { Card, EmptyState } from "@/Components/ui/card";
import { cn } from "@/utils/utils";

const categoryLabel = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));
const anchor = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function Callout({ tone, children }) {
  const warn = tone === "warn";
  const Icon = warn ? TriangleAlert : Lightbulb;
  return (
    <div className={cn("flex gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed", warn ? "border-warn/30 bg-warn/10" : "border-brand/25 bg-brand-soft")}>
      <Icon size={17} className={cn("mt-0.5 shrink-0", warn ? "text-warn" : "text-brand")} />
      <p className="text-fg">{children}</p>
    </div>
  );
}

/** One learning guide, marked as read once the reader reaches the end */
export default function LearnArticle() {
  const { slug } = useParams();
  const base = useLearnBase();
  const isPublic = base === "/public-learning";
  const { read, markRead } = useReadGuides();
  const endRef = useRef(null);

  const index = GUIDES.findIndex((g) => g.slug === slug);
  const guide = GUIDES[index];
  const prev = GUIDES[index - 1];
  const next = GUIDES[index + 1];

  // Read = the end of the guide is on screen and the reader either scrolled to
  // it or spent a while on the page (short guides can fit without scrolling)
  useEffect(() => {
    if (!guide || !endRef.current) return undefined;
    const openedAt = Date.now();
    let endVisible = false;
    const check = () => {
      if (endVisible && (window.scrollY > 150 || Date.now() - openedAt > 20000)) markRead(guide.slug);
    };
    const observer = new IntersectionObserver(([entry]) => {
      endVisible = entry.isIntersecting;
      check();
    });
    observer.observe(endRef.current);
    window.addEventListener("scroll", check, { passive: true });
    const timer = setInterval(check, 5000);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", check);
      clearInterval(timer);
    };
  }, [guide, markRead]);

  if (!guide) {
    return (
      <Card className="mx-auto max-w-xl">
        <EmptyState
          icon={BookOpen}
          title="Guide not found"
          description="It may have been renamed or removed."
          className="py-14"
          action={
            <Link to={base} className="mt-2 text-sm font-semibold text-brand hover:underline">
              Back to all guides
            </Link>
          }
        />
      </Card>
    );
  }

  const headings = guide.sections.filter((s) => s.heading).map((s) => s.heading);

  return (
    <div className="mx-auto grid max-w-[1200px] gap-8 px-3 py-4 sm:p-0 lg:grid-cols-[minmax(0,1fr)_220px]">
      <article className="min-w-0">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-fg-subtle">
          <Link to={base} className="hover:text-fg">
            Learn
          </Link>
          <span aria-hidden="true">/</span>
          <span>{categoryLabel[guide.category]}</span>
        </nav>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{guide.title}</h1>
        <p className="mt-2 text-base text-fg-muted">{guide.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line pb-5 text-xs text-fg-subtle">
          <span className="rounded bg-surface-2 px-1.5 py-0.5">{guide.level}</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} /> {readMinutes(guide)} min read
          </span>
          {read.has(guide.slug) && (
            <span className="inline-flex items-center gap-1 font-medium text-up">
              <CheckCircle2 size={14} /> Read
            </span>
          )}
        </div>

        <div className="mt-6 max-w-[68ch] space-y-7">
          {guide.sections.map((section, i) => (
            <section key={section.heading || i} className="space-y-3">
              {section.heading && (
                <h2 id={anchor(section.heading)} className="scroll-mt-24 text-lg font-semibold text-fg">
                  {section.heading}
                </h2>
              )}
              {section.body?.map((p) => (
                <p key={p.slice(0, 32)} className="text-[15px] leading-7 text-fg-muted">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="space-y-2 pl-1">
                  {section.bullets.map((b) => (
                    <li key={b.slice(0, 32)} className="flex gap-3 text-[15px] leading-7 text-fg-muted">
                      <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
              {section.callout && <Callout tone={section.callout.tone}>{section.callout.text}</Callout>}
            </section>
          ))}
        </div>

        <div ref={endRef} className="mt-8 max-w-[68ch]">
          <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-fg">{isPublic ? "Practise with $10,000 in virtual funds" : "Try it in NexChain"}</p>
              <p className="text-xs text-fg-subtle">
                {isPublic ? "Create a free account to put this guide into practice. No real money involved." : "Put this guide into practice with your virtual balance."}
              </p>
            </div>
            <Link
              to={isPublic ? "/auth" : guide.cta.to}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
            >
              {isPublic ? "Create free account" : guide.cta.label} <ArrowRight size={15} />
            </Link>
          </Card>
        </div>

        <nav aria-label="More guides" className="mt-6 grid max-w-[68ch] gap-3 sm:grid-cols-2">
          {prev ? (
            <Link to={`${base}/${prev.slug}`} className="group rounded-xl border border-line p-4 transition-colors hover:border-line-strong">
              <span className="inline-flex items-center gap-1 text-xs text-fg-subtle">
                <ArrowLeft size={13} /> Previous
              </span>
              <span className="mt-1 block text-sm font-semibold text-fg group-hover:text-brand">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`${base}/${next.slug}`} className="group rounded-xl border border-line p-4 text-right transition-colors hover:border-line-strong">
              <span className="inline-flex items-center gap-1 text-xs text-fg-subtle">
                Next <ArrowRight size={13} />
              </span>
              <span className="mt-1 block text-sm font-semibold text-fg group-hover:text-brand">{next.title}</span>
            </Link>
          )}
        </nav>
      </article>

      {headings.length > 1 && (
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--topbar-h)+24px)]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-subtle">On this page</p>
            <ul className="space-y-1.5 border-l border-line">
              {headings.map((h) => (
                <li key={h}>
                  <a href={`#${anchor(h)}`} className="-ml-px block border-l border-transparent pl-3 text-sm text-fg-muted hover:border-fg-subtle hover:text-fg">
                    {h}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}
