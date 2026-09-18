import { apiErrorResponse } from "@/lib/apiErrorResponse";
import { proxyBackend } from "@/lib/backendProxy";

// Deliberately NOT edge runtime, unlike most other routes in this app.
// This route's shape -- two nested dynamic segments ([memberId], then
// [resource]) followed by an OPTIONAL catch-all ([[...segments]]) that
// can match zero segments -- hits a real bug in Next.js 16.2.12's Edge
// Runtime simulation on Node.js 24: `await params` resolves with
// `memberId` missing/undefined whenever the catch-all matches nothing
// (e.g. /api/members/32/records/work-history), even though the exact
// same request works fine with a trailing segment present (e.g.
// /api/members/32/records/work-history/123). Reproduced identically on
// two separate machines differing only in Node major version (22 vs 24)
// with byte-identical source -- removing edge runtime here fixes it.
// No other route in this app combines two dynamic segments with an
// optional catch-all this way, so this is the only one affected.

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
