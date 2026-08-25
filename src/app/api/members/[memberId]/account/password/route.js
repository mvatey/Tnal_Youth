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
          "សូមបញ្ជាក់លេខសម្គាល់សមាជិក",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const body =
      await request.text();

    const backendResponse =
      await fetch(
        `${BACKEND_URL}/members/${memberId}/account/password`,
        {
          method: "PATCH",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${accessToken}`,
          },

          body,

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
      "Member password proxy error:",
      error,
    );

    return Response.json(
      {
        message:
          "មិនអាចភ្ជាប់ទៅកាន់សេវាកម្មពាក្យសម្ងាត់សមាជិកបានទេ",
      },
      {
        status: 502,
      },
    );
  }
}
