import * as React from "react";
import { Toaster, ToastBar, toast, useToasterStore } from "react-hot-toast";
import { CircleAlert, CircleCheck, Info, LoaderCircle, X } from "lucide-react";
import { cn } from "@/utils/utils";
import useMediaQuery from "@/hooks/useMediaQuery";

// Icon and tint per toast type; custom icons (e.g. toast("…", { icon: "🔐" })) are kept
const TONES = {
  success: { Icon: CircleCheck, icon: "bg-up-soft text-up", bar: "bg-up" },
  error: { Icon: CircleAlert, icon: "bg-down-soft text-down", bar: "bg-down" },
  loading: { Icon: LoaderCircle, icon: "bg-brand-soft text-brand", bar: "bg-brand", spin: true },
  blank: { Icon: Info, icon: "bg-brand-soft text-brand", bar: "bg-brand" },
  custom: { Icon: Info, icon: "bg-brand-soft text-brand", bar: "bg-brand" },
};

const DURATION = { success: 3000, error: 4500, blank: 3500 };
// Phones show at most two at once, so toasts never cover half the screen
const PHONE_LIMIT = 2;

/**
 * App-wide toasts in the design-system palette. Desktop: top right, below the top bar.
 * Phones: small pills centered at the top of the screen, over the top bar.
 */
function AppToaster() {
  const phone = useMediaQuery("(max-width: 639px)");
  const { toasts } = useToasterStore();

  React.useEffect(() => {
    if (!phone) return;
    toasts
      .filter((t) => t.visible)
      .slice(PHONE_LIMIT)
      .forEach((t) => toast.dismiss(t.id));
  }, [toasts, phone]);

  return (
    <Toaster
      position={phone ? "top-center" : "top-right"}
      gutter={phone ? 8 : 10}
      containerStyle={{
        top: phone ? "calc(env(safe-area-inset-top) + 8px)" : "calc(var(--topbar-h, 56px) + 8px)",
        right: phone ? 12 : 16,
        left: phone ? 12 : 16,
        bottom: 16,
        zIndex: 999999,
      }}
      toastOptions={{ duration: DURATION.blank, success: { duration: DURATION.success }, error: { duration: DURATION.error } }}
    >
      {(t) => (
        <ToastBar
          toast={t}
          style={{ padding: 0, background: "transparent", boxShadow: "none", maxWidth: phone ? "min(340px, calc(100vw - 32px))" : 380, borderRadius: phone ? 999 : 12 }}
        >
          {({ message }) => {
            const tone = TONES[t.type] || TONES.blank;
            const custom = typeof t.icon === "string" || React.isValidElement(t.icon);
            return (
              <div
                className="group relative flex w-full items-center gap-2 overflow-hidden rounded-full border border-line-strong bg-surface py-1.5 pr-1.5 pl-2 text-fg shadow-pop sm:min-w-[260px] sm:items-start sm:gap-3 sm:rounded-xl sm:border-line sm:py-3 sm:pr-2 sm:pl-3"
              >
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-full sm:size-7", tone.icon)} aria-hidden="true">
                  {custom ? (
                    <span className="text-sm leading-none">{t.icon}</span>
                  ) : (
                    <tone.Icon size={phone ? 14 : 16} className={cn(tone.spin && "animate-spin")} />
                  )}
                </span>
                {/* react-hot-toast wraps the message in a div with its own margins */}
                <div className="min-w-0 flex-1 self-center text-[13px] leading-snug font-medium sm:text-sm [&>div]:!m-0 [&>div]:!justify-start">
                  {message}
                </div>
                {t.type !== "loading" && (
                  <button
                    type="button"
                    onClick={() => toast.dismiss(t.id)}
                    aria-label="Dismiss"
                    className="tap-target grid size-6 shrink-0 place-items-center rounded-full sm:size-7 sm:rounded-md text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
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
