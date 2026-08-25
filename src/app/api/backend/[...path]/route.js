import { proxyBackend } from "@/lib/backendProxy";
import { apiErrorResponse } from "@/lib/apiErrorResponse";

const ALLOWED_ROOTS = new Set([
  "activities",
  "documents",
  "donations",
  "files",
  "members",
  "payment-methods",
  "my-account",
  "notifications",
  "organization-profile",
  "document-types",
  "donation-types",
  "exchange-rates",
  "admin",
  "telegram",
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
    return apiErrorResponse(
      "API_PATH_NOT_ALLOWED",
      "This backend API path is not allowed.",
      404,
    );
  }

  const backendPath =
    `/${path.map(encodeURIComponent).join("/")}` +
    request.nextUrl.search;

  return proxyBackend(request, backendPath);
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
