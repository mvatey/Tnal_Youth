// One colour per activity type, shared by the dashboard pie chart, the
// activity table and the dashboard activity lists so a type looks the same
// everywhere.
//
// The built-in types have fixed colours. A type added later on the variable
// page takes a colour from the palette by a stable hash of its code, so it
// keeps that colour from page to page and month to month.
const KNOWN_TYPE_COLORS = {
  INTERNAL: "#4B5FD9",
  EXTERNAL: "#22C55E",
  BRANCH_MEETING: "#F59E0B",
  GIFT_DISTRIBUTION: "#EC4899",
  FIELD_SUPPORT: "#06B6D4",
};

const EXTRA_TYPE_COLORS = [
  "#8B5CF6",
  "#EF4444",
  "#14B8A6",
  "#F97316",
  "#84CC16",
  "#0EA5E9",
  "#A855F7",
  "#D946EF",
  "#65A30D",
  "#E11D48",
];

function hashCode(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function activityTypeColor(code) {
  const key = String(code ?? "").trim().toUpperCase();

  if (!key) {
    return "#6B7280";
  }

  return (
    KNOWN_TYPE_COLORS[key] ??
    EXTRA_TYPE_COLORS[hashCode(key) % EXTRA_TYPE_COLORS.length]
  );
}

// A soft badge: the type's colour as a light tint behind darker text of the
// same hue, readable on both themes' cards.
export function activityTypeBadgeStyle(code) {
  const solid = activityTypeColor(code);

  return {
    background: `color-mix(in srgb, ${solid} 16%, transparent)`,
    color: `color-mix(in srgb, ${solid} 72%, var(--color-text-primary, #111827))`,
  };
}
