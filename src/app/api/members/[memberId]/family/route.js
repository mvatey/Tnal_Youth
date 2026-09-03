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

export async function GET(
  request,
  { params },
) {
  const {
    memberId,
  } = await params;

  return proxyFamily(
    memberId,
    "GET",
  );
}

export async function PUT(
  request,
  { params },
) {
  const {
    memberId,
  } = await params;

  const body =
    await request.text();

  return proxyFamily(
    memberId,
    "PUT",
    body,
  );
}

async function proxyFamily(
  memberId,
  method,
  body,
) {
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
        `${BACKEND_URL}/members/${memberId}/family`,
        {
          method,

          headers: {
            Accept:
              "application/json",

            Authorization:
              `Bearer ${accessToken}`,

            ...(method === "PUT"
              ? {
                  "Content-Type":
                    "application/json",
                }
              : {}),
          },

          ...(method === "PUT"
            ? {
                body,
              }
            : {}),

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
      "Family proxy error:",
      error,
    );

    return Response.json(
      {
        message:
          "មិនអាចដំណើរការព័ត៌មានគ្រួសារបានទេ",
      },
      {
        status: 502,
      },
    );
  }
}
