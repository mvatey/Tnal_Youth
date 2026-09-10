// Formats an ISO date/timestamp ("2026-09-19" or a full ISO timestamp) as
// dd-mm-yyyy for display. Returns "-" for a missing value and the original
// string unchanged if it isn't a recognizable ISO date (never silently
// hides a value the caller expected to show).
export function formatDateDMY(value) {
  if (!value) return "-";

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);

  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}
