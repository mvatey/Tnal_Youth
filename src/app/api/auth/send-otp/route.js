const BACKEND_URL =
  process.env.BACKEND_API_URL || "http://localhost:8081/api";

export async function POST(req) {
  try {
    const body = await req.json();

    const phoneOrEmail = body.phoneOrEmail?.trim();

    if (!phoneOrEmail) {
      return Response.json(
        {
          message: "សូមបញ្ចូលលេខទូរស័ព្ទ ឬ អ៊ីមែល",
        },
        { status: 400 }
      );
    }

    const deliveryChannel = phoneOrEmail.includes("@")
      ? "EMAIL"
      : "SMS";

    const backendEndpoint =
      `${BACKEND_URL}/auth/forgot-password`;

    console.log("Calling backend:", backendEndpoint);

    const response = await fetch(backendEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneOrEmail,
        deliveryChannel,
      }),
      cache: "no-store",
    });

    const responseText = await response.text();

    let data = {};

    try {
      data = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      data = {
        message:
          responseText || "Backend returned an invalid response",
      };
    }

    return Response.json(
      {
        ...data,
        message:
          data.message ||
          data.error ||
          data.detail ||
          `Request failed with status ${response.status}`,
      },
      {
        status: response.status,
      }
    );
  } catch (error) {
    console.error("Send OTP proxy error:", error);

    const isConnectionRefused =
      error?.cause?.code === "ECONNREFUSED" ||
      error?.code === "ECONNREFUSED";

    return Response.json(
      {
        message: isConnectionRefused
          ? "Backend server is not running on port 8081"
          : "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ",
      },
      {
        status: 503,
      }
    );
  }
}