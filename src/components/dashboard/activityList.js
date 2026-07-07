"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar } from "lucide-react";
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
        fontSize: 11,
        fontWeight: 600,
        color: cfg.color,
        background: cfg.tint,
        borderRadius: 6,
        padding: "3px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

function ActivityRow({ activity }) {
  const isCompleted = activity.status === "completed";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid #F2F3F5",
      }}
    >
      {isCompleted ? (
        <img
          src={activity.image}
          alt=""
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            objectFit: "cover",
            flexShrink: 0,
            background: "#F1F2F5",
          }}
        />
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            background: "#F1EEFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Calendar size={18} color="#6D5BD0" />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
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

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 3 }}>
          <span style={{ fontSize: 11, color: "#9AA0A8" }}>
            {activity.date}
            {!isCompleted && activity.time ? `  -  ${activity.time}` : ""}
          </span>
          {isCompleted ? (
            <span style={{ fontSize: 11, color: "#9AA0A8" }}>
              អ្នកចូលរួមសរុប {activity.attendeeCount}នាក់
            </span>
          ) : (
            <button
              style={{
                fontSize: 11,
                color: "#6D5BD0",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              មកដលពេលថ្ងៃ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityListCard({ title, activities, isLoading }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 320,
        background: "#FFFFFF",
        border: "1px solid #EEF0F3",
        borderRadius: 14,
        padding: "18px 20px",
        fontFamily:
          "'Noto Sans Khmer', 'Khmer OS', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#232629" }}>{title}</h3>
        <button
          style={{
            fontSize: 12,
            color: "#6D5BD0",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          មើលទាំងអស់
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: "20px 0" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid #F2F3F5",
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 8, background: "#F1F2F5" }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: "60%", height: 10, borderRadius: 4, background: "#F1F2F5", marginBottom: 8 }} />
                <div style={{ width: "40%", height: 8, borderRadius: 4, background: "#F1F2F5" }} />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div style={{ padding: "24px 0", textAlign: "center", fontSize: 12, color: "#9AA0A8" }}>
          មិនទាន់មានកម្មវិធីទេ
        </div>
      ) : (
        activities.map((a) => <ActivityRow key={a.id} activity={a} />)
      )}
    </div>
  );
}

export default function ActivityList() {
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
 * Renders the two side-by-side "កម្មវិធីថ្មីៗ" (recent) and
 * "កម្មវិធីបន្ទាប់" (upcoming) activity list cards.
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
 */