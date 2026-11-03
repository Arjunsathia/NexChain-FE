import React from "react";
import { useSearchParams } from "react-router-dom";
import { BellRing, IdCard, Info, Palette, ShieldCheck, UserRound } from "lucide-react";
import useUserContext from "@/hooks/useUserContext";
import ProfileSettings from "@/Components/Settings/ProfileSettings";
import SecuritySettings from "@/Components/Settings/SecuritySettings";
import KYCVerification from "@/Components/Settings/KYCVerification";
import AlertsSettings from "@/Components/Settings/AlertsSettings";
import PreferenceSettings from "@/Components/Settings/PreferenceSettings";
import AboutSettings from "@/Components/Settings/AboutSettings";
import { cn } from "@/utils/utils";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: UserRound, component: ProfileSettings },
  { id: "security", label: "Security", icon: ShieldCheck, component: SecuritySettings },
  { id: "identity", label: "Identity", icon: IdCard, component: KYCVerification },
  { id: "alerts", label: "Price alerts", icon: BellRing, component: AlertsSettings },
  { id: "appearance", label: "Appearance", icon: Palette, component: PreferenceSettings },
  { id: "about", label: "About", icon: Info, component: AboutSettings },
];

/** Account settings: a section list (tabs on phones) and the selected section */
export default function Settings() {
  const { user } = useUserContext();
  const [params, setParams] = useSearchParams();
  const active = SECTIONS.find((s) => s.id === params.get("tab")) || SECTIONS[0];
  const Section = active.component;
  // A section the user should look at gets a dot (2FA off, identity not verified)
  // Demo accounts can't fix either, so don't nag them
  const attention = user?.isDemo ? {} : {
    security: user?.id && !user.twoFactorEnabled,
    identity: user?.kycStatus === "rejected" || (user?.id && !user.kycStatus) || user?.kycStatus === "unverified",
  };

  const select = (id) => setParams(id === "profile" ? {} : { tab: id }, { replace: true });

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">Settings</h1>
        <p className="mt-0.5 text-sm text-fg-subtle">Manage your profile, security, identity and preferences.</p>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <nav aria-label="Settings sections" className="settings-navigation -mx-3 flex gap-1 overflow-x-auto px-3 no-scrollbar lg:sticky lg:top-[calc(var(--topbar-h)+24px)] lg:mx-0 lg:flex-col lg:px-0">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const selected = active.id === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => select(id)}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  selected ? "bg-surface text-fg shadow-card ring-1 ring-line lg:bg-brand-soft lg:text-brand lg:shadow-none lg:ring-0" : "text-fg-muted hover:bg-surface-hover hover:text-fg",
                )}
              >
                <Icon size={17} strokeWidth={1.9} />
                {label}
                {attention[id] && <span className="ml-auto size-1.5 rounded-full bg-warn" aria-label="Needs attention" />}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 max-w-3xl">
          <Section />
        </div>
      </div>
    </div>
  );
}
