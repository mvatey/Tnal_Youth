// src/app/api/auth/verify-otp/route.js

const BACKEND_URL =
  process.env.BACKEND_API_URL || "http://localhost:8081/api";

export async function POST(req) {
  try {
    const body = await req.json();

    const phoneOrEmail =
      body.phoneOrEmail ||
      body.phone ||
      body.email;

    const otp =
      body.otp ||
      body.code;

    const response = await fetch(
      `${BACKEND_URL}/auth/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneOrEmail,
          otp,
        }),
        cache: "no-store",
      }
    );

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return Response.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Verify OTP proxy error:", error);

    return Response.json(
      {
        success: false,
        message: "មិនអាចផ្ទៀងផ្ទាត់ OTP បានទេ",
      },
      { status: 500 }
    );
  }
}