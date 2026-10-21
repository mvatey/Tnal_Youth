// Member statuses that behave like "inactive": the member leaves the lists
// and their login is turned off when the status is saved. RESIGNED and FIRED
// were added beside INACTIVE; they all work the same way.
export const INACTIVE_LIKE_STATUS_CODES = new Set([
  "INACTIVE",
  "RESIGNED",
  "FIRED",
]);

// The statuses offered when choosing a member's status (anything else a
// member already has is still shown for them -- see the callers).
export const SELECTABLE_STATUS_CODES = new Set([
  "ACTIVE",
  "INACTIVE",
  "RESIGNED",
  "FIRED",
]);

export function normalizeStatusCode(code) {
  return String(code || "").trim().toUpperCase();
}

export function isInactiveLikeStatus(code) {
  return INACTIVE_LIKE_STATUS_CODES.has(normalizeStatusCode(code));
}

// What saving this status does to the member's login: "enable" for ACTIVE,
// "disable" for every inactive-like status, nothing for the rest.
export function accountActionForStatus(code) {
  const normalized = normalizeStatusCode(code);

  if (normalized === "ACTIVE") return "enable";
  if (INACTIVE_LIKE_STATUS_CODES.has(normalized)) return "disable";

  return null;
}
