import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

async function readResponse(response) {
  const text = await response.text();

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

export async function POST(request) {
  try {
    const body = await request.json();

    const phoneOrEmail = String(
      body.phoneOrEmail ||
        body.phone ||
        body.email ||
        "",
    ).trim();

    const otp = String(
      body.otp ||
        body.code ||
        "",
    ).trim();

    const newPassword = String(
      body.newPassword ||
        body.password ||
        "",
    );

    if (!phoneOrEmail) {
      return NextResponse.json(
        {
          message:
            "រកមិនឃើញលេខទូរស័ព្ទ ឬអ៊ីមែល",
        },
        {
          status: 400,
        },
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          message:
            "លេខកូដ OTP មិនត្រឹមត្រូវ",
        },
        {
          status: 400,
        },
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        {
          message:
            "សូមបញ្ចូលលេខសម្ងាត់ថ្មី",
        },
        {
          status: 400,
        },
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/auth/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          phoneOrEmail,
          otp,
          newPassword,
        }),
        cache: "no-store",
      },
    );

    const data = await readResponse(
      backendResponse,
    );

    console.log("RESET PASSWORD BACKEND RESPONSE:", {
      status: backendResponse.status,
      phoneOrEmail,
      otpLength: otp.length,
      data,
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            data?.error ||
            data?.detail ||
            data?.errors?.[0]?.message ||
            "មិនអាចប្ដូរលេខសម្ងាត់បាន",
        },
        {
          status: backendResponse.status,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          data?.message ||
          "លេខសម្ងាត់ត្រូវបានប្ដូរដោយជោគជ័យ",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Reset password route error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "មានបញ្ហាក្នុងការប្ដូរលេខសម្ងាត់",
      },
      {
        status: 500,
      },
    );
  }
}