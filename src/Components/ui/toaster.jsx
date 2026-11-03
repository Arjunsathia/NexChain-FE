import * as React from "react";
import { Toaster, ToastBar, toast } from "react-hot-toast";
import { CircleAlert, CircleCheck, Info, LoaderCircle, X } from "lucide-react";
import { cn } from "@/utils/utils";

// Icon and tint per toast type; custom icons (e.g. toast("…", { icon: "🔐" })) are kept
const TONES = {
  success: { Icon: CircleCheck, icon: "bg-up-soft text-up", bar: "bg-up" },
  error: { Icon: CircleAlert, icon: "bg-down-soft text-down", bar: "bg-down" },
  loading: { Icon: LoaderCircle, icon: "bg-brand-soft text-brand", bar: "bg-brand", spin: true },
  blank: { Icon: Info, icon: "bg-brand-soft text-brand", bar: "bg-brand" },
  custom: { Icon: Info, icon: "bg-brand-soft text-brand", bar: "bg-brand" },
};

const DURATION = { success: 3000, error: 4500, blank: 3500 };

/** App-wide toasts in the design-system palette, below the top bar */
function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerStyle={{ top: "calc(var(--topbar-h, 56px) + 10px)", right: 16, left: 16, bottom: 16, zIndex: 999999 }}
      toastOptions={{ duration: DURATION.blank, success: { duration: DURATION.success }, error: { duration: DURATION.error } }}
    >
      {(t) => (
        <ToastBar
          toast={t}
          style={{ padding: 0, background: "transparent", boxShadow: "none", maxWidth: 380, borderRadius: 12 }}
        >
          {({ message }) => {
            const tone = TONES[t.type] || TONES.blank;
            const custom = typeof t.icon === "string" || React.isValidElement(t.icon);
            return (
              <div
                className="group relative flex w-full min-w-[260px] items-start gap-3 overflow-hidden rounded-xl border border-line bg-surface py-3 pr-2 pl-3 text-fg shadow-pop"
              >
                <span className={cn("grid size-7 shrink-0 place-items-center rounded-full", tone.icon)} aria-hidden="true">
                  {custom ? (
                    <span className="text-sm leading-none">{t.icon}</span>
                  ) : (
                    <tone.Icon size={16} className={cn(tone.spin && "animate-spin")} />
                  )}
                </span>
                {/* react-hot-toast wraps the message in a div with its own margins */}
                <div className="min-w-0 flex-1 self-center text-sm leading-snug font-medium [&>div]:!m-0 [&>div]:!justify-start">
                  {message}
                </div>
                {t.type !== "loading" && (
                  <button
                    type="button"
                    onClick={() => toast.dismiss(t.id)}
                    aria-label="Dismiss"
                    className="grid size-7 shrink-0 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
                  >
                    <X size={14} />
                  </button>
                )}
                {t.type !== "loading" && t.visible && (
                  <span
                    aria-hidden="true"
                    className={cn("toast-progress absolute bottom-0 left-0 h-0.5 w-full origin-left opacity-60", tone.bar)}
                    style={{
                      animationDuration: `${t.duration ?? DURATION[t.type] ?? DURATION.blank}ms`,
                    }}
                  />
                )}
              </div>
            );
          }}
        </ToastBar>
      )}
    </Toaster>
  );
}

export { AppToaster };
