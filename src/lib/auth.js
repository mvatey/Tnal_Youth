// lib/auth.js
import fs from "fs";
import path from "path";

const usersPath = path.join(process.cwd(), "src", "data", "users.json");

function getUsers() {
  const data = fs.readFileSync(usersPath, "utf-8");
  return JSON.parse(data);
}

export function verifyCredentials(identifier, password) {
  const users = getUsers();
  const user = users.find(
    (u) => (u.phone === identifier || u.email === identifier) && u.password === password
  );
  return user || null;
}

export function findUserByPhone(phone) {
  const users = getUsers();
  return users.find((u) => u.phone === phone) || null;
}

// Simple in-memory OTP store (resets when server restarts — fine for mockup)
const otpStore = new Map();

export function generateOtp(phone) {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  otpStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 min expiry
  console.log(`[MOCK OTP] ${phone} → ${code}`); // 👈 check your terminal for the code
  return code;
}

export function verifyOtp(phone, code) {
  const entry = otpStore.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) return false;
  return entry.code === code;
}

// Simple in-memory reset-token store
const resetTokens = new Map();

export function createResetToken(phone) {
  const token = Math.random().toString(36).slice(2);
  resetTokens.set(token, { phone, expiresAt: Date.now() + 10 * 60 * 1000 });
  return token;
}

export function verifyResetToken(token) {
  const entry = resetTokens.get(token);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.phone;
}