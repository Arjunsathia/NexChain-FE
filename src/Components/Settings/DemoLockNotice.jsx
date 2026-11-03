import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import SettingsSection from "./SettingsSection";

/** Settings card shown instead of a feature that demo accounts can't use */
export default function DemoLockNotice({ title, description, children }) {
  return (
    <SettingsSection title={title} description={description}>
      <div className="flex items-start gap-3 rounded-lg border border-line bg-surface-2/60 p-4">
        <Lock size={17} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden="true" />
        <div className="text-sm text-fg-muted">
          {children || "This isn't available on demo accounts."}{" "}
          <Link to="/auth?mode=register" className="font-medium text-brand hover:underline">
            Create a free account
          </Link>{" "}
          to use it.
        </div>
      </div>
    </SettingsSection>
  );
}
