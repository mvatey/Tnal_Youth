import { cookies } from "next/headers";

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

  /*
   * These statuses must not contain a body.
   */
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
 * GET CURRENT BRANCH LEADER
 * ==========================================================
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
        `${BACKEND_URL}/branches/${branchId}/leader`,
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
      "Load branch leader proxy error:",
      error,
    );

    return Response.json(
      {
        message:
          error?.message ||
          "មិនអាចទាញយកប្រធានសាខាបានទេ",
      },
      {
        status: 502,
      },
    );
  }
}


/*
 * ==========================================================
 * ASSIGN / CHANGE BRANCH LEADER
 * ==========================================================
 */

export async function PUT(
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

  let body;

  try {
    body =
      await request.json();

  } catch {
    return Response.json(
      {
        message:
          "Invalid JSON request body",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Accept either frontend naming style,
   * but always send member_id to Spring Boot.
   */
  const memberId =
    body?.member_id ??
    body?.memberId ??
    null;

  if (
    memberId === null ||
    memberId === undefined ||
    memberId === ""
  ) {
    return Response.json(
      {
        message:
          "សូមបញ្ជាក់លេខសម្គាល់សមាជិកដែលជាប្រធានសាខា",
      },
      {
        status: 400,
      },
    );
  }

  const normalizedMemberId =
    Number(memberId);

  if (
    !Number.isFinite(
      normalizedMemberId,
    ) ||
    normalizedMemberId <= 0
  ) {
    return Response.json(
      {
        message:
          "Branch leader member ID must be valid",
      },
      {
        status: 400,
      },
    );
  }

  const backendBody = {
    member_id:
      normalizedMemberId,
  };

  try {
    const backendResponse =
      await fetch(
        `${BACKEND_URL}/branches/${branchId}/leader`,
        {
          method: "PUT",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${accessToken}`,
          },

          body:
            JSON.stringify(
              backendBody,
            ),

          cache:
            "no-store",
        },
      );

    return forwardResponse(
      backendResponse,
    );

  } catch (error) {
    console.error(
      "Assign branch leader proxy error:",
      error,
    );

    return Response.json(
      {
        message:
          error?.message ||
          "មិនអាចកំណត់ប្រធានសាខាបានទេ",
      },
      {
        status: 502,
      },
    );
  }
}
