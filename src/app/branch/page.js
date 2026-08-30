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
import { downloadExcel } from "@/utils/downloadExcel";
import CreateBranchModal from "@/components/branch/CreateBranchModal";
import BranchStats from "@/components/branch/branchStats";

import SearchBar from "@/components/table-items/SearchBar";
import FilterBar from "@/components/table-items/FilterBar";
import Table from "@/components/table-items/Table";

import SaveFile from "@/components/forms/savefile";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { normalizeRole } from "@/lib/navigation";

/*
 * =========================================================
 * FILTER LABELS
 * =========================================================
 */


const ALL_LEVELS_LABEL =
  "កម្រិតសាខាទាំងអស់";

const ALL_PROVINCES_LABEL =
  "រាជធានី/ខេត្តទាំងអស់";

const ALL_STATUSES_LABEL =
  "ស្ថានភាពទាំងអស់";

/*
 * =========================================================
 * BRANCH LEVELS
 * =========================================================
 */

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

/*
 * =========================================================
 * STATUS
 * =========================================================
 */

const STATUS_LABELS_KM = {
  ACTIVE: "សកម្ម",
  INACTIVE: "អសកម្ម",
};

/*
 * =========================================================
 * EMPTY SUMMARY
 * =========================================================
 */

const EMPTY_SUMMARY = {
  total_branches: 0,
  active_branches: 0,
  total_members: 0,
};

/*
 * =========================================================
 * FETCH HELPER
 * =========================================================
 */

