// app/api/auth/login/route.js
import { verifyCredentials } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
  const { phone, password } = await req.json();
  const user = verifyCredentials(phone, password);

  if (!user) {
    return Response.json({ message: "លេខទូរស័ព្ទ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ" }, { status: 401 });
  }

  const token = Buffer.from(JSON.stringify({ id: user.id, role: user.role })).toString("base64");

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ role: user.role, name: user.name });
}