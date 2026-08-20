import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8081/api";

const REFRESH_BEFORE_EXPIRY_SECONDS = 120;

function parseJsonSafely(text) {
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getJwtExpiry(token) {
  try {
    const payload = token?.split(".")?.[1];
    if (!payload) return 0;

    const normalized = payload.replaceAll("-", "+").replaceAll("_", "/");
    const decoded = JSON.parse(
      Buffer.from(normalized, "base64").toString("utf8"),
    );

    return Number(decoded?.exp) || 0;
  } catch {
    return 0;
  }
}

function clearAuthenticationCookies(cookieStore) {
  [
    "accessToken",
    "access_token",
    "token",
    "refreshToken",
    "refresh_token",
    "rememberSession",
    "userRole",
  ].forEach((name) => cookieStore.delete(name));
}

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken =
    cookieStore.get("refreshToken")?.value ||
    cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    clearAuthenticationCookies(cookieStore);
    return Response.json(
      { success: false, message: "No refresh session is available." },
      { status: 401 },
    );
  }

  const expiresAt = getJwtExpiry(accessToken);
  const now = Math.floor(Date.now() / 1000);

  if (expiresAt > now + REFRESH_BEFORE_EXPIRY_SECONDS) {
    return Response.json({ success: true, refreshed: false });
  }

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    const body = parseJsonSafely(await backendResponse.text());

    if (!backendResponse.ok) {
      if (backendResponse.status === 401 || backendResponse.status === 403) {
        clearAuthenticationCookies(cookieStore);
      }

      return Response.json(
        { success: false, message: body?.message || "Session refresh failed." },
        { status: backendResponse.status },
      );
    }

    const newAccessToken =
      body?.accessToken || body?.access_token || body?.data?.accessToken;
    const newRefreshToken =
      body?.refreshToken || body?.refresh_token || body?.data?.refreshToken;

    if (!newAccessToken || !newRefreshToken) {
      return Response.json(
        { success: false, message: "Backend returned an incomplete session." },
        { status: 502 },
      );
    }

    const rememberSession = cookieStore.get("rememberSession")?.value === "1";
    const commonOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    cookieStore.set("accessToken", newAccessToken, {
      ...commonOptions,
      ...(rememberSession ? { maxAge: 60 * 60 * 24 } : {}),
    });
    cookieStore.set("refreshToken", newRefreshToken, {
      ...commonOptions,
      ...(rememberSession ? { maxAge: 60 * 60 * 24 * 7 } : {}),
    });

    return Response.json({ success: true, refreshed: true });
  } catch (error) {
    console.error("Session refresh proxy error:", error);
    return Response.json(
      { success: false, message: "Unable to connect to the backend service." },
      { status: 502 },
    );
  }
}
