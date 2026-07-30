"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import DataTable from "@/components/tables/DataTable.js";
import donationData from "@/data/donationRecords.json";

export default function DonationPage() {
  const [donations, setDonations] = useState(donationData);

  const [query, setQuery] = useState("");

  const [methodFilter, setMethodFilter] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedDonation, setSelectedDonation] = useState(null);

  const paymentMethods = useMemo(() => {
    return [...new Set(donations.map((item) => item.paymentMethod))];
  }, [donations]);

  const filteredData = useMemo(() => {
    return donations.filter((item) => {
      const search = query.toLowerCase();

      const matchesQuery =
        item.month.toLowerCase().includes(search);

      const matchesMethod =
        !methodFilter || item.paymentMethod === methodFilter;

      return matchesQuery && matchesMethod;
    });
  }, [donations, query, methodFilter]);

  const handleDelete = () => {
    if (!selectedDonation) return;

    setDonations((prev) =>
      prev.filter((item) => item.id !== selectedDonation.id),
    );

    setDeleteModal(false);

    setSelectedDonation(null);
  };

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
      value: methodFilter,

      onChange: setMethodFilter,

      options: paymentMethods,

      placeholder: "វិធីសាស្រ្តទូទាត់",
    },
  ];

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
      />

    </div>
  );
}
