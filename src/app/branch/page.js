"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  List,
  PlusCircle,
  Trash2,
} from "lucide-react";

import CreateBranchModal from "@/components/branch/CreateBranchModal";

import SearchBar from "@/components/table-items/SearchBar";
import FilterBar from "@/components/table-items/FilterBar";
import Table from "@/components/table-items/Table";

import BranchStats from "@/components/branch/branchStats";

import SaveButton from "@/components/forms/save";
import SaveFile from "@/components/forms/savefile";

import branchData from "@/data/branch/branches.json";

import { RiDownloadCloud2Line } from "react-icons/ri";
import Button from "@/components/ui/Button";

const branchTypes = [
  {
    label: "ជ្រើសរើសប្រភេទ",
    value: "",
  },
  {
    label: "សាខារដ្ឋបាល",
    value: "ADMIN",
  },
  {
    label: "សាខាសមាគម",
    value: "ASSOCIATION",
  },
];

const branchLevels = [
  "រាជធានី/ខេត្ត",
  "ក្រុង/ស្រុក/ខណ្ឌ",
  "ឃុំ/សង្កាត់",
];

const statusOptions = [
  "សកម្ម",
  "អសកម្ម",
];

function BranchStatusBadge({ status }) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex min-w-[70px] items-center justify-center rounded-full px-3 py-1 text-[11px] font-medium ${
        isActive
          ? "bg-success-bg text-success"
          : "bg-error-bg text-error"
      }`}
    >
      {isActive ? "សកម្ម" : "អសកម្ម"}
    </span>
  );
}

function handleCreateBranch(newBranch) {
  setBranches((previousBranches) => [
    newBranch,
    ...previousBranches,
  ]);
}

export default function BranchPage() {
  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [branches, setBranches] =
    useState(branchData);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedLevel, setSelectedLevel] =
    useState("");

  const [
    selectedProvince,
    setSelectedProvince,
  ] = useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("");

  const [showSaveFile, setShowSaveFile] =
    useState(false);

  useEffect(() => {
    if (!showSaveFile) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setShowSaveFile(false);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showSaveFile]);

  const provinces = useMemo(() => {
    return [
      ...new Set(
        branches
          .map((branch) => branch.province)
          .filter(Boolean),
      ),
    ];
  }, [branches]);

  const filteredBranches = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return branches.filter((branch) => {
      const name = String(
        branch.name || "",
      ).toLowerCase();

      const code = String(
        branch.code || "",
      ).toLowerCase();

      const province = String(
        branch.province || "",
      ).toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        code.includes(query) ||
        province.includes(query);

      const matchesLevel =
        !selectedLevel ||
        branch.level === selectedLevel;

      const matchesProvince =
        !selectedProvince ||
        branch.province === selectedProvince;

      const matchesStatus =
        !selectedStatus ||
        branch.status === selectedStatus;

      return (
        matchesSearch &&
        matchesLevel &&
        matchesProvince &&
        matchesStatus
      );
    });
  }, [
    branches,
    searchQuery,
    selectedLevel,
    selectedProvince,
    selectedStatus,
  ]);

  const columns = [
    {
      key: "no",
      label: "ល.រ",
      width: "5%",
      align: "center",
      render: (_row, index) => index + 1,
    },
    {
      key: "name",
      label: "ឈ្មោះសាខា",
      width: "20%",
      align: "left",
      truncate: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-text-primary">
            {row.name || "-"}
          </p>

          <p className="truncate text-[11px] text-text-secondary">
            {row.code || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "level",
      label: "កម្រិតសាខា",
      width: "15%",
      align: "left",
      render: (row) =>
        row.level || "-",
    },
    {
      key: "province",
      label: "រាជធានី/ខេត្ត",
      width: "13%",
      align: "left",
      render: (row) =>
        row.province || "-",
    },
    {
    key: "district",
    label: "ក្រុង/ស្រុក/ខណ្ឌ",
    width: "12%",
    align: "center",
    render: (row) => row.district || "-",
  },
    {
      key: "memberCount",
      label: "សមាជិក",
      width: "10%",
      align: "center",
      render: (row) =>
        row.memberCount ?? 0,
    },
    {
      key: "status",
      label: "ស្ថានភាព",
      width: "11%",
      align: "center",
      render: (row) => (
        <BranchStatusBadge
          status={row.status}
        />
      ),
    },
    {
      key: "createdAt",
      label: "ថ្ងៃបង្កើត",
      width: "13%",
      align: "center",
      render: (row) =>
        row.createdAt || "-",
    },
    {
      key: "actions",
      label: "សកម្មភាព",
      width: "13%",
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/branch/${row.id}`}
            className="inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-3 text-[11px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-sm active:translate-y-0"
          >
            <List size={14} />
            ព័ត៌មានលម្អិត
          </Link>
        </div>
      ),
    },
  ];

const filters = [
  {
    key: "level",
    value: selectedLevel,
    onChange: setSelectedLevel,
    placeholder: "កម្រិតសាខា",
    options: branchLevels,
  },
  {
    key: "province",
    value: selectedProvince,
    onChange: setSelectedProvince,
    placeholder: "រាជធានី/ខេត្ត",
    options: provinces,
  },
  {
    key: "status",
    value: selectedStatus,
    onChange: setSelectedStatus,
    placeholder: "ស្ថានភាព",
    options: statusOptions,
  },
];

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <div>
        <h1 className="text-xl font-bold text-primary">
          បញ្ជីសាខា
        </h1>

        <p className="mt-1 text-xs text-text-secondary">
          គ្រប់គ្រងព័ត៌មាន និងទិន្នន័យសាខា
        </p>
      </div>

      <BranchStats branches={branches} />

      <section className="rounded-xl border border-border bg-white p-4 transition-shadow duration-200 hover:shadow-sm">
        <div className="mb-4 flex min-w-0 flex-wrap items-center gap-3 xl:flex-nowrap">
          <div className="w-full shrink-0 sm:w-[265px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="ស្វែងរកសាខា..."
              width="w-full"
            />
          </div>

          <div className="min-w-0 shrink-0">
            <FilterBar
              filters={filters}
              className="flex-wrap xl:flex-nowrap"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <div className="relative">
              <Button
                type="button"
                variant="primary"
                icon={<RiDownloadCloud2Line size={16} />}
                onClick={() =>
                  setShowSaveFile((open) => !open)
                }
                aria-expanded={showSaveFile}
                aria-controls="branch-save-file"
              >
                ទាញយក
              </Button>

              {showSaveFile && (
                <div
                  id="branch-save-file"
                  className="absolute right-0 top-full z-50 mt-3"
                >
                  <SaveFile />
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="success"
              icon={<PlusCircle size={16} />}
              onClick={() => setShowCreateModal(true)}
            >
              បង្កើតសាខាថ្មី
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredBranches}
          rowsPerPage={10}
          scrollable={false}
          emptyMessage="មិនមានទិន្នន័យសាខាទេ"
        />
      </section>

      <CreateBranchModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateBranch}
      />
    </div>
  );
}