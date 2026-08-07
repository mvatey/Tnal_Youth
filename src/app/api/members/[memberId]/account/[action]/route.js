import {
  cookies,
} from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

const ALLOWED_ACTIONS =
  new Set([
    "enable",
    "disable",
  ]);

export async function PATCH(
  request,
  context,
) {
  const {
    memberId,
    action,
  } = await context.params;

  if (
    !ALLOWED_ACTIONS.has(
      action,
    )
  ) {
    return Response.json(
      {
        message:
          "Invalid account action",
      },
      {
        status: 404,
      },
    );
  }

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
        `${BACKEND_URL}/members/${memberId}/account/${action}`,
        {
          method: "PATCH",

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
      "Account status proxy:",
      error,
    );

    return Response.json(
      {
        message:
          "Could not update account status",
      },
      {
        status: 502,
      },
    );
  }
}