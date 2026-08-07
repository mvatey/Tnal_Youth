import { NextResponse } from "next/server";

import { proxyBackend } from "@/lib/backendProxy";

// Only application feature APIs may pass through this authenticated gateway.
// Authentication endpoints keep their dedicated handlers because their cookie
// and response rules are intentionally different.
const ALLOWED_ROOTS = new Set([
  "activities",
  "attendance-statuses",
  "branches",
  "dashboard",
  "document-types",
  "documents",
  "donation-types",
  "donations",
  "ethnicities",
  "exchange-rates",
  "files",
  "lookups",
  "member-levels",
  "member-statuses",
  "members",
  "my-account",
  "nationalities",
  "notifications",
  "payment-methods",
  "proficiency-levels",
  "religions",
  "users",
]);

function isSafeSegment(segment) {
  return (
    typeof segment === "string" &&
    segment.length > 0 &&
    segment !== "." &&
    segment !== ".." &&
    !segment.includes("/") &&
    !segment.includes("\\")
  );
}

async function forward(request, context) {
  const { path } = await context.params;

  if (
    !Array.isArray(path) ||
    path.length === 0 ||
    !path.every(isSafeSegment) ||
    !ALLOWED_ROOTS.has(path[0])
  ) {
    return NextResponse.json(
      { message: "This backend API path is not allowed." },
      { status: 404 },
    );
  }

  const backendPath = `/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  return proxyBackend(request, backendPath);
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
