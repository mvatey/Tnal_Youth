import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

async function getAccessToken() {
  const cookieStore =
    await cookies();

  return cookieStore.get(
    "accessToken",
  )?.value;
}

async function forwardResponse(
  backendResponse,
) {
  const responseText =
    await backendResponse.text();

  return new Response(responseText, {
    status: backendResponse.status,
    headers: {
      "Content-Type":
        backendResponse.headers.get(
          "content-type",
        ) ||
        "application/json",
    },
  });
}

export async function GET(
  request,
  context,
) {
  const { branchId } =
    await context.params;

  const accessToken =
    await getAccessToken();

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

  const backendResponse =
    await fetch(
      `${BACKEND_URL}/branches/${branchId}`,
      {
        method: "GET",
        headers: {
          Accept:
            "application/json",
          Authorization:
            `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

  return forwardResponse(
    backendResponse,
  );
}

export async function PUT(
  request,
  context,
) {
  const { branchId } =
    await context.params;

  const accessToken =
    await getAccessToken();

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

  const body =
    await request.json();

  const backendResponse =
    await fetch(
      `${BACKEND_URL}/branches/${branchId}`,
      {
        method: "PUT",
        headers: {
          Accept:
            "application/json",
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

  return forwardResponse(
    backendResponse,
  );
}