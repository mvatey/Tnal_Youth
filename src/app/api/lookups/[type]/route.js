import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

const ALLOWED_LOOKUPS = new Set([
  "branches",
  "member-statuses",
  "genders",
  "member-levels",
  "nationalities",
  "user-roles",
]);

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

  const backendResponse = await fetch(
    `${BACKEND_URL}/lookups/${type}${incomingUrl.search}`,
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