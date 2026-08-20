import { cookies } from "next/headers";
import { apiErrorResponse } from "@/lib/apiErrorResponse";

const API_URL =
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8081/api";

export async function GET(request, { params }) {
  const { fileId } = await params;
  if (!/^\d+$/.test(String(fileId))) {
    return apiErrorResponse("INVALID_FILE_ID", "Invalid file ID.", 400);
  }
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) {
    return apiErrorResponse(
      "UNAUTHENTICATED",
      "Authentication is required.",
      401,
    );
  }

  try {
    const fileResponse = await fetch(
      `${API_URL}/files/${encodeURIComponent(fileId)}/content`,
      {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!fileResponse.ok) {
      return new Response(await fileResponse.text(), {
        status: fileResponse.status,
        headers: {
          "Content-Type":
            fileResponse.headers.get("content-type") ||
            "application/json",
        },
      });
    }

    return new Response(fileResponse.body, {
      status: 200,
      headers: {
        "Content-Type":
          fileResponse.headers.get("content-type") ||
          "application/octet-stream",
        "Content-Disposition":
          fileResponse.headers.get("content-disposition") ||
          "inline",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("File content proxy error:", error);
    return apiErrorResponse(
      "BACKEND_UNAVAILABLE",
      "Could not connect to the file service.",
      502,
    );
  }
}
