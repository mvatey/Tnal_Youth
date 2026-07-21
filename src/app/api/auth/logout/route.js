// src/app/api/auth/logout/route.js

import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("userRole");

  return Response.json({
    success: true,
    message: "Logged out successfully",
  });
}