import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/apiErrorResponse";

/*
 * Hands a large-file upload flow a short-lived way to call the backend
 * directly, bypassing the Vercel Edge proxy -- that proxy caps every
 * request body at Vercel's own ~4.5MB platform ceiling regardless of any
 * client or backend setting, which is too small for real documents.
 *
 * The access token normally never leaves this server (it's an httpOnly
 * cookie specifically so client JS can't read it). This route is a
 * narrow, deliberate exception: it hands the SAME token to client JS,
 * for the single purpose of attaching it to one direct upload request to
 * the backend's own HTTPS origin (CORS-restricted to this app's own
 * domain). It is never written to storage, only held in memory for the
 * duration of that fetch.
 */
export async function GET(request) {
  const accessToken =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("access_token")?.value ||
    request.cookies.get("token")?.value;

  if (!accessToken) {
    return apiErrorResponse(
      "UNAUTHENTICATED",
      "សម័យចូលប្រើរបស់អ្នកផុតកំណត់ហើយ។ សូមចូលប្រើម្ដងទៀត។",
      401,
    );
  }

  return NextResponse.json({ accessToken });
}
