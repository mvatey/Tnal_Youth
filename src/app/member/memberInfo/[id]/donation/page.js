"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import DataTable from "@/components/table/DataTable.js";
import ConfirmDeleteModal from "@/components/popup/Confirmdeletemodal.js";

import donationData from "@/data/donation.json";

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
        item.month.toLowerCase().includes(search) ||
        item.amount.toLowerCase().includes(search) ||
        item.recordedBy.toLowerCase().includes(search);

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

    {
      header: "សកម្មភាព",
      width: "w-[10%]",
      align: "center",

      render: (item) => (
        <button
          onClick={() => {
            setSelectedDonation(item);

            setDeleteModal(true);
          }}
          className="
          inline-flex
          items-center
          justify-center
          text-red-500
          hover:text-red-600
          "
        >
          <Trash2 className="h-5 w-5" />
        </button>
      ),
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

      <ConfirmDeleteModal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);

          setSelectedDonation(null);
        }}
        onConfirm={handleDelete}
        title="លុបវិភាគទាន?"
        description={
          selectedDonation
            ? `តើអ្នកប្រាកដថាចង់លុបវិភាគទាន ${selectedDonation.amount} នេះទេ?`
            : "តើអ្នកប្រាកដថាចង់លុបទិន្នន័យនេះទេ?"
        }
        cancelLabel="បោះបង់"
        confirmLabel="លុប"
      />
    </div>
  );
}
