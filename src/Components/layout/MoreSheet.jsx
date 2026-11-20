import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { ChevronRight, LogOut, Moon, Sun, X } from "lucide-react";
import useUserContext from "@/hooks/useUserContext";
import useRoleContext from "@/hooks/useRoleContext";
import { useTheme } from "@/hooks/useTheme";
import { formatUSD } from "@/utils/format";
import { cn } from "@/utils/utils";
import UserAvatar from "./UserAvatar";
import { BACKDROP, useSheetMotion } from "@/Components/ui/motion";
import { ACCOUNT_ITEMS, ADMIN_ITEM, NAV_GROUPS, profileItem } from "./navConfig";

// Pages the bottom tab bar doesn't already show
const DISCOVER = NAV_GROUPS.slice(1).flatMap((group) => group.items);
const DESCRIPTIONS = { "/news": "Market headlines", "/learning": "Trading guides" };

const iconBox = (active) =>
  cn("grid size-9 shrink-0 place-items-center rounded-lg", active ? "bg-brand text-brand-fg" : "bg-surface text-fg-muted ring-1 ring-line");

/** Discover: two wide cards with a one-line description */
function Tile({ item, active, onNavigate }) {
  const { to, label, icon: Icon } = item;
  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-16 items-center gap-3 rounded-xl border px-3 transition-colors",
        active ? "border-brand/40 bg-brand-soft" : "border-line bg-surface-2/50 hover:bg-surface-hover",
      )}
    >
      <span className={iconBox(active)}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className={cn("block text-sm font-semibold", active ? "text-brand" : "text-fg")}>{label}</span>
        {DESCRIPTIONS[to] && <span className="block truncate text-xs text-fg-subtle">{DESCRIPTIONS[to]}</span>}
      </span>
    </Link>
  );
}

/** Account: one row per page, like a settings list */
function Row({ item, active, onNavigate }) {
  const { to, label, icon: Icon } = item;
  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn("flex min-h-12 items-center gap-3 px-3 transition-colors", active ? "bg-brand-soft" : "hover:bg-surface-hover")}
    >
      <span className={iconBox(active)}>
        <Icon size={17} aria-hidden="true" />
      </span>
      <span className={cn("flex-1 text-sm font-medium", active ? "text-brand" : "text-fg")}>{label}</span>
      <ChevronRight size={16} className="text-fg-subtle" aria-hidden="true" />
    </Link>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-2xs font-semibold uppercase tracking-wider text-fg-subtle">{title}</h3>
      {children}
    </section>
  );
}

/**
 * Phones: the tab bar's "More" opens this bottom sheet with the remaining
 * pages, the theme switch and sign out. Swipe the handle down to close.
 */
export default function MoreSheet({ open, onClose, onSignOut }) {
  const { pathname } = useLocation();
  const { user } = useUserContext();
  const { isAdmin } = useRoleContext();
  const { isLight, toggleTheme } = useTheme();
  const balance = useSelector((state) => state.wallet.balance);
  const drag = useDragControls();
  const sheetMotion = useSheetMotion("bottom");

  const account = [...(user?.id ? [profileItem(user.id)] : []), ...ACCOUNT_ITEMS, ...(isAdmin ? [ADMIN_ITEM] : [])];
  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`);
  const setTheme = (light) => light !== isLight && toggleTheme();

  return (
    <AnimatePresence>
      {open && (
        <Dialog static open onClose={onClose} className="relative z-[var(--z-sheet)] sm:hidden">
          <motion.div
            className="fixed inset-0 bg-black/45"
            aria-hidden="true"
            {...BACKDROP}
          />
          {/* Headless UI's panel has its own "transition" prop, so the animated sheet sits inside it */}
          <DialogPanel className="fixed inset-x-0 bottom-0">
            <motion.div
              {...sheetMotion}
              drag="y"
              dragControls={drag}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.7 }}
              onDragEnd={(_, info) => (info.offset.y > 80 || info.velocity.y > 500) && onClose()}
              className="surface-panel flex max-h-[88dvh] flex-col overflow-hidden rounded-t-3xl border-t border-line bg-surface text-fg shadow-pop"
            >
              {/* Drag handle */}
              <div
                className="flex shrink-0 cursor-grab touch-none justify-center pt-2.5 pb-1 active:cursor-grabbing"
                onPointerDown={(e) => drag.start(e)}
                aria-hidden="true"
              >
                <span className="h-1 w-10 rounded-full bg-line-strong" />
              </div>

              <div className="flex shrink-0 items-center gap-3 px-5 pt-2 pb-4">
                {user?.id && <UserAvatar user={user} size={44} />}
                <div className="min-w-0 flex-1">
                  <DialogTitle className="truncate text-base font-semibold text-fg">{user?.name || "Menu"}</DialogTitle>
                  {Number.isFinite(balance) && (
                    <p className="tabular truncate text-xs text-fg-subtle">{formatUSD(balance)} available</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-fg-muted transition-colors hover:text-fg"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Section title="Discover">
                  <div className="grid grid-cols-2 gap-2">
                    {DISCOVER.map((item) => (
                      <Tile key={item.to} item={item} active={isActive(item.to)} onNavigate={onClose} />
                    ))}
                  </div>
                </Section>

                <Section title="Account">
                  <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-2/50">
                    {account.map((item) => (
                      <li key={item.to}>
                        <Row item={item} active={isActive(item.to)} onNavigate={onClose} />
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="Appearance">
                  <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2/60 p-1">
                    {[
                      { light: true, label: "Light", icon: Sun },
                      { light: false, label: "Dark", icon: Moon },
                    ].map(({ light, label, icon: Icon }) => {
                      const checked = isLight === light;
                      return (
                        <button
                          key={label}
                          type="button"
                          role="radio"
                          aria-checked={checked}
                          onClick={() => setTheme(light)}
                          className={cn(
                            "flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors",
                            checked ? "bg-surface text-fg shadow-card ring-1 ring-line" : "text-fg-muted hover:text-fg",
                          )}
                        >
                          <Icon size={16} aria-hidden="true" /> {label}
                        </button>
                      );
                    })}
                  </div>
                </Section>

                {user?.id && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-line text-sm font-semibold text-down transition-colors hover:bg-down-soft"
                  >
                    <LogOut size={16} aria-hidden="true" /> Sign out
                  </button>
                )}
              </div>
            </motion.div>
          </DialogPanel>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
