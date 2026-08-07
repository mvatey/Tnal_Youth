import {
  cookies,
} from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

export async function GET() {
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
        `${BACKEND_URL}/branches/options`,
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
      "Branch options proxy:",
      error,
    );

    return Response.json(
      {
        message:
          "Could not load branch options",
      },
      {
        status: 502,
      },
    );
  }
}