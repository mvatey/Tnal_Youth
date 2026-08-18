import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

export async function GET(request) {
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

  // Forward query params (branchId in particular) through to the backend
  // -- this used to drop them entirely, so a branchId the frontend sent
  // to scope a secretary/branch_leader's summary cards to their one
  // active branch never actually reached the backend.
  const incomingUrl = new URL(request.url);

  const backendResponse = await fetch(
    `${BACKEND_URL}/members/summary${incomingUrl.search}`,
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