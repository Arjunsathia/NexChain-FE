// Display metadata and permission rules for the admin Users section.

export const KYC_TONES = { verified: "up", pending: "warn", rejected: "down", unverified: "neutral" };
export const KYC_LABELS = { verified: "Verified", pending: "Pending review", rejected: "Rejected", unverified: "Not started" };

export const ROLE_LABELS = { user: "User", admin: "Admin", superadmin: "Super admin" };
export const ROLE_TONES = { user: "neutral", admin: "brand", superadmin: "violet" };

export const userId = (u) => u?.id || u?._id;

/** Archived > Frozen > Active */
export const userStatus = (u) => (u.isDeleted ? "archived" : u.isFrozen ? "frozen" : "active");
export const STATUS_META = {
  active: { label: "Active", tone: "up" },
  frozen: { label: "Frozen", tone: "down" },
  archived: { label: "Archived", tone: "neutral" },
};

/**
 * What the signed-in admin may do to a user. Mirrors updateUser in the API
 * (Controllers/userController.js), which enforces the same rules:
 * - nobody can change their own role or freeze/archive themselves
 * - another super admin's account can't be changed at all
 * - admins can switch user <-> admin, and freeze/archive regular users only
 * - super admins can assign any role and freeze/archive users and admins
 */
export function allowedActions(actor, target) {
  const none = { roles: [], freeze: false, archive: false, reason: null };
  if (!actor || !target) return none;
  if (userId(actor) === userId(target)) return { ...none, reason: "This is your own account." };
  if (target.role === "superadmin") return { ...none, reason: "Super admin accounts can only be changed by their owner." };

  if (actor.role === "superadmin") {
    const roles = ["user", "admin", "superadmin"].filter((r) => r !== target.role);
    return { roles, freeze: true, archive: true, reason: null };
  }
  if (actor.role === "admin") {
    const roles = target.role === "user" ? ["admin"] : ["user"];
    const manageable = target.role === "user";
    return {
      roles,
      freeze: manageable,
      archive: manageable,
      reason: manageable ? null : "Only super admins can freeze or archive other admins.",
    };
  }
  return none;
}
