// src/app/api/auth/reset-password/route.js

const BACKEND_URL =
  process.env.BACKEND_API_URL || "http://localhost:8081/api";

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch(
      `${BACKEND_URL}/auth/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneOrEmail: body.phoneOrEmail,
          otp: body.otp,
          newPassword: body.newPassword,
        }),
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({}));

    return Response.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Reset password proxy error:", error);

    return Response.json(
      {
        message: "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ",
      },
      { status: 500 }
    );
  }
}