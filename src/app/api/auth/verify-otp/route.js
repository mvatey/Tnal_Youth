// app/api/auth/verify-otp/route.js
import { verifyOtp, createResetToken } from "@/lib/auth";

export async function POST(req) {
  const { phone, code } = await req.json();

  if (!verifyOtp(phone, code)) {
    return Response.json({ message: "លេខកូដមិនត្រឹមត្រូវ ឬហួសសម័យ" }, { status: 400 });
  }

  const resetToken = createResetToken(phone);
  return Response.json({ resetToken });
}