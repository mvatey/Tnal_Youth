import { cookies } from "next/headers";
import { apiErrorResponse } from "@/lib/apiErrorResponse";

// Runs at the edge (near the visitor / near the ap-southeast-1 backend)
// instead of Vercel's default iad1 (US East) Node function region --
// removes cold starts and the extra Virginia<->Singapore round trip that
// otherwise applies to every proxied backend call from this route.
export const runtime = "edge";

const API_URL =
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8081/api";

// File metadata (originalName, mimeType, sizeBytes, ...) -- sibling of
// content/route.js, which streams the raw bytes. A caller that needs to
// know a stored file's real name/type (e.g. to decide how to preview it)
// without downloading the whole file uses this instead.
export async function GET(request, { params }) {
  const { fileId } = await params;
  if (!/^\d+$/.test(String(fileId))) {
    return apiErrorResponse("INVALID_FILE_ID", "Invalid file ID.", 400);
  }
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) {
    return apiErrorResponse(
      "UNAUTHENTICATED",
      "សូមចូលប្រើគណនីជាមុនសិន។",
      401,
    );
  }

  try {
    const response = await fetch(
      `${API_URL}/files/${encodeURIComponent(fileId)}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("File metadata proxy error:", error);
    return apiErrorResponse(
      "BACKEND_UNAVAILABLE",
      "មិនអាចភ្ជាប់ទៅកាន់សេវាកម្មឯកសារបានទេ។",
      502,
    );
  }
}
