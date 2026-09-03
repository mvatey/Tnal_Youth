import {
  cookies,
} from "next/headers";

// Runs at the edge (near the visitor / near the ap-southeast-1 backend)
// instead of Vercel's default iad1 (US East) Node function region --
// removes cold starts and the extra Virginia<->Singapore round trip that
// otherwise applies to every proxied backend call from this route.
export const runtime = "edge";

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

export async function DELETE(
  request,
  context,
) {
  const { memberId, branchId } =
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
        `${BACKEND_URL}/members/${memberId}/personal-info/branches/${branchId}`,
        {
          method: "DELETE",

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
      "Member branch assignment DELETE proxy:",
      error,
    );

    return Response.json(
      {
        message:
          "មិនអាចដកសាខាបានទេ",
      },
      {
        status: 502,
      },
    );
  }
}
