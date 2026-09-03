import { NextResponse } from "next/server";

// Runs at the edge (near the visitor / near the ap-southeast-1 backend)
// instead of Vercel's default iad1 (US East) Node function region --
// removes cold starts and the extra Virginia<->Singapore round trip that
// otherwise applies to every proxied backend call from this route.
export const runtime = "edge";

const BACKEND_URL =
  process.env.BACKEND_API_URL ??
  process.env.BACKEND_URL ??
  "http://localhost:8081/api";

async function parseJsonSafely(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

function createHeaders(request) {
  const headers = {
    Accept: "application/json",
  };

  /*
   * Forward cookies in case Spring Boot reads JWT cookies.
   */
  const cookie =
    request.headers.get("cookie");

  if (cookie) {
    headers.Cookie = cookie;
  }

  /*
   * Forward Authorization header when available.
   */
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (authorization) {
    headers.Authorization =
      authorization;
  }

  /*
   * Support JWT stored in HttpOnly cookies.
   */
  const accessToken =
    request.cookies.get(
      "accessToken"
    )?.value ??
    request.cookies.get(
      "access_token"
    )?.value ??
    request.cookies.get(
      "token"
    )?.value;

  if (
    !headers.Authorization &&
    accessToken
  ) {
    headers.Authorization =
      `Bearer ${accessToken}`;
  }

  return headers;
}

async function fetchBackend({
  path,
  headers,
}) {
  const response =
    await fetch(
      `${BACKEND_URL}${path}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

  const data =
    await parseJsonSafely(
      response
    );

  if (!response.ok) {
    const error = new Error(
      data?.message ??
      `Backend request failed: ${path}`
    );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return data;
}

export async function GET(
  request
) {
  try {
    const searchParams =
      request.nextUrl
        .searchParams;

    /*
     * Example:
     *
     * month = 2026-08
     * year = 2026
     *
     * branchId
     * → filters the main dashboard scope
     *
     * performanceBranchId
     * → filters ONLY Branch Performance
     */
    const currentDate =
      new Date();

    const defaultMonth =
      `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;

    const month =
      searchParams.get(
        "month"
      ) ??
      defaultMonth;

    const year =
      Number(
        searchParams.get(
          "year"
        ) ??
        month.slice(
          0,
          4
        )
      );

    /*
     * Main dashboard branch scope.
     */
    const branchId =
      searchParams.get(
        "branchId"
      );

    /*
     * Branch Performance dropdown scope.
     */
    const performanceBranchId =
      searchParams.get(
        "performanceBranchId"
      );

    const headers =
      createHeaders(
        request
      );

    /*
     * =========================================================
     * SUMMARY
     * =========================================================
     */
    // Summary cards are "up to the present" and must not move when the
    // pie-chart month selector changes. Only the breakdown below uses the
    // selected month.
    const summaryParams =
      new URLSearchParams({
        month: defaultMonth,
      });

    if (branchId) {
      summaryParams.set(
        "branchId",
        branchId
      );
    }

    const summaryPath =
      `/dashboard/summary?${summaryParams.toString()}`;

    /*
     * =========================================================
     * ACTIVITY BREAKDOWN
     * =========================================================
     */
    const breakdownParams =
      new URLSearchParams({
        month,
      });

    if (branchId) {
      breakdownParams.set(
        "branchId",
        branchId
      );
    }

    const breakdownPath =
      `/dashboard/activity-breakdown?${breakdownParams.toString()}`;

    /*
     * =========================================================
     * PARTICIPATION TREND
     * =========================================================
     */
    const trendParams =
      new URLSearchParams({
        year: String(
          year
        ),
      });

    if (branchId) {
      trendParams.set(
        "branchId",
        branchId
      );
    }

    const trendPath =
      `/dashboard/participation-trend?${trendParams.toString()}`;

    /*
     * =========================================================
     * RECENT / UPCOMING ACTIVITIES
     * =========================================================
     */
    const activitiesParams =
      new URLSearchParams();

    if (branchId) {
      activitiesParams.set(
        "branchId",
        branchId
      );
    }

    const activitiesPath =
      activitiesParams
        .toString()
        ? `/dashboard/activities?${activitiesParams.toString()}`
        : "/dashboard/activities";

    /*
     * =========================================================
     * BRANCH PERFORMANCE
     * =========================================================
     *
     * IMPORTANT:
     *
     * Use performanceBranchId here,
     * NOT branchId.
     *
     * This allows the dropdown inside
     * PerformanceSummary to change only
     * this section.
     */
    const branchPerformanceParams =
      new URLSearchParams({
        month,
      });

    if (
      performanceBranchId
    ) {
      branchPerformanceParams.set(
        "branchId",
        performanceBranchId
      );
    }

    const branchPerformancePath =
      `/dashboard/branch-performance?${branchPerformanceParams.toString()}`;

    /*
     * Temporary debugging.
     *
     * You can remove these after confirming
     * everything works.
     */
    console.log(
      "Dashboard main branchId:",
      branchId
    );

    console.log(
      "Performance branchId:",
      performanceBranchId
    );

    console.log(
      "Performance backend path:",
      branchPerformancePath
    );

    /*
     * =========================================================
     * LOAD DASHBOARD DATA
     * =========================================================
     */
    const [
      summary,
      activityBreakdown,
      participationTrend,
      activities,
      branchPerformance,
    ] = await Promise.all([
      fetchBackend({
        path: summaryPath,
        headers,
      }),

      fetchBackend({
        path:
          breakdownPath,
        headers,
      }),

      fetchBackend({
        path: trendPath,
        headers,
      }),

      fetchBackend({
        path:
          activitiesPath,
        headers,
      }),

      fetchBackend({
        path:
          branchPerformancePath,
        headers,
      }),
    ]);

    /*
     * =========================================================
     * RESPONSE
     * =========================================================
     */
    return NextResponse.json(
      {
        period: month,

        year,

        summary,

        activityBreakdown,

        participationTrend,

        activities,

        branchPerformance,
      }
    );

  } catch (error) {
    console.error(
      "Dashboard proxy error:",
      error
    );

    return NextResponse.json(
      error?.data ?? {
        message:
          error instanceof Error
            ? error.message
            : "មិនអាចទាញយកទិន្នន័យផ្ទាំងគ្រប់គ្រងបានទេ",
      },
      {
        status:
          Number.isInteger(
            error?.status
          )
            ? error.status
            : 500,
      }
    );
  }
}