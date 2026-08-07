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

export default function BranchManagementPage() {
  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [branches, setBranches] = useState([]);
  const [lookupOptions, setLookupOptions] = useState({
    levels: [],
    statuses: [],
    provinces: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const loadBranches = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [branchResponse, levelResponse, statusResponse, provinceResponse] =
        await Promise.all([
          fetch("/api/branches"),
          fetch("/api/lookups/branch-levels"),
          fetch("/api/lookups/branch-statuses"),
          fetch("/api/lookups/provinces"),
        ]);
      const responses = [branchResponse, levelResponse, statusResponse, provinceResponse];
      const failed = responses.find((response) => !response.ok);

      if (failed) {
        const problem = await failed.json().catch(() => ({}));
        throw new Error(problem.message || "Unable to load branch data.");
      }

      const [branchRows, levels, statuses, provinceOptions] =
        await Promise.all(responses.map((response) => response.json()));
      const provinceIds = [...new Set(branchRows.map((branch) => branch.province_id).filter(Boolean))];
      const districtLists = await Promise.all(
        provinceIds.map((id) => fetch(`/api/lookups/districts?provinceId=${id}`).then((response) => response.ok ? response.json() : [])),
      );
      const districts = districtLists.flat();
      const districtIds = [...new Set(branchRows.map((branch) => branch.district_id).filter(Boolean))];
      const communeLists = await Promise.all(
        districtIds.map((id) => fetch(`/api/lookups/communes?districtId=${id}`).then((response) => response.ok ? response.json() : [])),
      );
      const communes = communeLists.flat();
      const labelFor = (options, id) =>
        options.find((option) => String(option.value) === String(id))?.labelKm || "";

      setBranches(branchRows.map((branch) => ({
        id: branch.id,
        code: branch.branch_code,
        name: branch.name_km,
        nameKm: branch.name_km,
        nameEn: branch.name_en,
        level: labelFor(levels, branch.branch_level_id),
        levelId: branch.branch_level_id,
        province: labelFor(provinceOptions, branch.province_id),
        provinceId: branch.province_id,
        district: labelFor(districts, branch.district_id),
        districtId: branch.district_id,
        commune: labelFor(communes, branch.commune_id),
        communeId: branch.commune_id,
        status: statuses.find((option) => String(option.value) === String(branch.status_id))?.code || "",
        statusId: branch.status_id,
        addressLine: branch.address || "",
        googleMapUrl: branch.google_map_url || "",
        phone: branch.phone || "",
        email: branch.email || "",
        memberCount: 0,
        createdAt: branch.created_at ? new Intl.DateTimeFormat("km-KH").format(new Date(branch.created_at)) : "",
      })));
      setLookupOptions({ levels, statuses, provinces: provinceOptions });
    } catch (loadError) {
      setError(loadError.message || "Unable to load branch data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const saveBranchToDatabase = async (form) => {
    const response = await fetch("/api/branches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branch_code: form.code.trim(),
        name_km: form.nameKm.trim(),
        name_en: form.nameEn.trim() || null,
        branch_level_id: Number(form.level),
        parent_branch_id: null,
        province_id: Number(form.province),
        district_id: form.district ? Number(form.district) : null,
        commune_id: form.commune ? Number(form.commune) : null,
        status_id: Number(form.status),
        address: form.addressLine.trim() || null,
        google_map_url: form.googleMapUrl.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
      }),
    });

    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      throw new Error(problem.message || "Unable to create branch.");
    }

    setShowCreateModal(false);
    await loadBranches();
  };

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
    options: lookupOptions.levels.map((item) => ({
      label: item.labelKm || item.labelEn,
      value: item.labelKm || item.labelEn,
    })),
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
    options: lookupOptions.statuses.map((item) => ({
      label: item.labelKm || item.labelEn,
      value: item.code,
    })),
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

      {error && (
        <div className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" className="font-semibold underline" onClick={loadBranches}>Retry</button>
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-border bg-white p-5 text-sm text-text-secondary">Loading branch data...</div>
      )}

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
        onSave={saveBranchToDatabase}
        levelOptions={lookupOptions.levels.map((item) => ({ label: item.labelKm || item.labelEn, value: item.value, code: item.code }))}
        statusOptions={lookupOptions.statuses.map((item) => ({ label: item.labelKm || item.labelEn, value: item.value, code: item.code }))}
        provinceOptions={lookupOptions.provinces.map((item) => ({ label: item.labelKm || item.labelEn, value: item.value }))}
      />
    </div>
  );
}
