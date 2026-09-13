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

// Uploads a member's CV -- multipart/form-data, unlike the sibling
// personal-info route's JSON body, so the request body must be forwarded
// as-is (raw bytes) with its original Content-Type (which carries the
// multipart boundary), never re-serialized as text/JSON.
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
    const contentType =
      request.headers.get(
        "content-type",
      );

    const response =
      await fetch(
        `${BACKEND_URL}/members/${memberId}/personal-info/cv`,
        {
          method: "PUT",

          headers: {
            Accept:
              "application/json",

            ...(contentType
              ? { "Content-Type": contentType }
              : {}),

            Authorization:
              `Bearer ${token}`,
          },

          body:
            await request.arrayBuffer(),

          cache: "no-store",
        },
      );

    return forward(response);
  } catch (error) {
    console.error(
      "Personal info CV PUT proxy:",
      error,
    );

    return Response.json(
      {
        message:
          "មិនអាចបញ្ចូលប្រវត្តិរូបសង្ខេបបានទេ",
      },
      {
        status: 502,
      },
    );
  }
}
