"use client";

import { useEffect, useState } from "react";

export default function useUsdKhrExchangeRate(date = null) {
  const [rate, setRate] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const endpoint = date
      ? `/api/backend/exchange-rates/date/${encodeURIComponent(date)}?from=USD&to=KHR`
      : "/api/backend/exchange-rates/current?from=USD&to=KHR";

    fetch(endpoint, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) {
          throw new Error(body?.message || `Request failed (${response.status})`);
        }
        return body?.data ?? body;
      })
      .then((data) => {
        if (!cancelled) {
          const value = Number(data?.rate);
          setRate(Number.isFinite(value) && value > 0 ? value : null);
        }
      })
      .catch(() => {
        if (!cancelled) setRate(null);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  return rate;
}
