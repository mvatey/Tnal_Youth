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
  const status =
    backendResponse.status;

  if (
    status === 204 ||
    status === 205 ||
    status === 304
  ) {
    return new Response(
      null,
      {
        status,
      },
    );
  }

  const responseText =
    await backendResponse.text();

  return new Response(
    responseText,
    {
      status,

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


/*
 * ==========================================================
 * PREVIEW A SECRETARY_REGIONAL POSITION'S COMPUTED BRANCH LIST
 * ==========================================================
 *
 * Read-only -- lets member/create show the locked coverage multiselect
 * before anything is actually saved. Admin-only on the backend, same
 * as assigning the position itself.
 */

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

  if (!branchId) {
    return Response.json(
      {
        message:
          "សូមបញ្ជាក់លេខសម្គាល់សាខា",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const backendResponse =
      await fetch(
        `${BACKEND_URL}/branches/${branchId}/regional-coverage`,
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

  } catch (error) {
    console.error(
      "Load regional coverage proxy error:",
      error,
    );

    return Response.json(
      {
        message:
          error?.message ||
          "មិនអាចទាញយកសាខាគ្របដណ្តប់បានទេ",
      },
      {
        status: 502,
      },
    );
  }
}
