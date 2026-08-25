"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  Building2,
  CalendarDays,
  ChevronRight,
  List,
  Mail,
  MapPin,
  Mars,
  Navigation,
  Pencil,
  Phone,
  PlusCircle,
  Users,
} from "lucide-react";

import SearchBar from "@/components/table-items/SearchBar";
import FilterBar from "@/components/table-items/FilterBar";
import Table from "@/components/table-items/Table";

import Button from "@/components/ui/Button";
import CreateBranchModal from "@/components/branch/CreateBranchModal";
import CreateMemberModal from "@/components/popup/CreateMemberModal.js";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/navigation";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
  "http://localhost:8081";

const ALL_OPTION = "ទាំងអស់";

const STATUS_OPTIONS = [
  ALL_OPTION,
  "សកម្ម",
  "អសកម្ម",
];

const GENDER_LABELS = {
  MALE: "ប្រុស",
  FEMALE: "ស្រី",
  OTHER: "ផ្សេងៗ",
};

const ROLE_LABELS = {
  ADMIN: "អ្នកគ្រប់គ្រង",
  BRANCH_LEADER: "ប្រធានសាខា",
  SECRETARY: "លេខាធិការ",
  MEMBER: "សមាជិក",
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

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(date);
}

function getGenderCode(value) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }

  return String(
    value?.code ||
      value?.value ||
      "",
  ).toUpperCase();
}

function getGenderLabel(value) {
  if (
    value &&
    typeof value === "object"
  ) {
    return (
      value?.label_km ||
      value?.labelKm ||
      value?.label_en ||
      value?.labelEn ||
      GENDER_LABELS[
        getGenderCode(value)
      ] ||
      "-"
    );
  }

  return (
    GENDER_LABELS[
      getGenderCode(value)
    ] ||
    value ||
    "-"
  );
}

function getRoleCode(value) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }

  return String(
    value?.code ||
      value?.value ||
      "",
  ).toUpperCase();
}

function getRoleLabel(value) {
  if (
    value &&
    typeof value === "object"
  ) {
    return (
      value?.label_km ||
      value?.labelKm ||
      value?.label_en ||
      value?.labelEn ||
      ROLE_LABELS[
        getRoleCode(value)
      ] ||
      "-"
    );
  }

  const roleCode =
    getRoleCode(value);

  return (
    ROLE_LABELS[roleCode] ||
    value ||
    "-"
  );
}

function getStatusCode(value) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }

  return String(
    value?.code ||
      value?.value ||
      "",
  ).toUpperCase();
}

function getStatusLabel(value) {
  const code =
    getStatusCode(value);

  if (
    value &&
    typeof value === "object"
  ) {
    return (
      value?.label_km ||
      value?.labelKm ||
      value?.name_km ||
      value?.nameKm ||
      (code === "ACTIVE"
        ? "សកម្ម"
        : code === "INACTIVE"
          ? "អសកម្ម"
          : "-")
    );
  }

  if (code === "ACTIVE") {
    return "សកម្ម";
  }

  if (code === "INACTIVE") {
    return "អសកម្ម";
  }

  return value || "-";
}

