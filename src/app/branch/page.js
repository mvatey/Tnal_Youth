"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  List,
  PlusCircle,
} from "lucide-react";

import { RiDownloadCloud2Line } from "react-icons/ri";

import CreateBranchModal from "@/components/branch/CreateBranchModal";
import BranchStats from "@/components/branch/branchStats";

import SearchBar from "@/components/table-items/SearchBar";
import FilterBar from "@/components/table-items/FilterBar";
import Table from "@/components/table-items/Table";

import SaveFile from "@/components/forms/savefile";
import Button from "@/components/ui/Button";

const BRANCH_LEVEL_OPTIONS = [
  "រាជធានី/ខេត្ត",
  "ក្រុង/ស្រុក/ខណ្ឌ",
  "ឃុំ/សង្កាត់",
];

const BRANCH_LEVEL_LABELS = {
  1: "រាជធានី/ខេត្ត",
  2: "ក្រុង/ស្រុក/ខណ្ឌ",
  3: "ឃុំ/សង្កាត់",
};

const STATUS_LABELS_KM = {
  ACTIVE: "សកម្ម",
  INACTIVE: "អសកម្ម",
};

const EMPTY_SUMMARY = {
  total_branches: 0,
  active_branches: 0,
  total_members: 0,
};

async function fetchJson(path, signal) {
  const response = await fetch(`/api${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  const responseText =
    await response.text();

  let responseBody = null;

  if (responseText) {
    try {
      responseBody =
        JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }
  }

  if (!response.ok) {
    const message =
      typeof responseBody === "object"
        ? responseBody?.message ||
          responseBody?.error
        : responseBody;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return responseBody;
}

function formatCreatedDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "km-KH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function getProvinceLabel(province) {
  return (
    province?.name_km ||
    province?.nameKm ||
    province?.name_en ||
    province?.nameEn ||
    ""
  );
}

function getStatusLabel(status) {
  const statusCode = String(
    status?.code || "",
  ).toUpperCase();

  return (
    status?.name_km ||
    status?.nameKm ||
    status?.label_km ||
    status?.labelKm ||
    status?.name_en ||
    status?.nameEn ||
    status?.label_en ||
    status?.labelEn ||
    STATUS_LABELS_KM[statusCode] ||
    status?.code ||
    ""
  );
}

function BranchStatusBadge({
  statusCode,
  statusLabel,
}) {
  const normalizedCode = String(
    statusCode || "",
  ).toUpperCase();

  const isActive =
    normalizedCode === "ACTIVE" ||
    statusLabel === "សកម្ម";

  return (
    <span
      className={`
        inline-flex
        min-w-[70px]
        items-center
        justify-center
        rounded-full
        px-3
        py-1
        text-[11px]
        font-medium
        ${
          isActive
            ? "bg-success-bg text-success"
            : "bg-error-bg text-error"
        }
      `}
    >
      {statusLabel || "-"}
    </span>
  );
}

export default function BranchPage() {
  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [branches, setBranches] =
    useState([]);

  const [summary, setSummary] =
    useState(EMPTY_SUMMARY);

  const [
    provinceLookups,
    setProvinceLookups,
  ] = useState([]);

  const [
    statusLookups,
    setStatusLookups,
  ] = useState([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    selectedLevel,
    setSelectedLevel,
  ] = useState("");

  const [
    selectedProvince,
    setSelectedProvince,
  ] = useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("");

  const [
    showSaveFile,
    setShowSaveFile,
  ] = useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const loadSummary = useCallback(
    async (signal) => {
      const data = await fetchJson(
        "/branches/summary",
        signal,
      );

      setSummary({
        total_branches:
          Number(
            data?.total_branches ??
              data?.totalBranches,
          ) || 0,

        active_branches:
          Number(
            data?.active_branches ??
              data?.activeBranches,
          ) || 0,

        total_members:
          Number(
            data?.total_members ??
              data?.totalMembers,
          ) || 0,
      });
    },
    [],
  );

  const loadBranches = useCallback(
    async (signal) => {
      const firstPage =
        await fetchJson(
          "/branches?page=0&size=100",
          signal,
        );

      const firstContent =
        Array.isArray(firstPage?.content)
          ? firstPage.content
          : Array.isArray(firstPage)
            ? firstPage
            : [];

      const totalPages = Math.max(
        Number(
          firstPage?.total_pages ??
            firstPage?.totalPages ??
            1,
        ),
        1,
      );

      if (totalPages <= 1) {
        setBranches(firstContent);
        return;
      }

      const remainingRequests =
        Array.from(
          {
            length: totalPages - 1,
          },
          (_, index) =>
            fetchJson(
              `/branches?page=${index + 1}&size=100`,
              signal,
            ),
        );

      const remainingPages =
        await Promise.all(
          remainingRequests,
        );

      const remainingContent =
        remainingPages.flatMap(
          (page) =>
            Array.isArray(page?.content)
              ? page.content
              : [],
        );

      setBranches([
        ...firstContent,
        ...remainingContent,
      ]);
    },
    [],
  );

  const loadLookups = useCallback(
    async (signal) => {
      /*
       * Load each dropdown separately.
       * One failed endpoint will not remove
       * the other dropdown.
       */

      try {
        const provinces =
          await fetchJson(
            "/lookups/branches/province-options",
            signal,
          );

        setProvinceLookups(
          Array.isArray(provinces)
            ? provinces
            : [],
        );
      } catch (error) {
        if (
          error.name !== "AbortError"
        ) {
          console.warn(
            "Failed to load province options:",
            error.message,
          );
        }

        setProvinceLookups([]);
      }

      try {
        const statuses =
          await fetchJson(
            "/lookups/branch-statuses",
            signal,
          );

        setStatusLookups(
          Array.isArray(statuses)
            ? statuses
            : [],
        );
      } catch (error) {
        if (
          error.name !== "AbortError"
        ) {
          console.warn(
            "Failed to load branch statuses:",
            error.message,
          );
        }

        setStatusLookups([]);
      }
    },
    [],
  );

  const loadBranchPage =
    useCallback(
      async (signal) => {
        setIsLoading(true);
        setLoadError("");

        try {
          await Promise.all([
            loadSummary(signal),
            loadBranches(signal),
            loadLookups(signal),
          ]);
        } catch (error) {
          if (
            error.name !== "AbortError"
          ) {
            console.warn(
              "Failed to load branch page:",
              error.message,
            );

            setLoadError(
              error.message ||
                "Failed to load branch data",
            );
          }
        } finally {
          if (!signal?.aborted) {
            setIsLoading(false);
          }
        }
      },
      [
        loadBranches,
        loadLookups,
        loadSummary,
      ],
    );

  useEffect(() => {
    const controller =
      new AbortController();

    loadBranchPage(
      controller.signal,
    );

    return () => {
      controller.abort();
    };
  }, [loadBranchPage]);

  useEffect(() => {
    if (!showSaveFile) {
      return undefined;
    }

    const timeoutId =
      window.setTimeout(() => {
        setShowSaveFile(false);
      }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showSaveFile]);

  const provinceById = useMemo(
    () =>
      new Map(
        provinceLookups.map(
          (province) => [
            String(
              province?.id ?? "",
            ),
            province,
          ],
        ),
      ),
    [provinceLookups],
  );

  const statusById = useMemo(
    () =>
      new Map(
        statusLookups.map(
          (status) => [
            String(
              status?.id ?? "",
            ),
            status,
          ],
        ),
      ),
    [statusLookups],
  );

  const mappedBranches = useMemo(
    () =>
      branches.map((branch) => {
        const branchLevelId =
          branch?.branch_level_id ??
          branch?.branchLevelId ??
          branch?.branch_level?.id ??
          branch?.branchLevel?.id ??
          "";

        const provinceId =
          branch?.province_id ??
          branch?.provinceId ??
          branch?.province?.id ??
          "";

        const districtId =
          branch?.district_id ??
          branch?.districtId ??
          branch?.district?.id ??
          "";

        const communeId =
          branch?.commune_id ??
          branch?.communeId ??
          branch?.commune?.id ??
          "";

        const statusId =
          branch?.status_id ??
          branch?.statusId ??
          branch?.status?.id ??
          "";

        const provinceLookup =
          provinceById.get(
            String(provinceId),
          );

        const statusLookup =
          statusById.get(
            String(statusId),
          );

        const statusCode = String(
          branch?.status_code ||
            branch?.statusCode ||
            branch?.status?.code ||
            statusLookup?.code ||
            "",
        ).toUpperCase();

        const statusLabel =
          branch?.status_name_km ||
          branch?.statusNameKm ||
          branch?.status?.name_km ||
          branch?.status?.nameKm ||
          branch?.status?.label_km ||
          branch?.status?.labelKm ||
          getStatusLabel(
            statusLookup,
          ) ||
          STATUS_LABELS_KM[
            statusCode
          ] ||
          "-";

        const provinceLabel =
          branch?.province_name_km ||
          branch?.provinceNameKm ||
          branch?.province?.name_km ||
          branch?.province?.nameKm ||
          branch?.province?.name_en ||
          branch?.province?.nameEn ||
          getProvinceLabel(
            provinceLookup,
          ) ||
          "-";

        return {
          id: branch?.id,

          name:
            branch?.name_km ||
            branch?.nameKm ||
            branch?.name_en ||
            branch?.nameEn ||
            "-",

          code:
            branch?.branch_code ||
            branch?.branchCode ||
            "-",

          levelId:
            branchLevelId,

          level:
            branch
              ?.branch_level_name_km ||
            branch
              ?.branchLevelNameKm ||
            branch?.branch_level
              ?.name_km ||
            branch?.branchLevel
              ?.nameKm ||
            BRANCH_LEVEL_LABELS[
              branchLevelId
            ] ||
            "-",

          provinceId,
          province: provinceLabel,

          districtId,

          district:
            branch
              ?.district_name_km ||
            branch
              ?.districtNameKm ||
            branch?.district
              ?.name_km ||
            branch?.district
              ?.nameKm ||
            "-",

          communeId,

          commune:
            branch
              ?.commune_name_km ||
            branch
              ?.communeNameKm ||
            branch?.commune
              ?.name_km ||
            branch?.commune
              ?.nameKm ||
            "-",

          memberCount:
            Number(
              branch?.member_count ??
                branch?.memberCount,
            ) || 0,

          statusId,
          statusCode,
          statusLabel,

          createdAt:
            formatCreatedDate(
              branch?.created_at ||
                branch?.createdAt,
            ),
        };
      }),
    [
      branches,
      provinceById,
      statusById,
    ],
  );

  /*
   * FilterBar expects string options.
   */
  const provinceOptions =
    useMemo(
      () =>
        provinceLookups
          .map(getProvinceLabel)
          .filter(Boolean),
      [provinceLookups],
    );

  const branchStatusOptions =
    useMemo(
      () =>
        statusLookups
          .map(getStatusLabel)
          .filter(Boolean),
      [statusLookups],
    );

  const filteredBranches =
    useMemo(() => {
      const query = searchQuery
        .trim()
        .toLowerCase();

      return mappedBranches.filter(
        (branch) => {
          const matchesSearch =
            !query ||
            branch.name
              .toLowerCase()
              .includes(query) ||
            branch.code
              .toLowerCase()
              .includes(query) ||
            branch.province
              .toLowerCase()
              .includes(query) ||
            branch.district
              .toLowerCase()
              .includes(query);

          const matchesLevel =
            !selectedLevel ||
            branch.level ===
              selectedLevel;

          const matchesProvince =
            !selectedProvince ||
            branch.province ===
              selectedProvince;

          const matchesStatus =
            !selectedStatus ||
            branch.statusLabel ===
              selectedStatus;

          return (
            matchesSearch &&
            matchesLevel &&
            matchesProvince &&
            matchesStatus
          );
        },
      );
    }, [
      mappedBranches,
      searchQuery,
      selectedLevel,
      selectedProvince,
      selectedStatus,
    ]);

  const handleCreateBranch =
    async () => {
      setShowCreateModal(false);

      const controller =
        new AbortController();

      await loadBranchPage(
        controller.signal,
      );
    };

  const columns = [
    {
      key: "no",
      label: "ល.រ",
      width: "5%",
      align: "center",

      render: (_row, index) =>
        index + 1,
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
            {row.name}
          </p>

          <p className="truncate text-[11px] text-text-secondary">
            {row.code}
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
        row.level,
    },
    {
      key: "province",
      label: "រាជធានី/ខេត្ត",
      width: "13%",
      align: "left",

      render: (row) =>
        row.province,
    },
    {
      key: "district",
      label: "ក្រុង/ស្រុក/ខណ្ឌ",
      width: "12%",
      align: "center",

      render: (row) =>
        row.district,
    },
    {
      key: "memberCount",
      label: "សមាជិក",
      width: "10%",
      align: "center",

      render: (row) =>
        row.memberCount,
    },
    {
      key: "status",
      label: "ស្ថានភាព",
      width: "11%",
      align: "center",

      render: (row) => (
        <BranchStatusBadge
          statusCode={
            row.statusCode
          }
          statusLabel={
            row.statusLabel
          }
        />
      ),
    },
    {
      key: "createdAt",
      label: "ថ្ងៃបង្កើត",
      width: "13%",
      align: "center",

      render: (row) =>
        row.createdAt,
    },
    {
      key: "actions",
      label: "សកម្មភាព",
      width: "13%",
      align: "center",

      render: (row) => (
        <div className="flex items-center justify-center">
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
      onChange:
        setSelectedLevel,
      placeholder:
        "កម្រិតសាខា",
      options:
        BRANCH_LEVEL_OPTIONS,
    },
    {
      key: "province",
      value: selectedProvince,
      onChange:
        setSelectedProvince,
      placeholder:
        "រាជធានី/ខេត្ត",
      options:
        provinceOptions,
    },
    {
      key: "status",
      value: selectedStatus,
      onChange:
        setSelectedStatus,
      placeholder:
        "ស្ថានភាព",
      options:
        branchStatusOptions,
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

      <BranchStats
        branches={mappedBranches}
        summary={summary}
      />

      <section className="rounded-xl border border-border bg-white p-4 transition-shadow duration-200 hover:shadow-sm">
        <div className="mb-4 flex min-w-0 flex-wrap items-center gap-3 xl:flex-nowrap">
          <div className="w-full shrink-0 sm:w-[265px]">
            <SearchBar
              value={searchQuery}
              onChange={
                setSearchQuery
              }
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
                icon={
                  <RiDownloadCloud2Line
                    size={16}
                  />
                }
                onClick={() =>
                  setShowSaveFile(
                    (open) =>
                      !open,
                  )
                }
                aria-expanded={
                  showSaveFile
                }
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
              icon={
                <PlusCircle
                  size={16}
                />
              }
              onClick={() =>
                setShowCreateModal(
                  true,
                )
              }
            >
              បង្កើតសាខាថ្មី
            </Button>
          </div>
        </div>

        {loadError && (
          <div className="mb-4 rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
            {loadError}
          </div>
        )}

        <Table
          columns={columns}
          data={
            filteredBranches
          }
          rowsPerPage={10}
          scrollable={false}
          emptyMessage={
            isLoading
              ? "កំពុងទាញយកទិន្នន័យ..."
              : "មិនមានទិន្នន័យសាខាទេ"
          }
        />
      </section>

      <CreateBranchModal
        open={showCreateModal}
        onClose={() =>
          setShowCreateModal(
            false,
          )
        }
        onSave={
          handleCreateBranch
        }
      />
    </div>
  );
}