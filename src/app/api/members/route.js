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

export async function POST(request) {
  try {
    const body = await request.json();

    const authorization =
      request.headers.get("authorization");

    const response = await fetch(
      `${BACKEND_URL}/members`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          ...(authorization
            ? {
                Authorization: authorization,
              }
            : {}),

          Cookie:
            request.headers.get("cookie") ?? "",
        },
        body: JSON.stringify(body),
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
      "Create member proxy error:",
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