"use client";

import { useState, useEffect, useCallback } from "react";
import dashboardActivities from "@/data/dashboard/activityLists.json";

// ---- DATA LAYER ----
// Imported directly since data now lives under src/ (not browser-
// fetchable). Kept as `async function` so downstream loading logic
// doesn't need to change. Swap for a real fetch() call once the
// backend endpoint exists.
async function fetchActivities() {
  return dashboardActivities ?? [];
}
// --------------------------------------------------------------------

const TYPE_BADGE = {
  internal: { label: "កម្មវិធីខាងក្នុង", color: "#6D5BD0", tint: "#F1EEFC" },
  external: { label: "កម្មវិធីខាងក្រៅ", color: "#2FA36B", tint: "#E9F9F1" },
};

function TypeBadge({ type }) {
  const cfg = TYPE_BADGE[type] ?? { label: type, color: "#6B7280", tint: "#F1F2F5" };
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 400,
        color: cfg.color,
        background: cfg.tint,
        borderRadius: 6,
        padding: "2px 7px",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

// Both completed and upcoming activities now render as the same
// rectangular photo thumbnail. Falls back to a neutral placeholder
// image (no colored tint, no icon) when `activity.image` isn't set yet
// — e.g. upcoming activities per the current API contract.
function ActivityThumbnail({ activity }) {
  return (
    <img
      src={activity.image || "/dashboard/activity-placeholder.jpg"}
      alt=""
      style={{
        width: 64,
        height: 44,
        borderRadius: 8,
        objectFit: "cover",
        flexShrink: 0,
        background: "#F1F2F5",
      }}
    />
  );
}

// Manages its own hover state so "មើលទាំងអស់" darkens on hover — plain
// inline styles can't express :hover, so this tracks it in state.
function ViewMoreLink() {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        fontSize: 11,
        color: isHovered ? "#4A3AA8" : "#6D5BD0",
        textDecoration: "underline",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        fontFamily: "inherit",
      }}
    >
      មើលទាំងអស់
    </button>
  );
}

