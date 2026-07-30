"use client";

import { useMemo, useState } from "react";

import { getCurrentMember } from "@/lib/currentMember";
import donationData from "@/data/donation.json";

import DataTable from "@/components/table/DataTable";

export default function MyAccountDonationPage() {
  const member = getCurrentMember();

  const donations = useMemo(() => {
    if (!member) return [];

    return donationData.filter((item) => {
      if (item.memberId === undefined) return true;

      return String(item.memberId) === String(member.id);
    });
  }, [member]);

  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const paymentMethods = useMemo(
    () => [
      ...new Set(
        donations
          .map((item) => item.paymentMethod)
          .filter(Boolean),
      ),
    ],
    [donations],
  );

  const filteredDonations = useMemo(() => {
    const search = query.trim().toLowerCase();

    return donations.filter((item) => {
      const matchesSearch =
        !search ||
        item.month?.toLowerCase().includes(search) ||
        String(item.year || "").includes(search) ||
        item.amount?.toLowerCase().includes(search) ||
        item.recordedBy?.toLowerCase().includes(search);

      const matchesMethod =
        !methodFilter ||
        item.paymentMethod === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [donations, query, methodFilter]);

  const columns = [
    {
      header: "ល.រ",
      width: "w-[6%]",
      align: "center",
      render: (_, index) => index + 1,
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
      header: "វិធីសាស្ត្រទូទាត់",
      width: "w-[18%]",
      align: "left",
      accessor: "paymentMethod",
    },
  ];

  if (!member) {
    return <NotFound />;
  }

  return (
    <div className="space-y-3">
      <DataTable
        title="បញ្ជីការធ្វើវិភាគទាន"
        data={filteredDonations}
        columns={columns}
        filters={[
          {
            name: "paymentMethod",
            value: methodFilter,
            onChange: setMethodFilter,
            placeholder: "វិធីសាស្ត្រទូទាត់",
            options: paymentMethods.map((method) => ({
              label: method,
              value: method,
            })),
          },
        ]}
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="ស្វែងរក..."
        pageSize={10}
        downloadFilename={`donations-${member.id}.csv`}
      />
    </div>
  );
}

function NotFound() {
  return (
    <div className="rounded-xl border border-red-200 bg-white p-6">
      <p className="text-sm text-red-500">
        រកមិនឃើញព័ត៌មានសមាជិក
      </p>
    </div>
  );
}