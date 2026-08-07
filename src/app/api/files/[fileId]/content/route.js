import { cookies } from "next/headers";

const API_URL = process.env.BACKEND_API_URL || "http://localhost:8081/api";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export async function GET(request, { params }) {
  const { fileId } = await params;
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) return Response.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const metadataResponse = await fetch(`${API_URL}/files/${encodeURIComponent(fileId)}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!metadataResponse.ok) return new Response(await metadataResponse.text(), { status: metadataResponse.status });

    const metadata = await metadataResponse.json();
    const filePath = metadata.file_path || metadata.filePath;
    if (!filePath) return Response.json({ message: "File path is unavailable" }, { status: 404 });

    const normalizedPath = filePath.replace(/\\/g, "/").replace(/^\/?uploads\//, "");
    const fileUrl = new URL(normalizedPath, `${BACKEND_ORIGIN}/uploads/`);
    const fileResponse = await fetch(fileUrl, { cache: "no-store" });
    if (!fileResponse.ok) return Response.json({ message: "File content is unavailable" }, { status: fileResponse.status });

    return new Response(fileResponse.body, {
      status: 200,
      headers: {
        "Content-Type": fileResponse.headers.get("content-type") || metadata.mime_type || "application/octet-stream",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(metadata.original_name || metadata.originalName || `file-${fileId}`)}`,
      },
    });
  } catch (error) {
    console.error("File content proxy error:", error);
    return Response.json({ message: "Could not open the file" }, { status: 502 });
  }
}
