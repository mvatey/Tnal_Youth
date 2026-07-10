"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage({
  title = "សូមអភ័យទោស!",
  message = "ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមាន ឬមិនអាចបង្ហាញបានទេ។ សូមពិនិត្យតំណភ្ជាប់ ឬត្រឡប់ទៅទំព័រមុន។",
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5">
      <div className="w-full max-w-[620px] text-center">
        <h1 className="text-xl font-bold text-[#4b3192]">
          {title}
        </h1>

        <div className="relative mx-auto mt-8 flex h-[170px] items-center justify-center">
          <span className="text-[160px] font-black leading-none text-[#c91b1f]">
            404
          </span>

          <div className="absolute bottom-0 left-1/2 h-px w-[360px] max-w-full -translate-x-1/2 bg-gray-200" />
        </div>

        <p className="mx-auto mt-6 max-w-[560px] text-sm leading-7 text-gray-500">
          {message}
        </p>

        <button
          type="button"
          onClick={() => router.back()}
          className="mx-auto mt-10 flex h-11 w-[240px] items-center justify-center gap-2 rounded-lg bg-[#4b3192] text-sm font-semibold text-white transition hover:bg-[#3d2877]"
        >
          <ArrowLeft size={17} />
          ត្រឡប់
        </button>
      </div>
    </div>
  );
}