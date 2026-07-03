// app/api/auth/login/route.js
import { cookies } from "next/headers";

export async function POST(req) {
  const { phone, password } = await req.json();

  // call your backend / check DB
  const user = await verifyCredentials(phone, password);

  if (!user) {
    return Response.json({ message: "Invalid phone or password" }, { status: 401 });
  }

  const token = await createSessionToken(user); // e.g. JWT

  cookies().set("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return Response.json({ role: user.role });
}