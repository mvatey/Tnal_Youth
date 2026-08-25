"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFoundPage({
  title,
  message,
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const displayTitle = title ?? t("errors.sorry");
  const displayMessage = message ?? t("errors.notFound");

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page-white px-5">
      <div className="w-full max-w-[620px] text-center">
        <h1 className="text-xl font-bold text-[#4b3192]">
          {displayTitle}
        </h1>

        <div className="relative mx-auto mt-8 flex h-[170px] items-center justify-center">
          <span className="text-[160px] font-black leading-none text-[#c91b1f]">
            404
          </span>

          <div className="absolute bottom-0 left-1/2 h-px w-[360px] max-w-full -translate-x-1/2 bg-border" />
        </div>

        <p className="mx-auto mt-6 max-w-[560px] text-sm leading-7 text-text-mute">
          {displayMessage}
        </p>

        <button
          type="button"
          onClick={() => router.back()}
          className="mx-auto mt-10 flex h-11 w-[240px] items-center justify-center gap-2 rounded-lg bg-[#4b3192] text-sm font-semibold text-white transition hover:bg-[#3d2877]"
        >
          <ArrowLeft size={17} />
          {t("errors.back")}
        </button>
      </div>
    </div>
  );
}
