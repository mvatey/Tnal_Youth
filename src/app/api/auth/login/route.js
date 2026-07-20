// src/app/api/auth/login/route.js
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL || "http://localhost:8081/api";

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneOrEmail: body.phone,
        password: body.password,
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          message:
            data.message ||
            "លេខទូរស័ព្ទ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ",
        },
        { status: response.status }
      );
    }

    const accessToken =
      data.accessToken ||
      data.access_token ||
      data.data?.accessToken ||
      data.data?.access_token;

    const refreshToken =
      data.refreshToken ||
      data.refresh_token ||
      data.data?.refreshToken ||
      data.data?.refresh_token;

    if (!accessToken) {
      return Response.json(
        { message: "Backend did not return an access token" },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    if (refreshToken) {
      cookieStore.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Login proxy error:", error);

    return Response.json(
      { message: "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ" },
      { status: 500 }
    );
  }
}