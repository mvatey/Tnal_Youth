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

    if (!phoneOrEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែល",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Keep the old behavior:
     * email address -> EMAIL
     * phone number -> SMS
     */
    const deliveryChannel = phoneOrEmail.includes("@")
      ? "EMAIL"
      : "SMS";

    const backendResponse = await fetch(
      `${BACKEND_URL}/auth/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          phoneOrEmail,
          deliveryChannel,
        }),
        cache: "no-store",
      },
    );

    const data = await readResponse(backendResponse);

    if (!backendResponse.ok) {
      console.error("OTP backend error:", {
        status: backendResponse.status,
        deliveryChannel,
        message: data?.message,
      });

      return NextResponse.json(
        {
          success: false,
          deliveryChannel,
          message:
            data?.message ||
            "ប្រតិបត្តិការផ្ញើ OTP មិនជោគជ័យ",
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
        deliveryChannel,
        message:
          data?.message ||
          (deliveryChannel === "EMAIL"
            ? "OTP ត្រូវបានផ្ញើទៅអ៊ីមែលដោយជោគជ័យ"
            : "OTP ត្រូវបានផ្ញើទៅលេខទូរស័ព្ទដោយជោគជ័យ"),
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Send OTP route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ប្រតិបត្តិការផ្ញើ OTP មិនជោគជ័យ",
      },
      {
        status: 500,
      },
    );
  }
}