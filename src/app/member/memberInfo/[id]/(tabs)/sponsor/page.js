"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { HandCoins } from "lucide-react";

import DataTable from "@/components/table/DataTable";
import { downloadTableAsExcel } from "@/utils/downloadExcel";
export default function SponsorDonationPage() {
  const { id } = useParams();
  const [sponsors, setSponsors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadSponsorDonations() {
      try {
        setIsLoading(true);
        setError("");

        const items = [];
        let page = 0;
        let total = Number.POSITIVE_INFINITY;

        while (items.length < total) {
          const response = await fetch(
            `/api/backend/donations?memberId=${encodeURIComponent(id)}&page=${page}&size=100`,
            { cache: "no-store", signal: controller.signal },
          );
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(payload.message || "Unable to load activity donations.");
          }

          const pageData = payload.data || payload;
          const pageItems = Array.isArray(pageData.items) ? pageData.items : [];
          items.push(...pageItems);
          total = Number.isFinite(Number(pageData.total)) ? Number(pageData.total) : items.length;
          if (pageItems.length === 0) break;
          page += 1;
        }
        setSponsors(
          items
            .filter((item) => item.typeCode === "ACTIVITY_DONATION")
            .map((item) => {
              const period = item.donationPeriod
                ? new Date(`${item.donationPeriod}T00:00:00`)
                : item.paidAt
                  ? new Date(item.paidAt)
                  : null;
              const amounts = [];

              if (Number(item.amountUsd)) {
                amounts.push(`$${Number(item.amountUsd).toFixed(2)}`);
              }
              if (Number(item.amountKhr)) {
                amounts.push(`${Number(item.amountKhr).toLocaleString()} ៛`);
              }

              return {
                id: item.id,
                month: period
                  ? period.toLocaleString("km-KH", { month: "long" })
                  : "-",
                year: period?.getFullYear() || "-",
                amount: amounts.join(" / ") || "$0.00",
                date: item.paidAt
                  ? new Date(item.paidAt).toLocaleDateString("km-KH")
                  : "-",
                recordedBy: item.recordedByName || "-",
                paymentMethod:
                  item.paymentMethodLabelKm ||
                  item.paymentMethodLabelEn ||
                  item.paymentMethodCode ||
                  "-",
                // Carried through so the "ចំណូល" action below can deep-link
                // straight into this specific activity's donation detail —
                // branchId is whichever branch actually recorded this
                // donation (the organizer's own branch, or an invited
                // branch once it records its own members), so it always
                // opens the right side of that activity's data.
                activityId: item.activityId,
                branchId: item.branchId,
              };
            }),
        );
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setSponsors([]);
          setError(
            loadError.message || "មិនអាចទាញយកទិន្នន័យអ្នកឧបត្ថម្ភបានទេ។",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    if (id) loadSponsorDonations();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/lookups/payment-methods?activeOnly=true&includeMaterial=true", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || "Unable to load payment methods.");
        const rows = Array.isArray(body) ? body : (body?.data || []);
        setPaymentMethods(rows.map((method) => ({
          label: method.label_km || method.labelKm || method.label_en || method.labelEn || method.code,
          value: method.label_km || method.labelKm || method.label_en || method.labelEn || method.code,
        })).filter((method) => method.value));
      })
      .catch((lookupError) => {
        if (lookupError.name !== "AbortError") console.error("Cannot load payment methods:", lookupError);
      });
    return () => controller.abort();
  }, []);

  const filteredData = useMemo(() => {
    const search = query.trim().toLowerCase();

    return sponsors.filter((item) => {
      const amount = String(item.amount ?? "").toLowerCase();
      const date = String(item.date ?? "").toLowerCase();
      const recordedBy = String(item.recordedBy ?? "").toLowerCase();
      const paymentMethod = String(
        item.paymentMethod ?? "",
      ).toLowerCase();

      const matchesQuery =
        !search ||
        amount.includes(search) ||
        date.includes(search) ||
        recordedBy.includes(search) ||
        paymentMethod.includes(search);

      const matchesMethod =
        !methodFilter ||
        item.paymentMethod === methodFilter;

      return matchesQuery && matchesMethod;
    });
  }, [sponsors, query, methodFilter]);

  const columns = [
    {
      header: "ល.រ",
      width: "w-[8%]",
      align: "center",
      render: (_, index) => index,
    },
    {
      header: "ប្រចាំខែ",
      width: "w-[16%]",
      align: "left",
      render: (item) => (
        <span>
          {item.month}, {item.year}
        </span>
      ),
    },
    {
      header: "ចំនួន",
      width: "w-[20%]",
      align: "left",
      accessor: "amount",
    },
    {
      header: "ថ្ងៃបរិច្ឆេទ",
      width: "w-[22%]",
      align: "left",
      accessor: "date",
    },
    {
      header: "កត់ត្រាដោយ",
      width: "w-[24%]",
      align: "left",
      accessor: "recordedBy",
    },
    {
      header: "វិធីសាស្រ្តទូទាត់",
      width: "w-[26%]",
      align: "left",
      accessor: "paymentMethod",
    },
    {
      header: "ចំណូល",
      width: "w-[10%]",
      align: "center",
      render: (item) =>
        item.activityId && item.branchId ? (
          <Link
            href={`/donation/eventdonation/detail?event=${encodeURIComponent(item.activityId)}&branch=${encodeURIComponent(item.branchId)}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-secondary transition hover:bg-secondary-light"
            title="មើលចំណូលនៃកម្មវិធីនេះ"
            aria-label="មើលចំណូលនៃកម្មវិធីនេះ"
          >
            <HandCoins size={16} strokeWidth={2.2} />
          </Link>
        ) : (
          "-"
        ),
    },
  ];

  const filters = [
    {
      name: "paymentMethod",
      value: methodFilter,
      onChange: setMethodFilter,
      options: paymentMethods,
      placeholder: "វិធីសាស្រ្តទូទាត់",
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">
        បញ្ជីវិភាគទានអ្នកឧបត្ថម្ភ
      </h2>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-border bg-bg-page-white px-4 py-3 text-sm text-text-secondary">
          កំពុងទាញយកទិន្នន័យ...
        </div>
      )}

      <DataTable
        data={filteredData}
        columns={columns}
        filters={filters}
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="ស្វែងរក..."
        pageSize={10}
        onDownload={() =>
          downloadTableAsExcel({
            data: filteredData,
            columns,
            fileName: `វិភាគទានអ្នកឧបត្ថម្ភ-សមាជិក-${id}`,
          })
        }
      />
    </div>
  );
}
