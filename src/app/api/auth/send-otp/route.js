// src/app/api/auth/send-otp/route.js

const BACKEND_URL =
  process.env.BACKEND_API_URL || "http://127.0.0.1:8081/api";

export async function POST(req) {
  try {
    const body = await req.json();

    const phoneOrEmail =
      body.phoneOrEmail ||
      body.phone ||
      body.email;

    if (!phoneOrEmail) {
      return Response.json(
        {
          success: false,
          message: "សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែល",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/auth/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneOrEmail,
          deliveryChannel: body.deliveryChannel || "SMS",
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
    console.error("Send OTP proxy error:", error);

    return Response.json(
      {
        success: false,
        message: "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ",
      },
      { status: 500 }
    );
  }
}