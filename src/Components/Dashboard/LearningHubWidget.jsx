import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Card } from "@/Components/ui/card";

/** Short pointer to the learning hub */
export default function LearningHubWidget() {
  return (
    <Card className="flex items-center gap-4 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
        <GraduationCap size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-fg">Learning hub</p>
        <p className="text-xs text-fg-subtle">Guides on order types, risk and reading charts.</p>
      </div>
      <Link
        to="/learning"
        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:bg-surface-hover"
      >
        Start <ArrowRight size={12} />
      </Link>
    </Card>
  );
}
