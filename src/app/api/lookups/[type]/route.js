import { cookies } from "next/headers";

// Runs at the edge (near the visitor / near the ap-southeast-1 backend)
// instead of Vercel's default iad1 (US East) Node function region --
// removes cold starts and the extra Virginia<->Singapore round trip that
// otherwise applies to every proxied backend call from this route.
export const runtime = "edge";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

const ALLOWED_LOOKUPS =
  new Set([
    "branches",

    "branch-statuses",
    "member-statuses",

    "genders",
    "member-levels",
    "nationalities",
    "ethnicities",
    "religions",

    "education-levels",
    "languages",
    "skills",
    "proficiency-levels",
    "political-parties",

    "user-roles",
    "tshirt-sizes",
    "positions",

    "activity-types",
    "activity-sectors",
    "activity-statuses",
    "activity-invitable-branches",
    "payment-methods",

    "provinces",
    "districts",
    "communes",
  ]);

const DIRECT_BACKEND_PATHS = {
  ethnicities: "/ethnicities?activeOnly=true",
  religions: "/religions?activeOnly=true",
  "proficiency-levels": "/proficiency-levels",
  "tshirt-sizes": "/lookups/tshirt-sizes",
};

export async function GET(request, context) {
  const { type } = await context.params;

  if (!ALLOWED_LOOKUPS.has(type)) {
    return Response.json(
      {
        message: "រកមិនឃើញទិន្នន័យជម្រើសនេះទេ",
      },
      {
        status: 404,
      }
    );
  }

  const cookieStore = await cookies();

  const accessToken =
    cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return Response.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const incomingUrl = new URL(request.url);

  const directPath = DIRECT_BACKEND_PATHS[type];
  const backendPath = directPath || `/lookups/${type}${incomingUrl.search}`;

  const backendResponse = await fetch(
    `${BACKEND_URL}${backendPath}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const responseText =
    await backendResponse.text();

  return new Response(responseText, {
    status: backendResponse.status,
    headers: {
      "Content-Type":
        backendResponse.headers.get(
          "content-type"
        ) || "application/json",
    },
  });
}
