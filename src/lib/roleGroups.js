// lib/roleGroups.js
export function getSidebarVariant(role) {
  if (role === "admin") return "admin";
  if (role === "branch_leader" || role === "secretary") return "branch";
  return "member";
}

export function getDashboardVariant(role) {
  if (role === "admin") return "admin";
  if (role === "branch_leader" || role === "secretary") return "branch";
  return "member"; // or null, if members don't get a dashboard at all
}