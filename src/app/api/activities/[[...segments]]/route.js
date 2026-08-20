import { apiErrorResponse } from "@/lib/apiErrorResponse";
import { proxyBackend } from "@/lib/backendProxy";

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
  const { segments = [] } = await context.params;

  if (!Array.isArray(segments) || !segments.every(isSafeSegment)) {
    return apiErrorResponse(
      "INVALID_API_PATH",
      "The activity API path is invalid.",
      400,
    );
  }

  const suffix = segments.length
    ? `/${segments.map(encodeURIComponent).join("/")}`
    : "";

  return proxyBackend(
    request,
    `/activities${suffix}${request.nextUrl.search}`,
  );
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
