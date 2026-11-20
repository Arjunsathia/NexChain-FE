import { useState } from "react";
import { getAvatarUrl } from "@/utils/avatar";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";

/** Profile photo, or the user's initials when there is none */
export default function UserAvatar({ user, size = 32 }) {
  const [failed, setFailed] = useState(false);
  const src = getAvatarUrl(user?.image);
  return src && !failed ? (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover ring-1 ring-line"
    />
  ) : (
    <span
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand ring-1 ring-line"
    >
      {initials(user?.name)}
    </span>
  );
}
