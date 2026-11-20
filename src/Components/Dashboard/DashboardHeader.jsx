import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftRight, Briefcase } from "lucide-react";
import useUserContext from "@/hooks/useUserContext";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const today = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });

export default function DashboardHeader() {
  const { user } = useUserContext();
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-fg-subtle">{today.format(new Date())}</p>
        <h1 className="mt-0.5 truncate text-xl font-semibold tracking-tight text-fg sm:text-2xl">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link
          to="/portfolio"
          className="hidden items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-fg transition-colors hover:bg-surface-hover sm:inline-flex"
        >
          <Briefcase size={16} /> Portfolio
        </Link>
        <Link
          to="/cryptolist"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-fg shadow-card transition-colors hover:bg-brand-hover sm:min-h-0 sm:rounded-lg sm:px-3.5 sm:py-2 sm:shadow-none"
        >
          <ArrowLeftRight size={16} /> Trade
        </Link>
      </div>
    </div>
  );
}