async function fetchJson(
  path,
  signal,
) {
  const response =
    await fetch(
      `/api${path}`,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },

        cache:
          "no-store",

        signal,
      },
    );

  const responseText =
    await response.text();

  let responseBody = null;

  if (responseText) {
    try {
      responseBody =
        JSON.parse(
          responseText,
        );
    } catch {
      responseBody =
        responseText;
    }
  }

  if (!response.ok) {
    const message =
      typeof responseBody ===
      "object"
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

/*
 * =========================================================
 * DATE FORMAT
 * =========================================================
 */

function formatCreatedDate(
  value,
  locale = "km",
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(
      value,
    );
  }

  return new Intl.DateTimeFormat(
    locale === "en" ? "en-US" : "km-KH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

/*
 * =========================================================
 * LOOKUP LABEL HELPERS
 * =========================================================
 */

function getProvinceLabel(
  province,
  label,
) {
  if (label) {
    return label(province, "");
  }

  return (
    province?.labelKm ||
    province?.label_km ||
    province?.labelEn ||
    province?.label_en ||
    province?.name_km ||
    province?.nameKm ||
    province?.name_en ||
    province?.nameEn ||
    ""
  );
}

function getStatusLabel(
  status,
  label,
) {
  if (label) {
    return label(status, "");
  }

  const statusCode =
    String(
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
    STATUS_LABELS_KM[
      statusCode
    ] ||
    status?.code ||
    ""
  );
}

/*
 * =========================================================
 * STATUS BADGE
 * =========================================================
 */

function BranchStatusBadge({
  statusCode,
  statusLabel,
}) {
  const normalizedCode =
    String(
      statusCode || "",
    ).toUpperCase();

  const isActive =
    normalizedCode ===
      "ACTIVE" ||
    statusLabel ===
      "សកម្ម";

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
  const { user } = useAuth();
  const { t, label, locale } =
    useLanguage();

  const isViewer = normalizeRole(user?.role) === "viewer";
  /*
   * =======================================================
   * UI STATE
   * =======================================================
   */

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [
    branches,
    setBranches,
  ] = useState([]);

  const [
    summary,
    setSummary,
  ] = useState(
    EMPTY_SUMMARY,
  );

  const [
    provinceLookups,
    setProvinceLookups,
  ] = useState([]);

  const [
    statusLookups,
    setStatusLookups,
  ] = useState([]);

  const [
    districtLookups,
    setDistrictLookups,
  ] = useState([]);

  const [
    communeLookups,
    setCommuneLookups,
  ] = useState([]);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

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
    selectedDate,
    setSelectedDate,
  ] = useState(null);

  const [
    showSaveFile,
    setShowSaveFile,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  /*
   * =======================================================
   * LOAD BRANCHES
   * =======================================================
   */

  const loadBranches =
    useCallback(
      async (
        signal,
      ) => {
        async function setRealBranches(
          items,
        ) {
          /*
           * Load real member count for each branch.
           */
          const counts =
            await Promise.all(
              items.map(
                async (
                  branch,
                ) => {
                  try {
                    const members =
                      await fetchJson(
                        `/members?page=0&size=1&branchId=${encodeURIComponent(
                          branch.id,
                        )}`,
                        signal,
                      );

                    return (
                      Number(
                        members?.total_elements ??
                          members?.totalElements ??
                          0,
                      ) || 0
                    );
                  } catch {
                    return 0;
                  }
                },
              ),
            );

          const enriched =
            items.map(
              (
                branch,
                index,
              ) => ({
                ...branch,

                member_count:
                  counts[
                    index
                  ],
              }),
            );

          setBranches(
            enriched,
          );

          /*
           * Build cards from the exact branch rows
           * currently loaded.
           */
          setSummary({
            total_branches:
              enriched.length,

            active_branches:
              enriched.filter(
                (
                  branch,
                ) =>
                  Number(
                    branch.status_id ??
                      branch.statusId,
                  ) === 1,
              ).length,

            total_members:
              counts.reduce(
                (
                  total,
                  count,
                ) =>
                  total +
                  count,
                0,
              ),
          });
        }

        /*
         * Load first page.
         */
        const firstPage =
          await fetchJson(
            "/branches?page=0&size=100",
            signal,
          );

        const firstContent =
          Array.isArray(
            firstPage?.content,
          )
            ? firstPage.content
            : Array.isArray(
                  firstPage,
                )
              ? firstPage
              : [];

        const totalPages =
          Math.max(
            Number(
              firstPage?.total_pages ??
                firstPage?.totalPages ??
                1,
            ),
            1,
          );

        /*
         * Only one page.
         */
        if (
          totalPages <= 1
        ) {
          await setRealBranches(
            firstContent,
          );

          return;
        }

        /*
         * Load remaining pages.
         */
        const remainingRequests =
          Array.from(
            {
              length:
                totalPages -
                1,
            },
            (
              _,
              index,
            ) =>
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
              Array.isArray(
                page?.content,
              )
                ? page.content
                : [],
          );

        await setRealBranches(
          [
            ...firstContent,
            ...remainingContent,
          ],
        );
      },
      [],
    );

  /*
   * =======================================================
   * LOAD FILTER LOOKUPS
   * =======================================================
   */

  const loadLookups =
    useCallback(
      async (
        signal,
      ) => {
        /*
         * Province options:
         *
         * IMPORTANT:
         * This endpoint only returns provinces
         * that currently have branches.
         */
        try {
          const provinces =
            await fetchJson(
              "/lookups/branches/province-options",
              signal,
            );

          setProvinceLookups(
            Array.isArray(
              provinces,
            )
              ? provinces
              : [],
          );
        } catch (
          error
        ) {
          if (
            error.name !==
            "AbortError"
          ) {
            console.warn(
              "Failed to load province options:",
              error.message,
            );
          }

          setProvinceLookups(
            [],
          );
        }

        /*
         * Branch status options.
         */
        try {
          const statuses =
            await fetchJson(
              "/lookups/branch-statuses",
              signal,
            );

          setStatusLookups(
            Array.isArray(
              statuses,
            )
              ? statuses
              : [],
          );
        } catch (
          error
        ) {
          if (
            error.name !==
            "AbortError"
          ) {
            console.warn(
              "Failed to load branch statuses:",
              error.message,
            );
          }

          setStatusLookups(
            [],
          );
        }
      },
      [],
    );

  /*
   * =======================================================
   * LOAD PAGE
   * =======================================================
   */

  const loadBranchPage =
    useCallback(
      async (
        signal,
      ) => {
        setIsLoading(
          true,
        );

        setLoadError(
          "",
        );

        try {
          await Promise.all([
            loadBranches(
              signal,
            ),

            loadLookups(
              signal,
            ),
          ]);
        } catch (
          error
        ) {
          if (
            error.name !==
            "AbortError"
          ) {
            console.warn(
              "Failed to load branch page:",
              error.message,
            );

            setLoadError(
              t("branchPage.loadListFailed"),
            );
          }
        } finally {
          if (
            !signal?.aborted
          ) {
            setIsLoading(
              false,
            );
          }
        }
      },
      [
        loadBranches,
        loadLookups,
        t,
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
  }, [
    loadBranchPage,
  ]);

  /*
   * =======================================================
   * LOAD DISTRICTS / COMMUNES NEEDED BY CURRENT BRANCHES
   * =======================================================
   */

  useEffect(() => {
    if (
      branches.length ===
      0
    ) {
      setDistrictLookups(
        [],
      );

      setCommuneLookups(
        [],
      );

      return undefined;
    }

    const controller =
      new AbortController();

    async function loadGeography() {
      const provinceIds =
        [
          ...new Set(
            branches
              .map(
                (
                  branch,
                ) =>
                  branch.province_id ??
                  branch.provinceId,
              )
              .filter(
                Boolean,
              ),
          ),
        ];

      const districtIds =
        [
          ...new Set(
            branches
              .map(
                (
                  branch,
                ) =>
                  branch.district_id ??
                  branch.districtId,
              )
              .filter(
                Boolean,
              ),
          ),
        ];

      const [
        districtGroups,
        communeGroups,
      ] =
        await Promise.all([
          Promise.all(
            provinceIds.map(
              (
                provinceId,
              ) =>
                fetchJson(
                  `/lookups/districts?provinceId=${provinceId}`,
                  controller.signal,
                ).catch(
                  () =>
                    [],
                ),
            ),
          ),

          Promise.all(
            districtIds.map(
              (
                districtId,
              ) =>
                fetchJson(
                  `/lookups/communes?districtId=${districtId}`,
                  controller.signal,
                ).catch(
                  () =>
                    [],
                ),
            ),
          ),
        ]);

      if (
        !controller
          .signal
          .aborted
      ) {
        setDistrictLookups(
          districtGroups.flat(),
        );

        setCommuneLookups(
          communeGroups.flat(),
        );
      }
    }

    loadGeography();

    return () => {
      controller.abort();
    };
  }, [
    branches,
  ]);

  /*
   * =======================================================
   * DOWNLOAD POPUP AUTO CLOSE
   * =======================================================
   */

  useEffect(() => {
    if (
      !showSaveFile
    ) {
      return undefined;
    }

    const timeoutId =
      window.setTimeout(
        () => {
          setShowSaveFile(
            false,
          );
        },
        3000,
      );

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [
    showSaveFile,
  ]);

  /*
   * =======================================================
   * LOOKUP MAPS
   * =======================================================
   */

  const provinceById =
    useMemo(
      () =>
        new Map(
          provinceLookups.map(
            (
              province,
            ) => [
              String(
                province?.value ??
                  province?.id ??
                  "",
              ),

              province,
            ],
          ),
        ),
      [
        provinceLookups,
      ],
    );

  const statusById =
    useMemo(
      () =>
        new Map(
          statusLookups.map(
            (
              status,
            ) => [
              String(
                status?.value ??
                  status?.id ??
                  "",
              ),

              status,
            ],
          ),
        ),
      [
        statusLookups,
      ],
    );

  const districtById =
    useMemo(
      () =>
        new Map(
          districtLookups.map(
            (
              item,
            ) => [
              String(
                item?.value ??
                  item?.id ??
                  "",
              ),

              item,
            ],
          ),
        ),
      [
        districtLookups,
      ],
    );

  const communeById =
    useMemo(
      () =>
        new Map(
          communeLookups.map(
            (
              item,
            ) => [
              String(
                item?.value ??
                  item?.id ??
                  "",
              ),

              item,
            ],
          ),
        ),
      [
        communeLookups,
      ],
    );

  /*
   * =======================================================
   * NORMALIZE BRANCH DATA
   * =======================================================
   */

  const mappedBranches =
    useMemo(
      () =>
        branches.map(
          (
            branch,
          ) => {
            const branchLevelId =
              branch?.branch_level_id ??
              branch?.branchLevelId ??
              branch?.branch_level
                ?.id ??
              branch?.branchLevel
                ?.id ??
              "";

            const provinceId =
              branch?.province_id ??
              branch?.provinceId ??
              branch?.province
                ?.id ??
              "";

            const districtId =
              branch?.district_id ??
              branch?.districtId ??
              branch?.district
                ?.id ??
              "";

            const communeId =
              branch?.commune_id ??
              branch?.communeId ??
              branch?.commune
                ?.id ??
              "";

            const statusId =
              branch?.status_id ??
              branch?.statusId ??
              branch?.status
                ?.id ??
              "";

            const provinceLookup =
              provinceById.get(
                String(
                  provinceId,
                ),
              );

            const statusLookup =
              statusById.get(
                String(
                  statusId,
                ),
              );

            const districtLookup =
              districtById.get(
                String(
                  districtId,
                ),
              );

            const communeLookup =
              communeById.get(
                String(
                  communeId,
                ),
              );

            const statusCode =
              String(
                branch?.status_code ||
                  branch?.statusCode ||
                  branch?.status
                    ?.code ||
                  statusLookup?.code ||
                  "",
              ).toUpperCase();

            const statusLabel =
              branch?.status_name_km ||
              branch?.statusNameKm ||
              branch?.status
                ?.name_km ||
              branch?.status
                ?.nameKm ||
              branch?.status
                ?.label_km ||
              branch?.status
                ?.labelKm ||
              getStatusLabel(
                statusLookup,
                label,
              ) ||
              STATUS_LABELS_KM[
                statusCode
              ] ||
              "-";

            const provinceLabel =
              branch?.province_name_km ||
              branch?.provinceNameKm ||
              branch?.province
                ?.name_km ||
              branch?.province
                ?.nameKm ||
              branch?.province
                ?.name_en ||
              branch?.province
                ?.nameEn ||
              getProvinceLabel(
                provinceLookup,
                label,
              ) ||
              "-";

            return {
              id:
                branch?.id,

              name:
                label(branch, "-"),

              code:
                branch?.branch_code ||
                branch?.branchCode ||
                "-",

              levelId:
                branchLevelId,

              level:
                branch?.branch_level_name_km ||
                branch?.branchLevelNameKm ||
                branch?.branch_level
                  ?.name_km ||
                branch?.branchLevel
                  ?.nameKm ||
                (String(branchLevelId) === "1"
                  ? t("branchPage.province")
                  : String(branchLevelId) === "2"
                    ? t("branchPage.district")
                    : String(branchLevelId) === "3"
                      ? t("branchPage.commune")
                      : BRANCH_LEVEL_LABELS[
                          branchLevelId
                        ]) ||
                "-",

              provinceId,

              province:
                provinceLabel,

              districtId,

              district:
                branch?.district_name_km ||
                branch?.districtNameKm ||
                branch?.district
                  ?.name_km ||
                branch?.district
                  ?.nameKm ||
                getProvinceLabel(
                  districtLookup,
                  label,
                ) ||
                "-",

              communeId,

              commune:
                branch?.commune_name_km ||
                branch?.communeNameKm ||
                branch?.commune
                  ?.name_km ||
                branch?.commune
                  ?.nameKm ||
                getProvinceLabel(
                  communeLookup,
                  label,
                ) ||
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
                  locale,
                ),

              createdAtValue:
                String(
                  branch?.created_at ||
                    branch?.createdAt ||
                    "",
                ).slice(0, 10),
            };
          },
        ),
      [
        branches,
        provinceById,
        statusById,
        districtById,
        communeById,
        label,
        locale,
        t,
      ],
    );

  /*
   * =======================================================
   * FILTER OPTIONS
   * =======================================================
   *
   * Each filter explicitly contains an "All" option.
   */

  const branchLevelOptions =
    useMemo(
      () => [
        t("branchPage.allLevels"),

        t("branchPage.province"),
        t("branchPage.district"),
        t("branchPage.commune"),
      ],
      [t],
    );

  const provinceOptions =
    useMemo(
      () => [
        t("branchPage.allProvinces"),

        ...provinceLookups
          .map(
            (province) =>
              getProvinceLabel(
                province,
                label,
              ),
          )
          .filter(
            Boolean,
          ),
      ],
      [
        provinceLookups,
        label,
        t,
      ],
    );

  const branchStatusOptions =
    useMemo(
      () => [
        t("branchPage.allStatuses"),

        ...statusLookups
          .map(
            (status) =>
              getStatusLabel(
                status,
                label,
              ),
          )
          .filter(
            Boolean,
          ),
      ],
      [
        statusLookups,
        label,
        t,
      ],
    );

  /*
   * =======================================================
   * FILTER BRANCHES
   * =======================================================
   */

  const filteredBranches =
    useMemo(
      () => {
        const query =
          searchQuery
            .trim()
            .toLowerCase();

        const selectedDateValue =
          selectedDate
            ? selectedDate
                .toISOString()
                .split("T")[0]
            : "";

        return mappedBranches.filter(
          (
            branch,
          ) => {
            /*
             * Search
             */
            const matchesSearch =
              !query ||
              branch.name
                .toLowerCase()
                .includes(
                  query,
                ) ||
              branch.code
                .toLowerCase()
                .includes(
                  query,
                ) ||
              branch.province
                .toLowerCase()
                .includes(
                  query,
                ) ||
              branch.district
                .toLowerCase()
                .includes(
                  query,
                );

            /*
             * Level
             */
            const matchesLevel =
              !selectedLevel ||
              selectedLevel ===
                ALL_LEVELS_LABEL ||
              selectedLevel ===
                t("branchPage.allLevels") ||
              branch.level ===
                selectedLevel;

            /*
             * Province
             */
            const matchesProvince =
              !selectedProvince ||
              selectedProvince ===
                ALL_PROVINCES_LABEL ||
              selectedProvince ===
                t("branchPage.allProvinces") ||
              branch.province ===
                selectedProvince;

            /*
             * Status
             */
            const matchesStatus =
              !selectedStatus ||
              selectedStatus ===
                ALL_STATUSES_LABEL ||
              selectedStatus ===
                t("branchPage.allStatuses") ||
              branch.statusLabel ===
                selectedStatus;

            /*
             * Created date
             */
            const matchesDate =
              !selectedDateValue ||
              branch.createdAtValue ===
                selectedDateValue;

            return (
              matchesSearch &&
              matchesLevel &&
              matchesProvince &&
              matchesStatus &&
              matchesDate
            );
          },
        );
      },
      [
        mappedBranches,
        searchQuery,
        selectedLevel,
        selectedProvince,
        selectedStatus,
        selectedDate,
        t,
      ],
    );

  /*
   * =======================================================
   * CREATE BRANCH CALLBACK
   * =======================================================
   */

  const handleCreateBranch =
    async () => {
      setShowCreateModal(
        false,
      );

      const controller =
        new AbortController();

      await loadBranchPage(
        controller.signal,
      );
    };
    

  /*
   * =======================================================
   * TABLE COLUMNS
   * =======================================================
   */

  const columns = [
    {
      key: "no",
      label: t("branchPage.no"),
      width: "5%",
      align: "center",

      render:
        (
          _row,
          index,
        ) =>
          index + 1,
    },

    {
      key: "name",
      label: t("branchPage.branchName"),
      width: "20%",
      align: "left",
      truncate: true,

      render:
        (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">
              {row.name}
            </p>
          </div>
        ),
    },

    {
      key: "level",
      label: t("branchPage.level"),
      width: "15%",
      align: "left",

      render:
        (row) =>
          row.level,
    },

    {
      key: "province",
      label: t("branchPage.province"),
      width: "13%",
      align: "left",

      render:
        (row) =>
          row.province,
    },

    {
      key: "district",
      label: t("branchPage.district"),
      width: "12%",
      align: "center",

      render:
        (row) =>
          row.district,
    },

    {
      key: "memberCount",
      label: t("branchPage.members"),
      width: "10%",
      align: "center",

      render:
        (row) =>
          row.memberCount,
    },

    {
      key: "status",
      label: t("branchPage.status"),
      width: "11%",
      align: "center",

      render:
        (row) => (
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
      label: t("branchPage.createdAt"),
      width: "13%",
      align: "center",

      render:
        (row) =>
          row.createdAt,
    },

    {
      key: "actions",
      label: t("branchPage.actions"),
      width: "13%",
      align: "center",

      render:
        (row) => (
          <div className="flex items-center justify-center">
            <Link
              href={`/branch/${row.id}`}
              className="
                inline-flex
                h-8
                items-center
                justify-center
                gap-1.5
                whitespace-nowrap
                rounded-lg
                bg-primary
                px-3
                text-[11px]
                font-semibold
                text-white
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-primary-hover
                hover:shadow-sm
                active:translate-y-0
              "
            >
              <List
                size={14}
              />

              {t("branchPage.detail")}
            </Link>
          </div>
        ),
    },
  ];

  /*
   * =======================================================
   * FILTER BAR
   * =======================================================
   */

  const filters = [
    {
      key:
        "level",

      value:
        selectedLevel,

      onChange:
        setSelectedLevel,

      placeholder:
        t("branchPage.level"),

      options:
        branchLevelOptions,

      width:
        "sm:min-w-[110px]",
    },

    {
      key:
        "province",

      value:
        selectedProvince,

      onChange:
        setSelectedProvince,

      placeholder:
        t("branchPage.province"),

      options:
        provinceOptions,

      width:
        "sm:min-w-[100px]",
    },

    {
      key:
        "status",

      value:
        selectedStatus,

      onChange:
        setSelectedStatus,

      placeholder:
        t("branchPage.status"),

      options:
        branchStatusOptions,

      width:
        "sm:min-w-[95px]",
    },

    {
      key:
        "date",

      value:
        selectedDate,

      onChange:
        setSelectedDate,

      placeholder:
        t("common.datePlaceholder"),

      type:
        "date",

      width:
        "sm:w-[165px]",
    },
  ];

    const handleDownload = () => {
      const rows =
        filteredBranches.map(
          (branch, index) => ({
            "ល.រ": index + 1,
            "ឈ្មោះសាខា":
              branch.name || "-",
            "កម្រិតសាខា":
              branch.level || "-",
            "រាជធានី/ខេត្ត":
              branch.province || "-",
            "ក្រុង/ស្រុក/ខណ្ឌ":
              branch.district || "-",
            "ចំនួនសមាជិក":
              branch.memberCount ??
              0,
            "ស្ថានភាព":
              branch.statusLabel ||
              "-",
            "ថ្ងៃបង្កើត":
              branch.createdAt ||
              "-",
          }),
        );

      const downloaded =
        downloadExcel({
          rows,
          fileName: "branches",
          sheetName: "Branches",
        });

      if (downloaded) {
        setShowSaveFile(false);
      }
    };

  /*
   * =======================================================
   * PAGE
   * =======================================================
   */

  return (
    <div className="min-w-0 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-primary">
          {t("branchPage.listTitle")}
        </h1>

        <p className="mt-1 text-xs text-text-secondary">
          {t("branchPage.listSubtitle")}
        </p>
      </div>

      <BranchStats
        branches={
          mappedBranches
        }
        summary={
          summary
        }
      />

      <section className="rounded-xl border border-border bg-bg-page-white p-4 transition-shadow duration-200 hover:shadow-sm">
        <div className="mb-4 flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto">
          {/* Search */}
          <div className="w-[140px] shrink-0">
            <SearchBar
              value={
                searchQuery
              }
              onChange={
                setSearchQuery
              }
              placeholder={t("branchPage.searchBranch")}
              width="w-full"
            />
          </div>

          {/* Filters */}
          <div className="shrink-0">
            <FilterBar
              filters={
                filters
              }
              className="flex-nowrap"
            />
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-3 sm:ml-auto [&>button]:w-auto">
            <Button
              type="button"
              variant="primary"
              icon={
                <RiDownloadCloud2Line
                  size={16}
                />
              }
              onClick={handleDownload}
              disabled={filteredBranches.length === 0}
            >
              {t("branchPage.download")}
            </Button>

            {!isViewer && (
              <Button
                type="button"
                variant="success"
                icon={
                  <PlusCircle
                    size={16}
                  />
                }
                onClick={() =>
                  setShowCreateModal(true)
                }
              >
                {t("branchPage.createBranch")}
              </Button>
            )}
          </div>
        </div>

        {loadError && (
          <div className="mb-4 rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
            {loadError}
          </div>
        )}

        <Table
          columns={
            columns
          }
          data={
            filteredBranches
          }
          rowsPerPage={
            10
          }
          scrollable={
            true
          }
          emptyMessage={
            isLoading
              ? t("branchPage.loadingData")
              : t("branchPage.noBranches")
          }
        />
      </section>

      {!isViewer && <CreateBranchModal
        open={
          showCreateModal
        }
        onClose={() =>
          setShowCreateModal(
            false,
          )
        }
        onSave={
          handleCreateBranch
        }
      />}
    </div>
  );
}
