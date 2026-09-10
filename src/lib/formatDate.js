const MONTHS_KM = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Formats an ISO date/timestamp ("2026-09-19" or a full ISO timestamp) as
// "19 កញ្ញា 2026" (km) / "19 Sep 2026" (en). Returns "-" for a missing
// value and the original string unchanged if it isn't a recognizable ISO
// date (never silently hides a value the caller expected to show).
export function formatDateWithMonth(value, locale = "km") {
  if (!value) return "-";

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);

  const [, year, month, day] = match;
  const monthName = (locale === "en" ? MONTHS_EN : MONTHS_KM)[Number(month) - 1];

  if (!monthName) return String(value);

  return `${Number(day)} ${monthName} ${year}`;
}
