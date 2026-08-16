import {
  cookies,
} from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

async function forward(
  response,
) {
  const text =
    await response.text();

  return new Response(text, {
    status: response.status,

    headers: {
      "Content-Type":
        response.headers.get(
          "content-type",
        ) ||
        "application/json",
    },
  });
}

async function getToken() {
  const cookieStore =
    await cookies();

  return cookieStore.get(
    "accessToken",
  )?.value;
}

export async function POST(
  request,
  context,
) {
  const { memberId } =
    await context.params;

  const token =
    await getToken();

  if (!token) {
    return Response.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const body =
      await request.text();

    const response =
      await fetch(
        `${BACKEND_URL}/members/${memberId}/personal-info/branches`,
        {
          method: "POST",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body,

          cache: "no-store",
        },
      );

    return forward(response);
  } catch (error) {
    console.error(
      "Member branch assignment POST proxy:",
      error,
    );

    return Response.json(
      {
        message:
          "Could not assign branch",
      },
      {
        status: 502,
      },
    );
  }
}
