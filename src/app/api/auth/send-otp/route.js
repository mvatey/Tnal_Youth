const BACKEND_URL =
  process.env.BACKEND_API_URL || "http://localhost:8081/api";

export async function POST(req) {
  try {
    const body = await req.json();

    const phoneOrEmail =
      body.phoneOrEmail?.trim() || "";

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

    const response = await fetch(
      `${BACKEND_URL}/auth/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneOrEmail,
          deliveryChannel,
        }),
      }
    );

    const data = await response.json().catch(() => ({}));

    return Response.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}