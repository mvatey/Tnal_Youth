// Canonical wording for an activity's lifecycle status — the single
// source both the Activity list page's status filter
// (src/app/activity/page.js) and the Create/Edit form's status field
// (src/app/activity/create/page.js) pull from, so they can't drift apart
// again. The create form used to read straight from the backend's
// activity_statuses.label_km, which is worded differently for UPCOMING
// ("នឹងមកដល់") than the "ឆាប់ៗនេះ" used everywhere else in the app.
const CODES = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

const TRANSLATION_KEY = {
  UPCOMING: "activityPage.upcoming",
  ONGOING: "activityPage.ongoing",
  COMPLETED: "activityPage.completed",
  CANCELLED: "activityPage.cancelled",
};

export function activityStatusLabel(code, t) {
  const key = TRANSLATION_KEY[String(code || "").toUpperCase()];
  return key ? t(key) : undefined;
}

export function activityStatusLabelsByCode(t) {
  return Object.fromEntries(
    CODES.map((code) => [code, activityStatusLabel(code, t)]),
  );
}
