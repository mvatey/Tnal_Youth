import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

async function forward(response) {
  const text = await response.text();
  return new Response(text, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ||
        "application/json",
    },
  });
}

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}

async function proxy(request, context, method) {
  const { memberId } = await context.params;
  const token = await getToken();

  if (!token) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.text();
    const response = await fetch(
      `${BACKEND_URL}/members/${memberId}/personal-info/branches`,
      {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
        cache: "no-store",
      },
    );

    return forward(response);
  } catch (error) {
    console.error(
      `Member branch assignment ${method} proxy:`,
      error,
    );

    return Response.json(
      { message: "Could not update branch assignments" },
      { status: 502 },
    );
  }
}

export async function POST(request, context) {
  return proxy(request, context, "POST");
}

export async function PUT(request, context) {
  return proxy(request, context, "PUT");
}
