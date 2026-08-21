"use client";

import { useEffect, useMemo, useState } from "react";

import useCurrentMember from "@/hooks/useCurrentMember";

import DataTable from "@/components/table/DataTable.js";

import { fetchMyAccountCollection } from "@/lib/myAccountCollections";
import { downloadTableAsExcel } from "@/utils/downloadExcel";

const KHMER_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
];

export default function DonationPage() {
  const { member, loading, error } = useCurrentMember();

  const [donations, setDonations] = useState([]);
  const [dataError, setDataError] = useState("");
  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  useEffect(() => {
    if (!member) return;
    fetchMyAccountCollection("donations/monthly")
      .then((rows) => setDonations(rows.map((row) => {
        const paidAt = row.paidAt || "";
        const period = row.donationPeriod || "";
        return {
          id: row.id,
          month: period ? KHMER_MONTHS[Number(period.slice(5, 7)) - 1] || "-" : "-",
          year: period ? period.slice(0, 4) : "-",
          amount: Number(row.amountKhr || 0) > 0
            ? `${Number(row.amountKhr).toLocaleString()} ៛`
            : `$${Number(row.amountUsd || row.totalAmountUsd || 0).toFixed(2)}`,
          date: paidAt ? new Date(paidAt).toLocaleDateString() : "-",
          recordedBy: row.recordedBy?.fullNameKm || row.recordedBy?.fullNameEn || "-",
          paymentMethod: row.paymentMethod?.labelKm || row.paymentMethod?.labelEn || row.paymentMethod?.code || "-",
        };
      })))
      .catch((requestError) => setDataError(requestError.message));
  }, [member]);

  const memberDonations = useMemo(() => donations, [donations]);

  const paymentMethods = useMemo(() => {
    return [
      ...new Set(
        memberDonations
          .map((item) => item.paymentMethod)
          .filter(Boolean),
      ),
    ];
  }, [memberDonations]);

  const filteredData = useMemo(() => {
    const search = query.trim().toLowerCase();

    return memberDonations.filter((item) => {
      const month = String(item.month ?? "").toLowerCase();
      const amount = String(item.amount ?? "").toLowerCase();
      const recordedBy = String(item.recordedBy ?? "").toLowerCase();

      const matchesQuery =
        !search ||
        month.includes(search) ||
        amount.includes(search) ||
        recordedBy.includes(search);

      const matchesMethod =
        !methodFilter ||
        item.paymentMethod === methodFilter;

      return matchesQuery && matchesMethod;
    });
  }, [
    memberDonations,
    query,
    methodFilter,
  ]);

  const columns = [
    {
      header: "ល.រ",
      width: "w-[6%]",
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
      width: "w-[14%]",
      align: "left",
      accessor: "amount",
    },
    {
      header: "ថ្ងៃបរិច្ឆេទ",
      width: "w-[18%]",
      align: "left",
      accessor: "date",
    },
    {
      header: "កត់ត្រាដោយ",
      width: "w-[18%]",
      align: "left",
      accessor: "recordedBy",
    },
    {
      header: "វិធីសាស្រ្តទូទាត់",
      width: "w-[18%]",
      align: "left",
      accessor: "paymentMethod",
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

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-bg-page-white p-6">
        កំពុងទាញយកព័ត៌មានសមាជិក...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-error/30 bg-bg-page-white p-6">
        <p className="text-sm text-error">
          {error}
        </p>
      </div>
    );
  }

  if (dataError) {
    return <div className="rounded-xl border border-error/30 bg-bg-page-white p-6 text-sm text-error">{dataError}</div>;
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-error/30 bg-bg-page-white p-6">
        <p className="text-sm text-error">
          រកមិនឃើញព័ត៌មានសមាជិក
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">
        បញ្ជីការធ្វើវិភាគទាន
      </h2>

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
            fileName: `វិភាគទានប្រចាំខែ-${member.name_kh}`,
          })
        }
      />

    </div>
  );
}