function getProfileImage(member) {
  const profilePhotoId =
    member?.profile_photo?.id ??
    member?.profilePhoto?.id ??
    member?.profile_photo_id ??
    member?.profilePhotoId;

  if (profilePhotoId) {
    return `/api/files/${encodeURIComponent(profilePhotoId)}/content`;
  }

  const imagePath =
    member?.profile_photo?.url ||
    member?.profilePhoto?.url ||
    member?.profile_photo_url ||
    member?.profilePhotoUrl ||
    member?.profile_image ||
    member?.profileImage ||
    "";

  if (!imagePath) {
    return "/profiles/default-avatar.jpg";
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  const normalizedPath =
    imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;

  return `${BACKEND_ORIGIN}${normalizedPath}`;
}

function StatusBadge({ status }) {
  const statusCode =
    getStatusCode(status);

  const isActive =
    statusCode === "ACTIVE";

  return (
    <span
      className={`inline-flex min-w-[68px] items-center justify-center rounded-full px-3 py-1 text-[11px] font-medium ${
        isActive
          ? "bg-success-bg text-success"
          : "bg-error-bg text-error"
      }`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function DetailStatCard({
  title,
  value,
  helper,
  icon: Icon,
  iconClassName,
  borderClassName,
}) {
  return (
    <div
      className={`rounded-xl border border-border border-t-2 bg-bg-page-white p-4 shadow-sm ${borderClassName}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
        >
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-text-secondary">
            {title}
          </p>

          <p className="mt-1 truncate text-xl font-bold text-text-primary">
            {value}
          </p>

          {helper && (
            <p className="mt-1 text-[11px] text-success">
              {helper}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function LeaderCard({
  person,
  title,
  onAdd,
}) {
  if (!person) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-bg-page-white p-6 text-center shadow-sm">
      <Building2
        size={30}
        className="mx-auto text-text-secondary"
      />

      <p className="mt-2 text-sm font-semibold text-text-primary">
        មិនទាន់មាន{title}
      </p>

      <p className="mt-1 text-xs text-text-secondary">
        សូមជ្រើសរើសសមាជិកម្នាក់ ដើម្បីកំណត់ជា{title}
      </p>

      {onAdd && <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-success px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        <PlusCircle size={15} />
        បន្ថែម{title}
      </button>}
    </div>
  );
}

  return (
    <div className="min-w-0 overflow-x-auto rounded-lg border border-border bg-bg-page-white px-5 py-4 shadow-sm">
      <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[250px_150px_240px_150px_150px_auto]">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={
                person.profileImage ||
                "/profiles/default-avatar.jpg"
              }
              alt={
                person.nameKm ||
                title
              }
              fill
              sizes="64px"
              className="object-cover"
              unoptimized={Boolean(person.profileImage)}
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-bold text-text-primary">
              {person.nameKm || "-"}
            </p>

            <p className="mt-1 truncate text-xs text-text-secondary">
              {person.nameEn || "-"}
            </p>

            <div className="mt-2">
              <StatusBadge
                status={
                  person.status ||
                  "ACTIVE"
                }
              />
            </div>
          </div>
        </div>

        <div className="min-w-0 lg:border-l lg:border-border lg:pl-5">
          <div className="flex items-center gap-2">
            <Mars
              size={15}
              className="shrink-0 text-text-secondary"
            />

            <span className="text-[11px] text-text-secondary">
              ភេទ
            </span>

            <span className="truncate text-[13px] font-normal text-text-primary">
              {person.gender || "-"}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Building2
              size={15}
              className="shrink-0 text-text-secondary"
            />

            <span className="text-[11px] text-text-secondary">
              តួនាទី
            </span>

            <span className="truncate text-[13px] font-normal text-text-primary">
              {person.roleLabel || "-"}
            </span>
          </div>
        </div>

        <div className="min-w-0 lg:border-l lg:border-border lg:pl-5">
          <div className="flex items-center gap-2">
            <Phone
              size={15}
              className="shrink-0 text-text-secondary"
            />

            <span className="truncate text-sm font-medium text-text-primary">
              {person.phone || "-"}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Mail
              size={15}
              className="shrink-0 text-text-secondary"
            />

            <span className="truncate text-sm font-medium text-text-primary">
              {person.email || "-"}
            </span>
          </div>
        </div>

        <div className="min-w-0 lg:border-l lg:border-border lg:pl-5">
          <div className="flex items-center gap-2">
            <CalendarDays
              size={15}
              className="shrink-0 text-text-secondary"
            />

            <span className="text-xs text-text-secondary">
              ថ្ងៃខែឆ្នាំកំណើត
            </span>
          </div>

          <p className="mt-2 text-sm font-medium text-text-primary">
            {formatDate(
              person.dateOfBirth,
            )}
          </p>
        </div>

        <div className="min-w-0 lg:border-l lg:border-border lg:pl-5">
          <div className="flex items-start gap-2">
            <CalendarDays
              size={15}
              className="mt-0.5 shrink-0 text-text-secondary"
            />

            <div className="min-w-0">
              <p className="text-xs text-text-secondary">
                ថ្ងៃចូលរួម
              </p>

              <p className="mt-1 truncate text-sm font-medium text-text-primary">
                {formatDate(
                  person.joinedAt,
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-start lg:justify-end">
          <Link
            href={`/member/memberInfo/${person.id}/documents`}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <List size={15} />

            ព័ត៌មានលម្អិត
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BranchDetailPage() {
  const { user } = useAuth();
  const isViewer = normalizeRole(user?.role) === "viewer";
  const params = useParams();

  const branchId = String(
    params?.id || "",
  );

  const [
    branchDetails,
    setBranchDetails,
  ] = useState(null);

  const [
    leaderCandidates,
    setLeaderCandidates,
  ] = useState([]);

  const [members, setMembers] =
    useState([]);

  const [
    isEditModalOpen,
    setIsEditModalOpen,
  ] = useState(false);

  const [
    isCreateOpen,
    setIsCreateOpen,
  ] = useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState(ALL_OPTION);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

const loadBranchDetails =
  useCallback(
    async (signal) => {
      const details =
        await fetchJson(
          `/branches/${branchId}/details`,
          signal,
        );

      setBranchDetails({
        branch:
          details?.branch ??
          null,

        leaders:
          Array.isArray(
            details?.leaders,
          )
            ? details.leaders
            : Array.isArray(
                  details?.management_members,
                )
              ? details.management_members
              : [],

        summary:
          details?.summary ?? {
            total_members: 0,
            total_activities: 0,
          },
      });
    },
    [branchId],
  );

  const loadLeaderCandidates =
    useCallback(
      async () => {
        // Candidates are derived from the real branch-member response.
      },
      [],
    );

  const loadMembers = useCallback(
    async (signal) => {
      try {
        const firstPage =
          await fetchJson(
            `/branches/${encodeURIComponent(
              branchId,
            )}/members?page=0&size=100`,
            signal,
          );

        const firstContent =
          Array.isArray(
            firstPage?.content,
          )
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
          setMembers(firstContent);
          setLeaderCandidates(firstContent);
          return;
        }

        const remainingPages =
          await Promise.all(
            Array.from(
              {
                length:
                  totalPages - 1,
              },
              (_, index) =>
                fetchJson(
                  `/branches/${encodeURIComponent(
                      branchId,
                    )}/members?page=${index + 1}&size=100`,
                  signal,
                ),
            ),
          );

        const allMembers = [
          ...firstContent,
          ...remainingPages.flatMap(
            (page) =>
              Array.isArray(
                page?.content,
              )
                ? page.content
                : [],
          ),
        ];

        setMembers(allMembers);
        setLeaderCandidates(allMembers);
      } catch (error) {
        if (
          error.name !== "AbortError"
        ) {
          console.warn(
            "Failed to load branch members:",
            error.message,
          );
        }

        setMembers([]);
      }
    },
    [branchId],
  );

  const loadPage = useCallback(
    async (signal) => {
      if (!branchId) {
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        await Promise.all([
          loadBranchDetails(signal),
          loadLeaderCandidates(signal),
          loadMembers(signal),
        ]);
      } catch (error) {
        if (
          error.name !== "AbortError"
        ) {
          console.error(
            "Failed to load branch details:",
            error,
          );

          setLoadError(
            "មិនអាចទាញយកព័ត៌មានសាខាបានទេ",
          );
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [
      branchId,
      loadBranchDetails,
      loadLeaderCandidates,
      loadMembers,
    ],
  );

  useEffect(() => {
    const controller =
      new AbortController();

    loadPage(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadPage]);

  const branch = useMemo(() => {
    const item =
      branchDetails?.branch;

    if (!item) {
      return null;
    }

    return {
      id: item?.id,

      name:
        item?.name_km ||
        item?.nameKm ||
        item?.name_en ||
        item?.nameEn ||
        "-",

      nameKm:
        item?.name_km ||
        item?.nameKm ||
        "",

      nameEn:
        item?.name_en ||
        item?.nameEn ||
        "",

      code:
        item?.branch_code ||
        item?.branchCode ||
        "-",

      branchLevelId:
        item?.branch_level_id ??
        item?.branchLevelId ??
        "",

      parentBranchId:
        item?.parent_branch_id ??
        item?.parentBranchId ??
        null,

      provinceId:
        item?.province_id ??
        item?.provinceId ??
        null,

      districtId:
        item?.district_id ??
        item?.districtId ??
        null,

      communeId:
        item?.commune_id ??
        item?.communeId ??
        null,

      statusId:
        item?.status_id ??
        item?.statusId ??
        null,

      addressLine:
        item?.address || "-",

      googleMapUrl:
        item?.google_map_url ||
        item?.googleMapUrl ||
        null,

      phone:
        item?.phone || "-",

      email:
        item?.email || "-",

      createdAt:
        item?.created_at ||
        item?.createdAt ||
        null,

      updatedAt:
        item?.updated_at ||
        item?.updatedAt ||
        null,

      memberCount:
        Number(
          branchDetails?.summary
            ?.total_members ??
            branchDetails?.summary
              ?.totalMembers ??
            members.length,
        ) || 0,

      activityCount:
        Number(
          branchDetails?.summary
            ?.total_activities ??
            branchDetails?.summary
              ?.totalActivities,
        ) || 0,
    };
  }, [branchDetails, members.length]);

  const mappedLeaders = useMemo(
    () =>
      (
        Array.isArray(
          branchDetails?.leaders,
        )
          ? branchDetails.leaders
          : []
      ).map((person) => {
        const roleCode =
          getRoleCode(
            person?.role,
          );

        return {
          id:
            person?.member_id ??
            person?.memberId,

          nameKm:
            person?.full_name_km ||
            person?.fullNameKm ||
            "-",

          nameEn:
            person?.full_name_en ||
            person?.fullNameEn ||
            "-",

          phone:
            person?.phone || "-",

          email:
            person?.email || "-",

          dateOfBirth:
            person?.date_of_birth ||
            person?.dateOfBirth ||
            null,

          joinedAt:
            person?.joined_on ||
            person?.joinedOn ||
            null,

          gender:
            getGenderLabel(
              person?.gender,
            ),

          role: roleCode,

          roleLabel:
            getRoleLabel(roleCode),

          status: "ACTIVE",

          profileImage:
            getProfileImage(person),
        };
      }),
    [branchDetails],
  );

  const branchLeader = useMemo(
    () =>
      mappedLeaders.find(
        (person) =>
          person.role ===
          "BRANCH_LEADER",
      ) || null,
    [mappedLeaders],
  );

  const secretaries = useMemo(
    () =>
      mappedLeaders.filter(
        (person) =>
          person.role ===
          "SECRETARY",
      ),
    [mappedLeaders],
  );

  const mappedMembers = useMemo(
    () =>
      members.map((member) => {
        const status =
          member?.status || {
            code:
              member?.status_code ||
              member?.statusCode ||
              "",
            label_km:
              member?.status_name_km ||
              member?.statusNameKm ||
              "",
          };

        const role =
          member?.role ||
          member?.user_role ||
          member?.userRole ||
          "";

        return {
          id: member?.id,

          nameKm:
            member?.full_name_km ||
            member?.fullNameKm ||
            "-",

          nameEn:
            member?.full_name_en ||
            member?.fullNameEn ||
            "-",

          profileImage:
            getProfileImage(member),

          gender:
            getGenderLabel(
              member?.gender,
            ),

          role:
            getRoleLabel(role),

          status,

          joinedAt:
            formatDate(
              member?.joined_on ||
                member?.joinedOn,
            ),
        };
      }),
    [members],
  );

  const leaderOptions = useMemo(
    () =>
      leaderCandidates.map(
        (candidate) => ({
          label:
            candidate?.full_name_km ||
            candidate?.fullNameKm ||
            candidate?.full_name_en ||
            candidate?.fullNameEn ||
            `សមាជិក ${
              candidate?.member_id ??
              candidate?.memberId ??
              candidate?.id
            }`,

          value: String(
            candidate?.member_id ??
              candidate?.memberId ??
              candidate?.id ??
              "",
          ),

          member: {
            id:
              candidate?.member_id ??
              candidate?.memberId ??
              candidate?.id,

            nameKm:
              candidate?.full_name_km ||
              candidate?.fullNameKm ||
              "-",

            nameEn:
              candidate?.full_name_en ||
              candidate?.fullNameEn ||
              "-",

            phone:
              candidate?.phone || "-",

            email:
              candidate?.email || "-",

            gender:
              getGenderLabel(
                candidate?.gender,
              ),

            role:
              getRoleLabel(
                candidate?.current_role ||
                  candidate?.currentRole,
              ),

            profilePhotoId:
              candidate
                ?.profile_photo_id ??
              candidate
                ?.profilePhotoId ??
              null,
          },
        }),
      ),
    [leaderCandidates],
  );

  const filteredMembers = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return mappedMembers.filter(
      (member) => {
        const matchesSearch =
          !query ||
          member.nameKm
            .toLowerCase()
            .includes(query) ||
          member.nameEn
            .toLowerCase()
            .includes(query) ||
          member.role
            .toLowerCase()
            .includes(query);

        const statusCode =
          getStatusCode(
            member.status,
          );

        const matchesStatus =
          selectedStatus ===
            ALL_OPTION ||
          (selectedStatus ===
            "សកម្ម" &&
            statusCode ===
              "ACTIVE") ||
          (selectedStatus ===
            "អសកម្ម" &&
            statusCode ===
              "INACTIVE");

        return (
          matchesSearch &&
          matchesStatus
        );
      },
    );
  }, [
    mappedMembers,
    searchQuery,
    selectedStatus,
  ]);

  const handleCreateMember =
    async () => {
      setIsCreateOpen(false);

      const controller =
        new AbortController();

      await Promise.all([
        loadMembers(
          controller.signal,
        ),
        loadBranchDetails(
          controller.signal,
        ),
        loadLeaderCandidates(
          controller.signal,
        ),
      ]);
    };

  const handleBranchSaved =
    async () => {
      setIsEditModalOpen(false);

      const controller =
        new AbortController();

      await Promise.all([
        loadBranchDetails(
          controller.signal,
        ),
        loadLeaderCandidates(
          controller.signal,
        ),
      ]);
    };

  const columns = [
    {
      key: "no",
      label: "ល.រ",
      width: "6%",
      align: "center",

      render: (_row, index) =>
        index + 1,
    },
    {
      key: "nameKm",
      label: "ឈ្មោះ",
      width: "23%",
      align: "left",

      render: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
            <Image
              src={
                row.profileImage ||
                "/member.png"
              }
              alt={
                row.nameKm ||
                "Member"
              }
              fill
              sizes="32px"
              className="object-cover"
              unoptimized={Boolean(row.profileImage)}
            />
          </div>

          <span className="truncate font-medium text-text-primary">
            {row.nameKm || "-"}
          </span>
        </div>
      ),
    },
    {
      key: "gender",
      label: "ភេទ",
      width: "11%",
      align: "center",
    },
    {
      key: "role",
      label: "តួនាទី",
      width: "20%",
      align: "center",
    },
    {
      key: "status",
      label: "ស្ថានភាព",
      width: "13%",
      align: "center",

      render: (row) => (
        <StatusBadge
          status={row.status}
        />
      ),
    },
    {
      key: "joinedAt",
      label: "ថ្ងៃចូលរួម",
      width: "15%",
      align: "center",
    },
    {
      key: "actions",
      label: "សកម្មភាព",
      width: "12%",
      align: "center",

      render: (row) => (
        <Link
          href={`/member/memberInfo/${row.id}/documents`}
          className="mx-auto inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[11px] font-semibold text-white transition hover:bg-primary-hover"
        >
          <List size={14} />

          មើល
        </Link>
      ),
    },
  ];

  const filters = [
    {
      key: "status",
      value: selectedStatus,
      onChange:
        setSelectedStatus,
      placeholder:
        "ស្ថានភាព",
      options:
        STATUS_OPTIONS,
    },
  ];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-bg-page-white p-6">
        <p className="text-sm text-text-secondary">
          កំពុងទាញយកព័ត៌មានសាខា...
        </p>
      </div>
    );
  }

  if (loadError || !branch) {
    return (
      <div className="rounded-xl border border-error/30 bg-bg-page-white p-6">
        <p className="text-sm text-error">
          {loadError ||
            "រកមិនឃើញព័ត៌មានសាខា"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5 overflow-x-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/branch"
            className="text-text-secondary transition hover:text-primary"
          >
            សាខា
          </Link>

          <ChevronRight
            size={16}
            className="shrink-0 text-text-secondary"
          />

          <span className="font-medium text-text-secondary">
            ព័ត៌មានលម្អិត
          </span>
        </div>

        <h1 className="text-xl font-bold leading-tight text-primary">
          {branch.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DetailStatCard
          title="ចំនួនវិភាគទាន"
          value="-"
          icon={Banknote}
          iconClassName="bg-secondary-light text-secondary"
          borderClassName="border-t-3 border-t-secondary"
        />

        <DetailStatCard
          title="ចំនួនសមាជិក"
          value={
            branch.memberCount
          }
          icon={Users}
          iconClassName="bg-success-bg text-success"
          borderClassName="border-t-3 border-t-success"
        />

        <DetailStatCard
          title="ចំនួនកម្មវិធី"
          value={
            branch.activityCount
          }
          icon={CalendarDays}
          iconClassName="bg-warning-bg text-warning"
          borderClassName="border-t-3 border-t-warning"
        />
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-primary">
            ព័ត៌មានសាខា
          </h2>

          {!isViewer && <button
            type="button"
            onClick={() =>
              setIsEditModalOpen(
                true,
              )
            }
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-secondary px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Pencil size={15} />

            កែប្រែ
          </button>}
        </div>

        <div className="rounded-lg border border-secondary bg-primary-sidebar px-6 py-4 text-white">
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2 xl:grid-cols-[1.1fr_1fr_1.15fr_1.5fr]">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {branch.name}
              </p>

              <p className="mt-1 text-[11px] text-white/75">
                {branch.code}
              </p>
            </div>

            <div className="flex min-w-0 items-center gap-3 xl:border-l xl:border-white/35 xl:pl-5">
              <Phone
                size={17}
                className="shrink-0 text-white"
              />

              <div className="min-w-0">
                <p className="text-[11px] text-white/70">
                  លេខទូរស័ព្ទ
                </p>

                <p className="mt-1 truncate text-xs font-medium">
                  {branch.phone}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-3 xl:border-l xl:border-white/35 xl:pl-5">
              <Mail
                size={17}
                className="shrink-0 text-white"
              />

              <div className="min-w-0">
                <p className="text-[11px] text-white/70">
                  អ៊ីមែល
                </p>

                <p className="mt-1 truncate text-xs font-medium">
                  {branch.email}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-3 xl:border-l xl:border-white/35 xl:pl-5">
              <MapPin
                size={17}
                className="shrink-0 text-white"
              />

              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-white/70">
                  ទីតាំង
                </p>

                <p className="mt-1 truncate text-xs font-medium">
                  {branch.addressLine}
                </p>
              </div>

              {branch.googleMapUrl && (
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      branch.googleMapUrl,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-white/40 bg-success px-3 text-xs font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Navigation
                    size={14}
                  />

                  ទីតាំង
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-primary">
            ប្រធានសាខា
          </h2>
        </div>

        <LeaderCard
          person={branchLeader}
          title="ប្រធានសាខា"
          onAdd={isViewer ? undefined : () =>
            setIsEditModalOpen(true)
          }
        />
      </section>

      <section>
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-primary">
            លេខាធិការ
          </h2>
        </div>

        {secretaries.length > 0 ? (
          <div className="space-y-3">
            {secretaries.map((person) => (
              <LeaderCard
                key={person.id}
                person={person}
                title="លេខាធិការ"
                onAdd={isViewer ? undefined : () =>
                  setIsEditModalOpen(true)
                }
              />
            ))}
          </div>
        ) : (
          <LeaderCard
            person={null}
            title="លេខាធិការ"
            onAdd={isViewer ? undefined : () =>
              setIsEditModalOpen(true)
            }
          />
        )}
      </section>

      <section className="rounded-xl border border-border bg-bg-page-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-[320px]">
            <SearchBar
              value={searchQuery}
              onChange={
                setSearchQuery
              }
              placeholder="ស្វែងរកសមាជិក..."
              width="w-full"
            />
          </div>

          <FilterBar
            filters={filters}
          />

          <div className="ml-auto">
            {!isViewer && <Button
              type="button"
              variant="success"
              icon={
                <PlusCircle
                  size={16}
                />
              }
              onClick={() =>
                setIsCreateOpen(true)
              }
            >
              បន្ថែមសមាជិកថ្មី
            </Button>}
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredMembers}
          rowsPerPage={10}
          scrollable={false}
          emptyMessage="មិនមានសមាជិកក្នុងសាខានេះទេ"
        />
      </section>

      {!isViewer && <CreateBranchModal
        open={isEditModalOpen}
        onClose={() =>
          setIsEditModalOpen(false)
        }
        initialData={{
          ...branch,

          branchLeaderId:
            branchLeader?.id ??
            branchDetails?.leaders?.find(
              (person) =>
                String(
                  person?.role ?? "",
                ).toUpperCase() ===
                "BRANCH_LEADER",
            )?.member_id ??
            branchDetails?.leaders?.find(
              (person) =>
                String(
                  person?.role ?? "",
                ).toUpperCase() ===
                "BRANCH_LEADER",
            )?.id ??
            "",

          leaders:
            branchDetails?.leaders ??
            [],
        }}
        leaderOptions={leaderOptions}
        onSave={handleBranchSaved}
      />}

      {!isViewer && <CreateMemberModal
        open={isCreateOpen}
        onClose={() =>
          setIsCreateOpen(false)
        }
        onSave={
          handleCreateMember
        }

        fixedBranchId={
          branch.id
        }

        fixedBranchName={
          branch.name
        }

        lockBranch
      />}
    </div>
  );
}
