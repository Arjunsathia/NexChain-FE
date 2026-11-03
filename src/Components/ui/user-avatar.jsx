import * as React from "react";
import { getAvatarUrl } from "@/utils/avatar";

/** Profile photo, or the first letter of the name when there is none */
function UserAvatar({ user, size = 72 }) {
  const [failed, setFailed] = React.useState(false);
  const src = getAvatarUrl(user?.image);
  React.useEffect(() => setFailed(false), [src]);
  return src && !failed ? (
    <img src={src} alt="" onError={() => setFailed(true)} style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover ring-1 ring-line" />
  ) : (
    <span
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="grid shrink-0 place-items-center rounded-full bg-brand-soft font-semibold text-brand ring-1 ring-line"
    >
      {(user?.name || "?")[0].toUpperCase()}
    </span>
  );
}

export { UserAvatar };
