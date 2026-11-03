import React from "react";
import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import SettingsSection from "./SettingsSection";
import { cn } from "@/utils/utils";

const THEMES = [
  { value: "light", label: "Light", icon: Sun, preview: { bg: "#f5f3fc", card: "#ffffff", line: "#e2ddec", text: "#211c37" } },
  { value: "dark", label: "Dark", icon: Moon, preview: { bg: "#0c0b18", card: "#141225", line: "#302842", text: "#f1edf9" } },
];

/** Small mock of the app in a theme */
const Preview = ({ c }) => (
  <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border" style={{ background: c.bg, borderColor: c.line }}>
    <div className="flex h-full gap-1.5 p-2">
      <div className="w-1/5 rounded" style={{ background: c.card, border: `1px solid ${c.line}` }} />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-2 w-2/5 rounded-full" style={{ background: c.text, opacity: 0.7 }} />
        <div className="flex-1 rounded" style={{ background: c.card, border: `1px solid ${c.line}` }} />
        <div className="flex h-1/4 gap-1.5">
          <div className="flex-1 rounded" style={{ background: c.card, border: `1px solid ${c.line}` }} />
          <div className="flex-1 rounded" style={{ background: c.card, border: `1px solid ${c.line}` }} />
        </div>
      </div>
    </div>
  </div>
);

/** Appearance: light or dark theme (saved on this device) */
export default function PreferenceSettings() {
  const { isLight, toggleTheme } = useTheme();
  const current = isLight ? "light" : "dark";

  return (
    <SettingsSection title="Theme" description="Choose how NexChain looks. Saved on this device.">
      <div role="radiogroup" aria-label="Theme" className="grid max-w-lg grid-cols-2 gap-4">
        {THEMES.map(({ value, label, icon: Icon, preview }) => {
          const selected = current === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => !selected && toggleTheme()}
              className={cn(
                "rounded-xl border p-2.5 text-left transition-colors",
                selected ? "border-brand ring-2 ring-brand/20" : "border-line hover:border-line-strong",
              )}
            >
              <Preview c={preview} />
              <span className="mt-2.5 flex items-center justify-between px-0.5">
                <span className="flex items-center gap-2 text-sm font-medium text-fg">
                  <Icon size={15} /> {label}
                </span>
                {selected && (
                  <span className="grid size-5 place-items-center rounded-full bg-brand text-brand-fg">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </SettingsSection>
  );
}
