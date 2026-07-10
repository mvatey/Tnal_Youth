"use client";

import { useEffect } from "react";
import NotFoundPage from "@/components/errors/NotFoundPage";

export default function ErrorPage({ error }) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <NotFoundPage
      title="សូមអភ័យទោស!"
      message="ទំព័រនេះមិនអាចដំណើរការបានទេ ដោយសារមានបញ្ហាបច្ចេកទេស។ សូមត្រឡប់ទៅទំព័រមុន ហើយព្យាយាមម្ដងទៀត។"
    />
  );
}