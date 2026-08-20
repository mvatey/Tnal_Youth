export const ROLE_HOME_PATHS = {
  ADMIN: "/dashboard",
  SECRETARY: "/dashboard",
  BRANCH_LEADER: "/dashboard",
  MEMBER: "/activity",
};

export function getRoleHomePath(userOrRole) {
  const actual = typeof userOrRole === "object" ? userOrRole?.role : userOrRole;
  const scope = typeof userOrRole === "object" ? (userOrRole?.viewerScope || userOrRole?.viewer_scope) : null;
  const role = String(actual || "").toUpperCase() === "VIEWER"
    ? String(scope || "ADMIN").toUpperCase()
    : String(actual || "").toUpperCase();
  return ROLE_HOME_PATHS[role] || "/auth/login";
}
