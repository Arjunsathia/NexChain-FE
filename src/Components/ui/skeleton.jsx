import * as React from "react";
import { cn } from "@/utils/utils";

/** Theme-aware loading placeholder (colors come from the design tokens) */
function Skeleton({ className, ...props }) {
  return <div aria-hidden="true" className={cn("skeleton", className)} {...props} />;
}

/** A list of placeholder rows matching the dashboard list layout */
function SkeletonRows({ rows = 4, className }) {
  return (
    <div className={cn("divide-y divide-line", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2.5 w-14" />
          </div>
          <div className="space-y-1.5 flex flex-col items-end">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-2.5 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonRows };
