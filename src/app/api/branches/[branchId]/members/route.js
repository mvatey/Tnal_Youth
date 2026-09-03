import { cookies } from "next/headers";

// Runs at the edge (near the visitor / near the ap-southeast-1 backend)
// instead of Vercel's default iad1 (US East) Node function region --
// removes cold starts and the extra Virginia<->Singapore round trip that
// otherwise applies to every proxied backend call from this route.
export const runtime = "edge";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

async function getAccessToken() {
  const cookieStore =
    await cookies();

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
  const { branchId } =
    await context.params;

  const accessToken =
    await getAccessToken();

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

  const incomingUrl =
    new URL(
      request.url,
    );

  const backendUrl =
    `${BACKEND_URL}/branches/${branchId}/members${incomingUrl.search}`;

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

        cache:
          "no-store",
      },
    );

  return forwardResponse(
    backendResponse,
  );
}