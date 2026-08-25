"use client";

import { useEffect } from "react";
import NotFoundPage from "@/components/errors/NotFoundPage";
import { useLanguage } from "@/context/LanguageContext";

export default function ErrorPage({ error }) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <NotFoundPage
      title={t("errors.sorry")}
      message={t("errors.pageCrashed")}
    />
  );
}
