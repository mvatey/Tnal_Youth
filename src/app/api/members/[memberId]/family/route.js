import {
  cookies,
} from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

export async function GET(
  request,
  { params },
) {
  const {
    memberId,
  } = await params;

  return proxyFamily(
    memberId,
    "GET",
  );
}

export async function PUT(
  request,
  { params },
) {
  const {
    memberId,
  } = await params;

  const body =
    await request.text();

  return proxyFamily(
    memberId,
    "PUT",
    body,
  );
}

async function proxyFamily(
  memberId,
  method,
  body,
) {
  const cookieStore =
    await cookies();

  const accessToken =
    cookieStore.get(
      "accessToken",
    )?.value;

  if (!accessToken) {
    return Response.json(
      {
        message:
          "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const backendResponse =
      await fetch(
        `${BACKEND_URL}/members/${memberId}/family`,
        {
          method,

          headers: {
            Accept:
              "application/json",

            Authorization:
              `Bearer ${accessToken}`,

            ...(method === "PUT"
              ? {
                  "Content-Type":
                    "application/json",
                }
              : {}),
          },

          ...(method === "PUT"
            ? {
                body,
              }
            : {}),

          cache: "no-store",
        },
      );

    const text =
      await backendResponse.text();

    return new Response(
      text,
      {
        status:
          backendResponse.status,

        headers: {
          "Content-Type":
            backendResponse.headers.get(
              "content-type",
            ) ||
            "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      "Family proxy error:",
      error,
    );

    return Response.json(
      {
        message:
          "Could not process family information",
      },
      {
        status: 502,
      },
    );
  }
}