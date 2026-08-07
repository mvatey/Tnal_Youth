import { cookies } from "next/headers";

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

    "activity-types",

    "provinces",
    "districts",
    "communes",
  ]);

const DIRECT_BACKEND_PATHS = {
  ethnicities: "/ethnicities?activeOnly=true",
  religions: "/religions?activeOnly=true",
  "proficiency-levels": "/proficiency-levels",
};

const LOCAL_LOOKUPS = {
  "tshirt-sizes": [
    { value: "XS", label: "XS" },
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "2XL", label: "2XL" },
    { value: "3XL", label: "3XL" },
  ],
};

export async function GET(request, context) {
  const { type } = await context.params;

  if (!ALLOWED_LOOKUPS.has(type)) {
    return Response.json(
      {
        message: "Lookup not found",
      },
      {
        status: 404,
      }
    );
  }

  if (LOCAL_LOOKUPS[type]) {
    return Response.json(LOCAL_LOOKUPS[type]);
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
