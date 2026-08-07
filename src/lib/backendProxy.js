import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8081/api";

const refreshRequests = new Map();

async function refreshSession(refreshToken) {
  if (!refreshRequests.has(refreshToken)) {
    const refreshRequest = fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .finally(() => {
        setTimeout(() => refreshRequests.delete(refreshToken), 5000);
      });

    refreshRequests.set(refreshToken, refreshRequest);
  }

  return refreshRequests.get(refreshToken);
}

async function sendBackendRequest(method, path, headers, body) {
  return fetch(`${BACKEND_URL}${path}`, {
    method,
    headers,
    body,
    cache: "no-store",
  });
}

export async function proxyBackend(request, path) {
  const method = request.method;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  const explicitAuthorization = request.headers.get("authorization");
  const accessToken =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("access_token")?.value ||
    request.cookies.get("token")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (contentType) headers.set("Content-Type", contentType);
  if (accept) headers.set("Accept", accept);
  if (explicitAuthorization) {
    headers.set("Authorization", explicitAuthorization);
  } else if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (!headers.has("Authorization")) {
    return NextResponse.json(
      { message: "Your login session has expired. Please sign in again." },
      { status: 401 },
    );
  }

  try {
    const body =
      method === "GET" || method === "HEAD"
        ? undefined
        : await request.arrayBuffer();
    let response = await sendBackendRequest(method, path, headers, body);
    let renewedTokens = null;

    if (response.status === 401 && refreshToken) {
      renewedTokens = await refreshSession(refreshToken);

      if (renewedTokens?.accessToken) {
        headers.set("Authorization", `Bearer ${renewedTokens.accessToken}`);
        response = await sendBackendRequest(method, path, headers, body);
      }
    }
    const responseBody =
      response.status === 204 ? null : await response.arrayBuffer();
    const responseHeaders = new Headers();
    ["content-type", "content-disposition", "cache-control"].forEach(
      (headerName) => {
        const value = response.headers.get(headerName);
        if (value) responseHeaders.set(headerName, value);
      },
    );

    const proxyResponse = new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });

    if (renewedTokens?.accessToken) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      };

      proxyResponse.cookies.set("accessToken", renewedTokens.accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24,
      });

      if (renewedTokens.refreshToken) {
        proxyResponse.cookies.set("refreshToken", renewedTokens.refreshToken, {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 7,
        });
      }
    }

    if (response.status === 401 && refreshToken && !renewedTokens) {
      proxyResponse.cookies.delete("accessToken");
      proxyResponse.cookies.delete("refreshToken");
      proxyResponse.cookies.delete("userRole");
    }

    return proxyResponse;
  } catch (error) {
    console.error(`Backend request failed for ${path}:`, error);
    return NextResponse.json(
      { message: "Unable to connect to the backend service." },
      { status: 502 },
    );
  }
}
