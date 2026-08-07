import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ??
  "http://localhost:8081/api";

async function parseJsonSafely(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export async function GET(
  request,
  { params }
) {
  try {
    const { memberId } = await params;

    const authorization =
      request.headers.get("authorization");

    const response = await fetch(
      `${BACKEND_URL}/members/${memberId}/account/status`,
      {
        method: "GET",
        headers: {
          ...(authorization
            ? {
                Authorization: authorization,
              }
            : {}),

          Cookie:
            request.headers.get("cookie") ?? "",
        },
        cache: "no-store",
      }
    );

    const data =
      await parseJsonSafely(response);

    return NextResponse.json(
      data ?? {},
      {
        status: response.status,
      }
    );
  } catch (error) {
    console.error(
      "Account status proxy error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to connect to the backend.",
      },
      {
        status: 500,
      }
    );
  }
}