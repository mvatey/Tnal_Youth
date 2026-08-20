import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8081/api";

export async function PATCH(request, { params }) {
  const { memberId } = await params;
  const accessToken = (await cookies()).get("accessToken")?.value;

  if (!accessToken) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.text();

  try {
    const backendResponse = await fetch(
      `${BACKEND_URL}/members/${memberId}/status`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body,
        cache: "no-store",
      },
    );

    const responseText = await backendResponse.text();

    return new Response(responseText, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("content-type") ||
          "application/json",
      },
    });
  } catch (error) {
    console.error("Member status proxy error:", error);

    return Response.json(
      { message: "Unable to connect to member status endpoint" },
      { status: 502 },
    );
  }
}
