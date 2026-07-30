import { NextResponse } from "next/server";

const BACKEND_URL =
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
  const cookie = request.headers.get("cookie");

  if (cookie) {
    headers.Cookie = cookie;
  }

  /*
   * Also forward Authorization if the frontend request has it.
   */
  const authorization =
    request.headers.get("authorization");

  if (authorization) {
    headers.Authorization = authorization;
  }

  /*
   * Support JWT stored as an HttpOnly cookie.
   * Adjust these names to match your login route.
   */
  const accessToken =
    request.cookies.get("accessToken")?.value ??
    request.cookies.get("access_token")?.value ??
    request.cookies.get("token")?.value;

  if (!headers.Authorization && accessToken) {
    headers.Authorization =
      `Bearer ${accessToken}`;
  }

  return headers;
}

async function fetchBackend({
  path,
  headers,
}) {
  const response = await fetch(
    `${BACKEND_URL}${path}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );

  const data =
    await parseJsonSafely(response);

  if (!response.ok) {
    const error = new Error(
      data?.message ??
        `Backend request failed: ${path}`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

export async function GET(request) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    /*
     * Examples:
     * month = 2026-07
     * year = 2026
     * branchId = 1
     */
    const currentDate = new Date();

    const defaultMonth =
      `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;

    const month =
      searchParams.get("month") ??
      defaultMonth;

    const year =
      Number(
        searchParams.get("year") ??
          month.slice(0, 4)
      );

    const branchId =
      searchParams.get("branchId");

    const headers =
      createHeaders(request);

    const summaryPath =
      `/dashboard/summary?month=${encodeURIComponent(
        month
      )}`;

    const breakdownPath =
      `/dashboard/activity-breakdown?month=${encodeURIComponent(
        month
      )}`;

    const trendPath =
      `/dashboard/participation-trend?year=${encodeURIComponent(
        year
      )}`;

    const activitiesPath =
      "/dashboard/activities";

    const branchPerformanceParams =
      new URLSearchParams({
        month,
      });

    if (branchId) {
      branchPerformanceParams.set(
        "branchId",
        branchId
      );
    }

    const branchPerformancePath =
      `/dashboard/branch-performance?${branchPerformanceParams.toString()}`;

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
        path: breakdownPath,
        headers,
      }),

      fetchBackend({
        path: trendPath,
        headers,
      }),

      fetchBackend({
        path: activitiesPath,
        headers,
      }),

      fetchBackend({
        path: branchPerformancePath,
        headers,
      }),
    ]);

    return NextResponse.json({
      period: month,
      year,

      summary,

      activityBreakdown,

      participationTrend,

      activities,

      branchPerformance,
    });
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
          Number.isInteger(error?.status)
            ? error.status
            : 500,
      }
    );
  }
}