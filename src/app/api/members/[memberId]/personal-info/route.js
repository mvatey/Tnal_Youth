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

export async function GET(
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
    const response =
      await fetch(
        `${BACKEND_URL}/members/${memberId}/personal-info`,
        {
          headers: {
            Accept:
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          cache: "no-store",
        },
      );

    return forward(response);
  } catch (error) {
    console.error(
      "Personal info GET proxy:",
      error,
    );

    return Response.json(
      {
        message:
          "មិនអាចភ្ជាប់ទៅកាន់សេវាកម្មព័ត៌មានផ្ទាល់ខ្លួនបានទេ",
      },
      {
        status: 502,
      },
    );
  }
}

export async function PUT(
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
        `${BACKEND_URL}/members/${memberId}/personal-info`,
        {
          method: "PUT",

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
      "Personal info PUT proxy:",
      error,
    );

    return Response.json(
      {
        message:
          "មិនអាចកែប្រែព័ត៌មានផ្ទាល់ខ្លួនបានទេ",
      },
      {
        status: 502,
      },
    );
  }
}
