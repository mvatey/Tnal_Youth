// app/api/auth/send-otp/route.js
import { findUserByPhone, generateOtp } from "@/lib/auth";

export async function POST(req) {
  const { phone } = await req.json();
  const user = findUserByPhone(phone);

  if (!user) {
    return Response.json({ message: "រកមិនឃើញលេខទូរស័ព្ទនេះទេ" }, { status: 404 });
  }

  generateOtp(phone); // logs code to your terminal instead of sending real SMS
  return Response.json({ message: "OTP sent (check terminal)" });
}