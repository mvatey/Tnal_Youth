import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

export async function PUT(
  request,
  context,
) {
  const { branchId } =
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
        message: "Unauthorized",
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
          "Branch ID is required",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const body =
      await request.json();

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
          body: JSON.stringify(
            body,
          ),
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
      "Assign branch leader proxy error:",
      error,
    );

    return Response.json(
      {
        message:
          "Could not assign branch leader",
      },
      {
        status: 502,
      },
    );
  }
}