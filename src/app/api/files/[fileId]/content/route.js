import { cookies } from "next/headers";

const API_URL = process.env.BACKEND_API_URL || "http://localhost:8081/api";

export async function GET(request, { params }) {
  const { fileId } = await params;
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) return Response.json({ message: "Unauthorized" }, { status: 401 });

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
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("File content proxy error:", error);
    return Response.json({ message: "Could not open the file" }, { status: 502 });
  }
}
