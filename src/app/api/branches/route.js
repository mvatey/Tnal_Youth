import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

async function getAccessToken() {
  const cookieStore = await cookies();

  return cookieStore.get("accessToken")?.value;
}

async function forwardResponse(response) {
  const text = await response.text();

  return new Response(text, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ||
        "application/json",
    },
  });
}

export async function GET(request) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const incomingUrl = new URL(request.url);

  const backendResponse = await fetch(
    `${BACKEND_URL}/branches${incomingUrl.search}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  return forwardResponse(backendResponse);
}

export async function POST(request) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const body = await request.json();

  const backendResponse = await fetch(
    `${BACKEND_URL}/branches`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  return forwardResponse(backendResponse);
}