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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-medium text-fg-subtle">{today.format(new Date())}</p>
        <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-fg sm:text-2xl">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
      </div>
      <div className="flex gap-2">
        <Link
          to="/portfolio"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-fg transition-colors hover:bg-surface-hover sm:flex-none"
        >
          <Briefcase size={16} /> Portfolio
        </Link>
        <Link
          to="/cryptolist"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover sm:flex-none"
        >
          <ArrowLeftRight size={16} /> Trade
        </Link>
      </div>
    </div>
  );
}
