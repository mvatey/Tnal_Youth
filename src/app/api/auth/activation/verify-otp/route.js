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

    const otp =
      String(body.otp || "").trim();

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

    if (!/^\d{6}$/.test(otp)) {
      return Response.json(
        {
          message:
            "សូមបញ្ចូលលេខកូដ OTP ៦ ខ្ទង់",
        },
        {
          status: 400,
        }
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/auth/activation/verify-otp`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneOrEmail,
          otp,
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
      "Activation OTP verification proxy error:",
      error
    );

    return Response.json(
      {
        message:
          "មិនអាចផ្ទៀងផ្ទាត់លេខកូដ OTP បានទេ",
      },
      {
        status: 500,
      }
    );
  }
}