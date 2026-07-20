import Link from "next/link";
import NotFoundPage from "@/components/errors/NotFoundPage";

export default function UnauthorizedPage() {
  return (
    <div>
      <NotFoundPage
        title="អ្នកមិនទាន់បានចូលប្រព័ន្ធ"
        message="សូមចូលប្រព័ន្ធជាមុនសិន ដើម្បីចូលប្រើទំព័រនេះ។"
      />

      <div className="mt-6 flex justify-center">
        <Link
          href="/auth/login"
          className="rounded-lg bg-primary px-5 py-3 text-white"
        >
          ចូលប្រព័ន្ធ
        </Link>
      </div>
    </div>
  );
}