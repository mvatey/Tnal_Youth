/*
 * Shared predicate for the DataTable "daterange" filter type -- takes
 * whatever raw date/datetime value a row carries (ISO datetime, plain
 * YYYY-MM-DD, or empty/null) and checks it against a { from, to } range
 * of ISO date strings, either side of which may be blank (open-ended).
 */
export function isWithinDateRange(rawValue, range) {
  const from = range?.from || "";
  const to = range?.to || "";

  if (!from && !to) {
    return true;
  }

  if (!rawValue) {
    return false;
  }

  const datePart = String(rawValue).slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return false;
  }

  if (from && datePart < from) {
    return false;
  }

  if (to && datePart > to) {
    return false;
  }

  return true;
}
