import fs from "fs";
import path from "path";

const DASHBOARD_DIR = path.join(process.cwd(), "src", "data", "dashboard");

function readJson(filename) {
  const filePath = path.join(DASHBOARD_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export async function GET() {
  try {
    const summary = readJson("cardSummary.json");
    const activitiesBreakdown = readJson("activitySummary.json");
    const participationTrend = readJson("participationSummary.json");
    const activities = readJson("activityLists.json");
    const branchPerformance = readJson("branchPerformance.json");

    // Merged back into one payload, matching the original combined shape
    // each component expects (stats, activitySummary, participationTrend,
    // activities, branches). Once this is wired to a real database
    // instead of static files, each readJson(...) call above becomes a
    // real query — the response shape here doesn't need to change.
    return Response.json({
      stats: summary.stats,
      activitySummary: activitiesBreakdown.activitySummary,
      participationTrend: participationTrend.participationTrend,
      activities: activities.activities,
      branches: branchPerformance.branches,
    });
  } catch (err) {
    console.error("Dashboard route error:", err);
    return Response.json(
      { message: "មិនអាចទាញយកទិន្នន័យបានទេ" },
      { status: 500 }
    );
  }
}