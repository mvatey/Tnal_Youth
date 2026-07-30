"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import DataTable from "@/components/tables/DataTable";
import ConfirmDeleteModal from "@/components/modals/Confirmdeletemodal";

import sponsorData from "@/data/sponsor.json";

export default function SponsorDonationPage() {
  const [sponsors, setSponsors] = useState(sponsorData);

  const [query, setQuery] = useState("");

  const [methodFilter, setMethodFilter] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedSponsor, setSelectedSponsor] = useState(null);

  const paymentMethods = useMemo(() => {
    return [...new Set(sponsors.map((item) => item.paymentMethod))];
  }, [sponsors]);

  const filteredData = useMemo(() => {
    return sponsors.filter((item) => {
      const search = query.toLowerCase();

      const matchesQuery =
        item.amount.toLowerCase().includes(search);

      const matchesMethod =
        !methodFilter ||
        item.paymentMethod === methodFilter;

      return matchesQuery && matchesMethod;
    });
  }, [sponsors, query, methodFilter]);

  const handleDelete = () => {
    if (!selectedSponsor) return;

    setSponsors((previous) =>
      previous.filter(
        (item) => item.id !== selectedSponsor.id,
      ),
    );

    setDeleteModal(false);

    setSelectedSponsor(null);
  };

  const columns = [
    {
    header: "ល.រ",
    width: "w-[6%]",
    align: "center",
    render: (_, index) => index ,
  },


    {
      header: "ចំនួន",
      width: "w-[15%]",
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
      width: "w-[19%]",
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
        បញ្ជីវិភាគទានអ្នកឧបត្ថម្ភ
      </h2>

      <DataTable
        data={filteredData}
        columns={columns}
        filters={filters}
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="ស្វែងរក..."
        pageSize={10}
        downloadFilename="sponsor-donation.csv"
      />

      <ConfirmDeleteModal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedSponsor(null);
        }}
        onConfirm={handleDelete}
        title="លុបវិភាគទាន?"
        description={
          selectedSponsor
            ? `តើអ្នកប្រាកដថាចង់លុបវិភាគទាន ${selectedSponsor.amount} នេះទេ?`
            : "តើអ្នកប្រាកដថាចង់លុបទិន្នន័យនេះទេ?"
        }
        cancelLabel="បោះបង់"
        confirmLabel="លុប"
      />
    </div>
  );
}