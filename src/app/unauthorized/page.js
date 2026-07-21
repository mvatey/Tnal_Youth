import Link from "next/link";
import NotFoundPage from "@/components/errors/NotFoundPage";

export default function UnauthorizedPage() {
  return (
    <div className="relative min-h-screen">
      <NotFoundPage
        title="អ្នកមិនទាន់បានចូលប្រព័ន្ធ"
        message="សូមចូលប្រព័ន្ធជាមុនសិន ដើម្បីចូលប្រើទំព័រនេះ។"
      />

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <Link
          href="/auth/login"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white"
        >
          ចូលប្រព័ន្ធ
        </Link>
      </div>
    </div>
  );
}