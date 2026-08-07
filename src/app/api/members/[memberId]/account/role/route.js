import {
  cookies,
} from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

export async function PATCH(
  request,
  context,
) {
  const { memberId } =
    await context.params;

  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      "accessToken",
    )?.value;

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
        `${BACKEND_URL}/members/${memberId}/personal-info/account/role`,
        {
          method: "PATCH",

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

    const text =
      await response.text();

    return new Response(
      text,
      {
        status:
          response.status,

        headers: {
          "Content-Type":
            response.headers.get(
              "content-type",
            ) ||
            "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      "Role update proxy:",
      error,
    );

    return Response.json(
      {
        message:
          "Could not update role",
      },
      {
        status: 502,
      },
    );
  }
}