import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

async function getAccessToken() {
  const cookieStore = await cookies();

  return cookieStore.get(
    "accessToken",
  )?.value;
}

async function forwardResponse(
  backendResponse,
) {
  const responseText =
    await backendResponse.text();

  return new Response(
    responseText,
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
}

export async function GET(
  request,
  context,
) {
  const { memberId } =
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

  if (!memberId) {
    return Response.json(
      {
        message:
          "Member ID is required",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const backendResponse =
      await fetch(
        `${BACKEND_URL}/members/${memberId}`,
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
  } catch (error) {
    console.error(
      "Member detail proxy error:",
      error,
    );

    return Response.json(
      {
        message:
          "Could not connect to member detail endpoint",
      },
      {
        status: 502,
      },
    );
  }
}