function ActivityRow({ activity }) {
  const isCompleted = activity.status === "completed";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 0",
        borderBottom: "1px solid #F2F3F5",
      }}
    >
      <ActivityThumbnail activity={activity} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#232629",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {activity.title}
          </span>
          <TypeBadge type={activity.type} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
          <span style={{ fontSize: 10, color: "#9AA0A8" }}>
            {activity.date}
            {!isCompleted && activity.time ? `  -  ${activity.time}` : ""}
          </span>
          {isCompleted ? (
            <span style={{ fontSize: 10, color: "#9AA0A8" }}>
              អ្នកចូលរួមសរុប {activity.attendeeCount}នាក់
            </span>
          ) : (
            <button
              style={{
                fontSize: 10,
                color: "#6D5BD0",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Exported so it can be placed as a standalone grid item (see
// RecentActivities / UpcomingActivities below) instead of always being
// paired inside a fixed flex row — that's what lets it become an exact
// 1fr grid column, same width as the QuickActions/PerformanceSummary
// column beside it.
export function ActivityListCard({ title, activities, isLoading }) {
  return (
    <div
      className="app-card"
      style={{
        background: "#FFFFFF",
        border: "1px solid #EEF0F3",
        borderRadius: 14,
        padding: "16px",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#232629" }}>{title}</h3>
        <ViewMoreLink />
      </div>

      {isLoading ? (
        <div style={{ padding: "12px 0" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                padding: "7px 0",
                borderBottom: "1px solid #F2F3F5",
              }}
            >
              <div style={{ width: 64, height: 44, borderRadius: 8, background: "#F1F2F5", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: "60%", height: 9, borderRadius: 4, background: "#F1F2F5", marginBottom: 6 }} />
                <div style={{ width: "40%", height: 7, borderRadius: 4, background: "#F1F2F5" }} />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div style={{ padding: "18px 0", textAlign: "center", fontSize: 11, color: "#9AA0A8" }}>
          មិនទាន់មានកម្មវិធីទេ
        </div>
      ) : (
        activities.map((a) => <ActivityRow key={a.id} activity={a} />)
      )}
    </div>
  );
}

// Shared fetch + derive logic. Each of RecentActivities/UpcomingActivities
// calls this independently — cheap, since it's reading a local JSON
// import rather than hitting the network, and it keeps each card fully
// self-contained so the page can place them as independent grid items.
function useActivityLists() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchActivities()
      .then((res) => {
        setActivities(res);
        setIsLoading(false);
      })
      .catch(() => {
        setError("មិនអាចទាញយកទិន្នន័យបានទេ");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const completed = activities.filter((a) => a.status === "completed").slice(0, 5);
  const upcoming = activities.filter((a) => a.status === "upcoming").slice(0, 5);

  return { completed, upcoming, isLoading, error };
}

export function RecentActivities() {
  const { completed, isLoading, error } = useActivityLists();
  if (error) {
    return (
      <div style={{ padding: "20px 0", textAlign: "center", color: "#B3261E", fontSize: 13 }}>
        {error}
      </div>
    );
  }
  return <ActivityListCard title="កម្មវិធីថ្មីៗ" activities={completed} isLoading={isLoading} />;
}

export function UpcomingActivities() {
  const { upcoming, isLoading, error } = useActivityLists();
  if (error) {
    return (
      <div style={{ padding: "20px 0", textAlign: "center", color: "#B3261E", fontSize: 13 }}>
        {error}
      </div>
    );
  }
  return <ActivityListCard title="កម្មវិធីបន្ទាប់" activities={upcoming} isLoading={isLoading} />;
}

// Kept as the default export for backwards compatibility — renders both
// cards side by side in a flex row. Prefer RecentActivities +
// UpcomingActivities placed as separate grid items when exact equal-width
// columns matter (e.g. next to QuickActions/PerformanceSummary).
export default function ActivityList() {
  const { completed, upcoming, isLoading, error } = useActivityLists();

  if (error) {
    return (
      <div style={{ padding: "20px 0", textAlign: "center", color: "#B3261E", fontSize: 13 }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <ActivityListCard title="កម្មវិធីថ្មីៗ" activities={completed} isLoading={isLoading} />
      <ActivityListCard title="កម្មវិធីបន្ទាប់" activities={upcoming} isLoading={isLoading} />
    </div>
  );
}


/**
 * ActivityLists
 * --------------
 * Renders the "កម្មវិធីថ្មីៗ" (recent) and "កម្មវិធីបន្ទាប់" (upcoming)
 * activity list cards.
 *
 * Wired to match this API contract:
 *
 *   GET /dashboard/activities?status=completed&limit=5
 *   GET /dashboard/activities?status=upcoming&limit=5
 *
 *   (Modeled here against one shared "activities" array, since that's
 *   what's currently in data/dashboard.json — see note below.)
 *
 *   Each activity:
 *   {
 *     "id": "1",
 *     "title": "កម្មវិធីដាំដើមឈើ",
 *     "type": "external",       // "internal" | "external"
 *     "status": "completed",    // "completed" | "upcoming"
 *     "date": "25 មករា, 2026",
 *     "time": null,             // populated for "upcoming", null for "completed"
 *     "attendeeCount": 200,     // populated for "completed", null for "upcoming"
 *     "image": "/activities/1.jpg"  // null for "upcoming" (no photo exists yet)
 *   }
 *
 * IMPORTANT — sorting & limiting responsibility:
 * "date" is a pre-formatted Khmer display string ("25 មករា, 2026"), not
 * an ISO date. That means the frontend CANNOT reliably sort by it
 * (parsing Khmer month names back into a real Date is fragile and easy
 * to get wrong). So this component does NOT sort or slice the data —
 * it trusts the backend to already return each list correctly ordered
 * (completed: most recent first; upcoming: soonest first) and already
 * limited to 5. If backend ever sends more than 5 or in the wrong
 * order, this component will just render it as-is — worth confirming
 * that contract explicitly rather than assuming.
 *
 * LAYOUT NOTE:
 * RecentActivities and UpcomingActivities are exported separately so
 * they can be dropped directly into a CSS grid as siblings of
 * QuickActions/PerformanceSummary's column. That guarantees all three
 * end up as true equal 1fr grid columns — using the old combined
 * ActivityList inside its own flex row produced a *different* internal
 * gap than the outer grid's column gap, which is why the two activity
 * cards didn't end up the same width as the third column before.
 *
 * THUMBNAIL NOTE:
 * Both completed and upcoming rows render the same rectangular (64x44)
 * photo thumbnail via ActivityThumbnail, instead of upcoming rows
 * getting a colored icon box. Since `image` is currently null for
 * upcoming activities (see above), those rows fall back to
 * /dashboard/activity-placeholder.jpg until real per-event photos exist
 * on the backend — swap that fallback path for whatever generic
 * placeholder asset the project uses.
 */
