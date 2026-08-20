import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/apiErrorResponse";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8081/api";

export async function proxyBackend(request, path) {
  const accessToken =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("access_token")?.value ||
    request.cookies.get("token")?.value;

  if (!accessToken) {
    return apiErrorResponse(
      "UNAUTHENTICATED",
      "Your login session has expired. Please sign in again.",
      401,
    );
  }

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${accessToken}`);

  const accept = request.headers.get("accept");
  const contentType = request.headers.get("content-type");
  if (accept) headers.set("Accept", accept);
  if (contentType) headers.set("Content-Type", contentType);

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      cache: "no-store",
    });

    const responseBody =
      response.status === 204
        ? null
        : await response.arrayBuffer();
    const responseHeaders = new Headers();

    ["content-type", "content-disposition", "cache-control"].forEach(
      (headerName) => {
        const value = response.headers.get(headerName);
        if (value) responseHeaders.set(headerName, value);
      },
    );

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`Backend request failed for ${path}:`, error);
    return apiErrorResponse(
      "BACKEND_UNAVAILABLE",
      "Unable to connect to the backend service.",
      502,
    );
  }
}
