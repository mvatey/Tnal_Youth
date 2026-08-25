import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

export async function GET(
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
        `${BACKEND_URL}/branches/${branchId}/details`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
            Authorization:
              `Bearer ${accessToken}`,
          },
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
      "Branch details proxy error:",
      error,
    );

    return Response.json(
      {
        message:
          "មិនអាចភ្ជាប់ទៅកាន់សេវាកម្មព័ត៌មានលម្អិតសាខាបានទេ",
      },
      {
        status: 502,
      },
    );
  }
}
