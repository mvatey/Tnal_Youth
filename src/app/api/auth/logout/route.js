import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8081/api";

const AUTH_COOKIE_NAMES = [
  "accessToken",
  "access_token",
  "token",
  "refreshToken",
  "refresh_token",
  "rememberSession",
  "userRole",
];

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken =
    cookieStore.get("refreshToken")?.value ||
    cookieStore.get("refresh_token")?.value;

  let sessionRevoked = !refreshToken;

  try {
    if (refreshToken) {
      const response = await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });

      sessionRevoked = response.ok;

      if (!response.ok) {
        console.warn(`Backend logout returned status ${response.status}`);
      }
    }
  } catch (error) {
    console.error("Backend logout request failed:", error);
  } finally {
    AUTH_COOKIE_NAMES.forEach((name) => cookieStore.delete(name));
  }

  return Response.json({
    success: true,
    sessionRevoked,
    message: "Logged out successfully",
  });
}
