import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

function parseJsonSafely(text) {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return Response.json(
        {
          message: "Unauthenticated",
        },
        {
          status: 401,
        }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/auth/me`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    const text = await response.text();
    const data = parseJsonSafely(text);

    if (!response.ok) {
      return Response.json(
        {
          message:
            data.message ||
            "មិនអាចទាញយកព័ត៌មានអ្នកប្រើប្រាស់បានទេ",
        },
        {
          status: response.status,
        }
      );
    }

    return Response.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("Current user proxy error:", error);

    return Response.json(
      {
        message:
          "មិនអាចទាញយកព័ត៌មានអ្នកប្រើប្រាស់បានទេ",
      },
      {
        status: 500,
      }
    );
  }
}