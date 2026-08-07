import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

export async function GET(
  request,
  context,
) {
  const { memberId } =
    await context.params;

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
    const incomingUrl =
      new URL(request.url);

    const backendUrl =
      `${BACKEND_URL}/members/${memberId}/participations${incomingUrl.search}`;

    const backendResponse =
      await fetch(
        backendUrl,
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
  } catch (error) {
    console.error(
      "Member participation proxy error:",
      error,
    );

    return Response.json(
      {
        message:
          "Could not connect to member participation endpoint",
      },
      {
        status: 502,
      },
    );
  }
}