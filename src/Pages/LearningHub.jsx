import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useLearnBase from "@/hooks/useLearnBase";
import { ArrowRight, BookOpen, CheckCircle2, Clock, GraduationCap, SearchX } from "lucide-react";
import { CATEGORIES, GUIDES, readMinutes } from "@/content/learnGuides";
import useReadGuides from "@/hooks/useReadGuides";
import { Card, EmptyState } from "@/Components/ui/card";
import { Segmented } from "@/Components/ui/segmented";
import { SearchInput } from "@/Components/ui/table";
import { cn } from "@/utils/utils";

const categoryLabel = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));
const FILTERS = [{ value: "all", label: "All" }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.label }))];

function GuideCard({ guide, base, done }) {
  return (
    <Link
      to={`${base}/${guide.slug}`}
      className="group flex h-full flex-col rounded-xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-line-strong"
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-brand">{categoryLabel[guide.category]}</span>
        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-fg-subtle">{guide.level}</span>
      </div>
      <h3 className="mt-2 text-[15px] font-semibold leading-snug text-fg group-hover:text-brand">{guide.title}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-fg-muted">{guide.summary}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-fg-subtle">
        <span className="inline-flex items-center gap-1.5">
          <Clock size={13} /> {readMinutes(guide)} min read
        </span>
        {done ? (
          <span className="inline-flex items-center gap-1 font-medium text-up">
            <CheckCircle2 size={14} /> Read
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-medium text-fg-muted group-hover:text-brand">
            Read <ArrowRight size={13} />
          </span>
        )}
      </div>
    </Link>
  );
}

/** Learning hub: practical guides grouped by topic, with reading progress */
export default function LearningHub() {
  const base = useLearnBase();
  const { read } = useReadGuides();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUIDES.filter(
      (g) =>
        (filter === "all" || g.category === filter) &&
        (!q || g.title.toLowerCase().includes(q) || g.summary.toLowerCase().includes(q)),
    );
  }, [filter, query]);

  const doneCount = GUIDES.filter((g) => read.has(g.slug)).length;
  const next = GUIDES.find((g) => !read.has(g.slug));
  const grouped = filter === "all" && !query.trim();

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-3 py-4 sm:p-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">Learn</h1>
          <p className="mt-0.5 max-w-xl text-sm text-fg-subtle">
            Short, practical guides to trading and staying safe, written for how NexChain works.
          </p>
        </div>
        <div className="w-full sm:w-56" aria-label={`${doneCount} of ${GUIDES.length} guides read`}>
          <div className="flex justify-between text-xs">
            <span className="text-fg-muted">Your progress</span>
            <span className="tabular font-medium text-fg">
              {doneCount}/{GUIDES.length} read
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-up transition-[width] duration-500" style={{ width: `${(doneCount / GUIDES.length) * 100}%` }} />
          </div>
        </div>
      </header>

      {grouped && next && (
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
            {doneCount === 0 ? <GraduationCap size={24} /> : <BookOpen size={22} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">{doneCount === 0 ? "Start here" : "Up next"}</p>
            <h2 className="mt-1 text-lg font-semibold text-fg">{next.title}</h2>
            <p className="mt-0.5 text-sm text-fg-muted">
              {next.summary} · {readMinutes(next)} min read
            </p>
          </div>
          <Link
            to={`${base}/${next.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
          >
            {doneCount === 0 ? "Start reading" : "Continue"} <ArrowRight size={16} />
          </Link>
        </Card>
      )}

      {grouped && !next && (
        <Card className="flex items-center gap-4 p-5">
          <CheckCircle2 size={28} className="shrink-0 text-up" />
          <p className="text-sm text-fg">
            You&apos;ve read every guide. Put it into practice on the{" "}
            <Link to={base === "/learning" ? "/cryptolist" : "/auth"} className="font-semibold text-brand hover:underline">
              markets
            </Link>
            .
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Segmented label="Topic" options={FILTERS} value={filter} onChange={setFilter} className="max-w-full overflow-x-auto no-scrollbar [&>button]:whitespace-nowrap" />
        <SearchInput value={query} onChange={setQuery} placeholder="Search guides" className="md:w-64" />
      </div>

      {results.length === 0 ? (
        <Card>
          <EmptyState icon={SearchX} title="No guides match" description="Try a different word or topic." className="py-14" />
        </Card>
      ) : grouped ? (
        CATEGORIES.map((category) => {
          const guides = results.filter((g) => g.category === category.id);
          const done = guides.filter((g) => read.has(g.slug)).length;
          return (
            <section key={category.id} aria-labelledby={`cat-${category.id}`}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 id={`cat-${category.id}`} className="text-sm font-semibold text-fg">
                  {category.label}
                </h2>
                <span className={cn("tabular text-xs", done === guides.length ? "text-up" : "text-fg-subtle")}>
                  {done}/{guides.length} read
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {guides.map((g) => (
                  <GuideCard key={g.slug} guide={g} base={base} done={read.has(g.slug)} />
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {results.map((g) => (
            <GuideCard key={g.slug} guide={g} base={base} done={read.has(g.slug)} />
          ))}
        </div>
      )}
    </div>
  );
}
