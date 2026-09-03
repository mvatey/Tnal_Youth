import { apiErrorResponse } from "@/lib/apiErrorResponse";
import { proxyBackend } from "@/lib/backendProxy";

// Runs at the edge (near the visitor / near the ap-southeast-1 backend)
// instead of Vercel's default iad1 (US East) Node function region --
// removes cold starts and the extra Virginia<->Singapore round trip that
// otherwise applies to every proxied backend call from this route.
export const runtime = "edge";

const RESOURCES = new Set([
  "education",
  "languages",
  "skills",
  "work-history",
  "political-affiliations",
]);

function isPositiveId(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0;
}

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

async function forward(request, { params }) {
  const { memberId, resource, segments = [] } = await params;

  if (!isPositiveId(memberId)) {
    return apiErrorResponse("INVALID_MEMBER_ID", "Invalid member ID.", 400);
  }

  if (!RESOURCES.has(resource)) {
    return apiErrorResponse(
      "MEMBER_RESOURCE_NOT_FOUND",
      "Unsupported member resource.",
      404,
    );
  }

  if (!Array.isArray(segments) || !segments.every(isSafeSegment)) {
    return apiErrorResponse(
      "INVALID_API_PATH",
      "The member record API path is invalid.",
      400,
    );
  }

  const suffix = segments.length
    ? `/${segments.map(encodeURIComponent).join("/")}`
    : "";

  return proxyBackend(
    request,
    `/members/${encodeURIComponent(memberId)}/${resource}${suffix}`,
  );
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;
