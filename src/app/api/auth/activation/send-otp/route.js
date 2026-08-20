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

export async function POST(request) {
  try {
    const body = await request.json();

    const phoneOrEmail =
      body.phoneOrEmail?.trim();

    if (!phoneOrEmail) {
      return Response.json(
        {
          message:
            "សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែល",
        },
        {
          status: 400,
        }
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/auth/activation/send-otp`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneOrEmail,
        }),
        cache: "no-store",
      }
    );

    const responseText =
      await backendResponse.text();

    const responseData =
      parseJsonSafely(responseText);

    return Response.json(responseData, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error(
      "Send activation OTP proxy error:",
      error
    );

    return apiErrorResponse(
      "BACKEND_UNAVAILABLE",
      "មិនអាចផ្ញើលេខកូដ OTP បានទេ",
      502,
    );
  }
}
import { apiErrorResponse } from "@/lib/apiErrorResponse";
