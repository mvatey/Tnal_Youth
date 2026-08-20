import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/apiErrorResponse";

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

    if (!phoneOrEmail) {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
          message:
            "សូមបញ្ចូលលេខកូដ OTP ចំនួន ៦ ខ្ទង់",
        },
        {
          status: 400,
        },
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/auth/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          phoneOrEmail,
          otp,
        }),
        cache: "no-store",
      },
    );

    const data = await readResponse(
      backendResponse,
    );

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            data?.message ||
            "លេខកូដ OTP មិនត្រឹមត្រូវ",
        },
        {
          status: backendResponse.status,
        },
      );
    }

    return NextResponse.json(
      {
        ...data,
        success: true,
        phoneOrEmail,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Verify OTP route error:",
      error,
    );

    return apiErrorResponse(
      "BACKEND_UNAVAILABLE",
      "មិនអាចផ្ទៀងផ្ទាត់លេខកូដ OTP បាន",
      502,
    );
  }
}
