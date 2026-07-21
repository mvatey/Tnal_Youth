// app/api/auth/reset-password/route.js
import fs from "fs";
import path from "path";
import { verifyResetToken } from "@/lib/auth";

const usersPath = path.join(process.cwd(), "src", "data", "users.json");

export async function POST(req) {
  const { token, password } = await req.json();
  const phone = verifyResetToken(token);

  if (!phone) {
    return Response.json({ message: "Token មិនត្រឹមត្រូវ ឬហួសសម័យ" }, { status: 400 });
  }

  const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
  const idx = users.findIndex((u) => u.phone === phone);
  if (idx === -1) {
    return Response.json({ message: "រកមិនឃើញអ្នកប្រើប្រាស់" }, { status: 404 });
  }

  users[idx].password = password;
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  return Response.json({ message: "លេខសម្ងាត់ត្រូវបានប្តូរដោយជោគជ័យ" });
}