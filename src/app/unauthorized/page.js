// src/app/unauthorized/page.jsx

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert size={28} />
        </div>

        <h1 className="mb-2 text-xl font-bold text-slate-900">
          មិនមានសិទ្ធិចូលប្រើ
        </h1>

        <p className="mb-6 text-sm text-slate-500">
          សូមចូលគណនីជាមុន ឬប្រើគណនីដែលមានសិទ្ធិត្រឹមត្រូវ។
        </p>

        <Link
          href="/auth/login"
          className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          ចូលប្រើប្រាស់
        </Link>
      </div>
    </main>
  );
}