"use client";

import { useEffect } from "react";
import NotFoundPage from "@/components/errors/NotFoundPage";
import { useLanguage } from "@/context/LanguageContext";

export default function GlobalError({ error }) {
  const { t, locale } = useLanguage();

  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang={locale}>
      <body>
        <NotFoundPage
          title={t("errors.sorry")}
          message={t("errors.appCrashed")}
        />
      </body>
    </html>
  );
}
