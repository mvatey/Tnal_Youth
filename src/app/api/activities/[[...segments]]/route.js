import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8081/api";

async function proxy(request, context) {
  const { segments = [] } = await context.params;
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const incomingUrl = new URL(request.url);
  const path = ["activities", ...segments].join("/");
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  let body;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer();
    const contentType = request.headers.get("content-type");
    if (contentType) headers["Content-Type"] = contentType;
  }

  const backendResponse = await fetch(
    `${BACKEND_URL}/${path}${incomingUrl.search}`,
    { method: request.method, headers, body, cache: "no-store" },
  );
  return new Response(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") || "application/json",
    },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
