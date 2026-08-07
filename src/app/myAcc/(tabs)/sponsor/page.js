"use client";

import {
  useMemo,
  useState,
} from "react";

import useCurrentMember from "@/hooks/useCurrentMember";

import DataTable from "@/components/table/DataTable";

import sponsorData from "@/data/sponsor.json";

export default function MyAccountSponsorPage() {
  const {
    member,
    loading,
    error,
  } = useCurrentMember();

  const [query, setQuery] =
    useState("");

  const [
    methodFilter,
    setMethodFilter,
  ] = useState("");

  /*
   * Show only sponsor records belonging
   * to the current logged-in member.
   *
   * Old records without memberId remain visible
   * temporarily for your JSON testing.
   */
  const sponsors = useMemo(() => {
    if (!member) {
      return [];
    }

    return sponsorData.filter(
      (item) => {
        if (
          item.memberId ===
            undefined ||
          item.memberId === null
        ) {
          return true;
        }

        return (
          String(item.memberId) ===
          String(member.id)
        );
      },
    );
  }, [member]);

  const paymentMethods =
    useMemo(() => {
      return [
        ...new Set(
          sponsors
            .map(
              (item) =>
                item.paymentMethod,
            )
            .filter(Boolean),
        ),
      ];
    }, [sponsors]);

  const filteredData =
    useMemo(() => {
      const search = query
        .trim()
        .toLowerCase();

      return sponsors.filter(
        (item) => {
          const amount = String(
            item.amount ?? "",
          ).toLowerCase();

          const date = String(
            item.date ?? "",
          ).toLowerCase();

          const recordedBy = String(
            item.recordedBy ?? "",
          ).toLowerCase();

          const paymentMethod =
            String(
              item.paymentMethod ??
                "",
            ).toLowerCase();

          const matchesQuery =
            !search ||
            amount.includes(search) ||
            date.includes(search) ||
            recordedBy.includes(
              search,
            ) ||
            paymentMethod.includes(
              search,
            );

          const matchesMethod =
            !methodFilter ||
            item.paymentMethod ===
              methodFilter;

          return (
            matchesQuery &&
            matchesMethod
          );
        },
      );
    }, [
      sponsors,
      query,
      methodFilter,
    ]);

  const columns = [
    {
      header: "ល.រ",
      width: "w-[8%]",
      align: "center",
      render: (_, index) =>
        index,
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
      header:
        "វិធីសាស្ត្រទូទាត់",
      width: "w-[26%]",
      align: "left",
      accessor:
        "paymentMethod",
    },
  ];

  const filters = [
    {
      name:
        "paymentMethod",
      value: methodFilter,
      onChange:
        setMethodFilter,
      options:
        paymentMethods.map(
          (method) => ({
            label: method,
            value: method,
          }),
        ),
      placeholder:
        "វិធីសាស្ត្រទូទាត់",
    },
  ];

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          កំពុងទាញយកទិន្នន័យ...
        </p>
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
        បញ្ជីការបរិច្ចាក
      </h2>

      <DataTable
        data={filteredData}
        columns={columns}
        filters={filters}
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="ស្វែងរក..."
        pageSize={10}
        downloadFilename={`sponsor-donation-${member.id}.pdf`}
      />
    </div>
  );
}