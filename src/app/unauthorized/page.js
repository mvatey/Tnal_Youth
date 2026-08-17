// src/app/unauthorized/page.jsx

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-page-gray px-4">
      <div className="w-full max-w-md rounded-2xl bg-bg-page-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-error-bg text-error">
          <ShieldAlert size={28} />
        </div>

        <h1 className="mb-2 text-xl font-bold text-text-primary">
          មិនមានសិទ្ធិចូលប្រើ
        </h1>

        <p className="mb-6 text-sm text-text-mute">
          សូមចូលគណនីជាមុន ឬប្រើគណនីដែលមានសិទ្ធិត្រឹមត្រូវ។
        </p>

        <Link
          href="/auth/login"
          className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          ចូលប្រើប្រាស់
        </Link>
      </div>
    </main>
  );
}