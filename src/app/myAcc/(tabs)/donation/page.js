"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import useCurrentMember from "@/hooks/useCurrentMember";

import DataTable from "@/components/table/DataTable.js";
import ConfirmDeleteModal from "@/components/popup/Confirmdeletemodal.js";

import donationData from "@/data/donation.json";

export default function DonationPage() {
  const { member, loading, error } = useCurrentMember();

  const [donations, setDonations] = useState(donationData);
  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const memberDonations = useMemo(() => {
    if (!member) return [];

    return donations.filter((item) => {
      /*
       * Temporary behavior:
       * If the JSON item has no memberId, show it for now.
       */
      if (item.memberId === undefined || item.memberId === null) {
        return true;
      }

      return String(item.memberId) === String(member.id);
    });
  }, [donations, member]);

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

  const handleDelete = () => {
    if (!selectedDonation) return;

    setDonations((previousDonations) =>
      previousDonations.filter(
        (item) => item.id !== selectedDonation.id,
      ),
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
          type="button"
          onClick={() => {
            setSelectedDonation(item);
            setDeleteModal(true);
          }}
          className="inline-flex items-center justify-center text-red-500 hover:text-red-600"
          aria-label="លុបវិភាគទាន"
        >
          <Trash2 className="h-5 w-5" />
        </button>
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

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        កំពុងទាញយកព័ត៌មានសមាជិក...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">
          {error}
        </p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">
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
        downloadFilename={`donations-${member.id}.csv`}
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