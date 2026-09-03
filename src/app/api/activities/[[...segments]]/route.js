import { apiErrorResponse } from "@/lib/apiErrorResponse";
import { proxyBackend } from "@/lib/backendProxy";

// Runs at the edge (near the visitor / near the ap-southeast-1 backend)
// instead of Vercel's default iad1 (US East) Node function region --
// removes cold starts and the extra Virginia<->Singapore round trip that
// otherwise applies to every proxied backend call from this route.
export const runtime = "edge";

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
