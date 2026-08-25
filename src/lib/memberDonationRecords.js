export function unwrapDonationPage(payload) {
  const data = payload?.data ?? payload ?? {};
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: Number.isFinite(Number(data?.total)) ? Number(data.total) : 0,
  };
}

export async function fetchAllDonationRecords(baseUrl, signal) {
  const items = [];
  let page = 0;
  let total = Number.POSITIVE_INFINITY;

  while (items.length < total) {
    const joiner = baseUrl.includes("?") ? "&" : "?";
    const response = await fetch(
      `${baseUrl}${joiner}page=${page}&size=100`,
      { cache: "no-store", signal },
    );

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        payload?.message ||
        payload?.detail ||
        "មិនអាចទាញយកកំណត់ត្រាវិភាគទានបានទេ។",
      );
    }

    const pageData = unwrapDonationPage(payload);
    items.push(...pageData.items);
    total = pageData.total || items.length;

    if (pageData.items.length === 0) break;
    page += 1;
  }

  return items;
}

export function donationAmounts(item) {
  const parts = [];
  const amountUsd = Number(item?.amountUsd || 0);
  const amountKhr = Number(item?.amountKhr || 0);

  if (amountUsd > 0) parts.push(`$${amountUsd.toFixed(2)}`);
  if (amountKhr > 0) parts.push(`${amountKhr.toLocaleString()} ៛`);

  return parts.join(" / ") || "$0.00";
}

export function mapDonationRecord(item) {
  const period = item?.donationPeriod
    ? new Date(`${item.donationPeriod}T00:00:00`)
    : item?.paidAt
      ? new Date(item.paidAt)
      : null;

  return {
    id: item?.id,
    month: period
      ? period.toLocaleString("km-KH", { month: "long" })
      : "-",
    year: period?.getFullYear() || "-",
    amount: donationAmounts(item),
    date: item?.paidAt
      ? new Date(item.paidAt).toLocaleDateString("km-KH")
      : "-",
    recordedBy:
      item?.recordedByName ||
      item?.recordedBy?.fullNameKm ||
      item?.recordedBy?.fullNameEn ||
      "-",
    paymentMethod:
      item?.paymentMethodLabelKm ||
      item?.paymentMethodLabelEn ||
      item?.paymentMethodCode ||
      item?.paymentMethod?.labelKm ||
      item?.paymentMethod?.labelEn ||
      item?.paymentMethod?.code ||
      "-",
    raw: item,
  };
}

export function normalizeDonationTypeCode(item) {
  return String(
    item?.typeCode ||
    item?.donationType?.code ||
    "",
  ).trim().toUpperCase();
}

export function filterOwnDonationType(items, typeCode) {
  const normalized = String(typeCode || "").trim().toUpperCase();
  return items.filter((item) => normalizeDonationTypeCode(item) === normalized);
}

function paymentMethodKind(item) {
  const code = String(
    item?.paymentMethodCode || item?.paymentMethod?.code || "",
  ).trim().toUpperCase().replace(/[\s-]+/g, "_");

  const label = String(
    item?.paymentMethodLabelEn ||
    item?.paymentMethod?.labelEn ||
    item?.paymentMethodLabelKm ||
    item?.paymentMethod?.labelKm ||
    "",
  ).trim().toUpperCase();

  if (code === "CASH" || label === "CASH") return "CASH";
  if (code.includes("MATERIAL") || label.includes("MATERIAL")) return "MATERIAL";
  return code ? "BANK" : "OTHER";
}

export function summarizeDonationRecords(items, typeCode) {
  const rows = filterOwnDonationType(items, typeCode);

  return rows.reduce(
    (summary, item) => {
      const kind = paymentMethodKind(item);
      summary.donationCount += 1;
      summary.totalDonationKhr += Number(item?.amountKhr || 0);
      summary.totalDonationUsd += Number(item?.amountUsd || 0);
      if (kind === "CASH") summary.cashPaymentCount += 1;
      if (kind === "BANK") summary.bankPaymentCount += 1;
      if (kind === "MATERIAL") summary.materialDonationCount += 1;
      return summary;
    },
    {
      donationCount: 0,
      totalDonationKhr: 0,
      totalDonationUsd: 0,
      cashPaymentCount: 0,
      bankPaymentCount: 0,
      materialDonationCount: 0,
    },
  );
}
