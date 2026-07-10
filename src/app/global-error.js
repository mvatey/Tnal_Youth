"use client";

import { useEffect } from "react";
import NotFoundPage from "@/components/errors/NotFoundPage";

export default function GlobalError({ error }) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="km">
      <body>
        <NotFoundPage
          title="សូមអភ័យទោស!"
          message="កម្មវិធីមិនអាចដំណើរការបានទេ ដោយសារមានបញ្ហាបច្ចេកទេស។ សូមត្រឡប់ទៅទំព័រមុន។"
        />
      </body>
    </html>
  );
}