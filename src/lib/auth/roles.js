export const ROLE_HOME_PATHS = {
  ADMIN: "/dashboard",
  SECRETARY: "/dashboard",
  BRANCH_LEADER: "/dashboard",
  MEMBER: "/activity",
};

export function getRoleHomePath(role) {
  return ROLE_HOME_PATHS[role?.toUpperCase()] || "/login";
}