"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

const ALL_OPTION = "ទាំងអស់";

const STATUS_OPTIONS = [ALL_OPTION, "សកម្ម", "អសកម្ម"];

function StatusBadge({ status }) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex min-w-[68px] items-center justify-center rounded-full px-3 py-1 text-[11px] font-medium ${
        isActive
          ? "bg-success-bg text-success"
          : "bg-error-bg text-error"
      }`}
    >
      {isActive ? "សកម្ម" : "អសកម្ម"}
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
  const helperIsNegative = String(helper || "").startsWith("↓");

  return (
    <div
      className={`rounded-xl border border-border border-t-2 bg-white p-4 shadow-sm ${borderClassName}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
        >
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-text-secondary">{title}</p>

          <p className="mt-1 truncate text-xl font-bold text-text-primary">
            {value}
          </p>

          {helper && (
            <p className={`mt-1 text-[11px] ${helperIsNegative ? "text-error" : "text-success"}`}>{helper}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BranchDetailPage() {
  const params = useParams();
  const branchId = String(params.id);
  // This detail endpoint is ADMIN-only; the backend still enforces permission.
  const canManageBranchLeader = true;

  const [branch, setBranch] = useState(null);
  const [members, setMembers] = useState([]);
  const [lookupOptions, setLookupOptions] = useState({
    levels: [],
    statuses: [],
    provinces: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(ALL_OPTION);

  const loadBranchData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const responses = await Promise.all([
        fetch(`/api/branches/${encodeURIComponent(branchId)}`),
        fetch("/api/lookups/branch-levels"),
        fetch("/api/lookups/branch-statuses"),
        fetch("/api/lookups/provinces"),
        fetch(`/api/members?page=0&size=100&branchId=${encodeURIComponent(branchId)}`),
        fetch(`/api/dashboard/branch-performance?branchId=${encodeURIComponent(branchId)}`),
        fetch(`/api/backend/branches/${encodeURIComponent(branchId)}/leader`, {
          credentials: "include",
        }),
      ]);
      const failedResponse = responses.find((response) => !response.ok);

      if (failedResponse) {
        const problem = await failedResponse.json().catch(() => ({}));
        throw new Error(problem.detail || problem.message || "Unable to load branch information.");
      }

      const [branchData, levels, statuses, provinces, memberPage, performance, leaderData] =
        await Promise.all(responses.map(async (response, index) => {
          if (index !== 6) return response.json();
          const text = await response.text();
          return text ? JSON.parse(text) : null;
        }));
      const branchStatus = statuses.find(
        (item) => String(item.value) === String(branchData.status_id),
      );

      setBranch({
        id: branchData.id,
        code: branchData.branch_code,
        name: branchData.name_km,
        nameKm: branchData.name_km,
        nameEn: branchData.name_en || "",
        levelId: branchData.branch_level_id,
        parentBranchId: branchData.parent_branch_id,
        provinceId: branchData.province_id,
        districtId: branchData.district_id,
        communeId: branchData.commune_id,
        statusId: branchData.status_id,
        status: branchStatus?.code || "",
        addressLine: branchData.address || "",
        googleMapUrl: branchData.google_map_url || "",
        phone: branchData.phone || "",
        email: branchData.email || "",
        createdAt: branchData.created_at || "",
        updatedAt: branchData.updated_at || "",
        memberCount: performance.members?.value ?? memberPage.totalElements ?? 0,
        memberGrowth: performance.members?.changePercent ?? null,
        activityCount: performance.activities?.value ?? 0,
        activityGrowth: performance.activities?.changePercent ?? null,
        totalDonationUsd: performance.donations?.amountUsd ?? 0,
        donationGrowth: performance.donations?.changePercentUsd ?? null,
        leader: leaderData ? {
          id: leaderData.id,
          nameKm: leaderData.nameKm,
          nameEn: leaderData.nameEn || "",
          gender: leaderData.gender || "",
          role: leaderData.role || "ប្រធានសាខា",
          status: leaderData.status || "",
          phone: leaderData.phone || "",
          email: leaderData.email || "",
          dateOfBirth: leaderData.dateOfBirth || "",
          joinedAt: leaderData.joinedAt || "",
          profileImage: leaderData.profilePhotoId
            ? `/api/backend/files/${encodeURIComponent(leaderData.profilePhotoId)}/content`
            : "/member.png",
        } : null,
      });
      setMembers((memberPage.content || []).map((member) => ({
        id: member.id,
        nameKm: member.full_name_km,
        nameEn: member.full_name_en || "",
        gender: member.gender?.label_km || member.gender?.code || "",
        role: "សមាជិក",
        status: member.status?.code || "",
        joinedAt: member.joined_on || "",
        profileImage: member.profile_photo?.id
          ? `/api/backend/files/${encodeURIComponent(member.profile_photo.id)}/content`
          : "/member.png",
      })));
      setLookupOptions({ levels, statuses, provinces });
    } catch (loadError) {
      setError(loadError.message || "Unable to load branch information.");
      setBranch(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranchData();
  }, [branchId]);

  const updateBranch = async (form) => {
    const response = await fetch(`/api/branches/${encodeURIComponent(branchId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name_km: form.nameKm.trim(),
        name_en: form.nameEn.trim() || null,
        branch_level_id: Number(form.level),
        parent_branch_id: branch.parentBranchId || null,
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
      throw new Error(problem.detail || problem.message || "Unable to update branch.");
    }

    const leaderResponse = await fetch(
      `/api/backend/branches/${encodeURIComponent(branchId)}/leader`,
      {
        method: form.branchLeaderId ? "PUT" : "DELETE",
        credentials: "include",
        headers: form.branchLeaderId ? { "Content-Type": "application/json" } : undefined,
        body: form.branchLeaderId
          ? JSON.stringify({ memberId: Number(form.branchLeaderId) })
          : undefined,
      },
    );

    if (!leaderResponse.ok) {
      const problem = await leaderResponse.json().catch(() => ({}));
      throw new Error(
        problem.detail || problem.message || "Unable to assign the branch leader.",
      );
    }

    setIsEditModalOpen(false);
    await loadBranchData();
  };

  const leaderOptions = useMemo(
    () =>
      members
        .filter((member) => member.status === "ACTIVE")
        .map((member) => ({
          label:
            member.nameKm ||
            member.nameEn ||
            `សមាជិក ${member.id}`,
          value: String(member.id),
          member: {
            ...member,
            role: "ប្រធានសាខា",
          },
        })),
    [members],
  );

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !query ||
        member.nameKm?.toLowerCase().includes(query) ||
        member.nameEn?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query);

      const statusValue =
        selectedStatus === "សកម្ម"
          ? "ACTIVE"
          : selectedStatus === "អសកម្ម"
            ? "INACTIVE"
            : null;

      const matchesStatus =
        selectedStatus === ALL_OPTION ||
        member.status === statusValue;

      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, selectedStatus]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-sm text-text-secondary">
        កំពុងទាញយកព័ត៌មានសាខា...
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-error">
          {error || "រកមិនឃើញព័ត៌មានសាខា"}
        </p>
        <button type="button" onClick={loadBranchData} className="mt-3 text-sm font-semibold text-primary underline">
          ព្យាយាមម្តងទៀត
        </button>
      </div>
    );
  }

  const columns = [
    {
      key: "no",
      label: "ល.រ",
      width: "6%",
      align: "center",
      render: (_row, index) => index + 1,
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
              src={row.profileImage || "/member.png"}
              alt={row.nameKm || "Member"}
              fill
              sizes="32px"
              className="object-cover"
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
      render: (row) => <StatusBadge status={row.status} />,
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
      onChange: setSelectedStatus,
      placeholder: "ស្ថានភាព",
      options: STATUS_OPTIONS,
    },
  ];

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
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
          value={`$${Number(
            branch.totalDonationUsd || 0,
          ).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`}
          helper={branch.donationGrowth == null ? null : `${Number(branch.donationGrowth) >= 0 ? "↑" : "↓"} ${Math.abs(Number(branch.donationGrowth))}% ក្នុងខែនេះ`}
          icon={Banknote}
          iconClassName="bg-secondary-light text-secondary"
          borderClassName="border-t-3 border-t-secondary"
        />

        <DetailStatCard
          title="ចំនួនសមាជិក"
          value={branch.memberCount || 0}
          helper={branch.memberGrowth == null ? null : `${Number(branch.memberGrowth) >= 0 ? "↑" : "↓"} ${Math.abs(Number(branch.memberGrowth))}% ក្នុងខែនេះ`}
          icon={Users}
          iconClassName="bg-success-bg text-success"
          borderClassName="border-t-3 border-t-success"
        />

        <DetailStatCard
          title="ចំនួនកម្មវិធី"
          value={branch.activityCount || 0}
          helper={branch.activityGrowth == null ? null : `${Number(branch.activityGrowth) >= 0 ? "↑" : "↓"} ${Math.abs(Number(branch.activityGrowth))}% ក្នុងខែនេះ`}
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

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-secondary px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Pencil size={15} />
            កែប្រែ
          </button>
        </div>

        <div className="rounded-lg border border-secondary bg-primary-sidebar px-6 py-4 text-white">
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2 xl:grid-cols-[1.1fr_1fr_1.15fr_1.5fr]">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {branch.name || "-"}
              </p>

              <p className="mt-1 text-[11px] text-white/75">
                {branch.code || "-"}
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
                  {branch.phone || "-"}
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
                  {branch.email || "-"}
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
                  {branch.addressLine || "-"}
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
                  <Navigation size={14} />
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

          {canManageBranchLeader && <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-secondary px-3 text-xs font-semibold text-secondary transition hover:bg-secondary-light"
          >
            {branch.leader ? (
              <Pencil size={14} />
            ) : (
              <PlusCircle size={14} />
            )}

            {branch.leader
              ? "ផ្លាស់ប្តូរប្រធាន"
              : "បន្ថែមប្រធាន"}
          </button>}
        </div>

        {branch.leader ? (
          <div className="min-w-0 overflow-x-auto rounded-lg border border-border bg-white px-5 py-4 shadow-sm">
            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[250px_150px_240px_150px_150px_auto]">
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={
                      branch.leader.profileImage ||
                      "/member.png"
                    }
                    alt={
                      branch.leader.nameKm ||
                      "Branch leader"
                    }
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-text-primary">
                    {branch.leader.nameKm || "-"}
                  </p>

                  <p className="mt-1 truncate text-xs text-text-secondary">
                    {branch.leader.nameEn || "-"}
                  </p>

                  <div className="mt-2">
                    <StatusBadge
                      status={branch.leader.status}
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

                  <span className="text-xs text-text-secondary">
                    ភេទ
                  </span>

                  <span className="truncate text-sm font-medium text-text-primary">
                    {branch.leader.gender || "-"}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Building2
                    size={15}
                    className="shrink-0 text-text-secondary"
                  />

                  <span className="text-xs text-text-secondary">
                    តួនាទី
                  </span>

                  <span className="truncate text-sm font-medium text-text-primary">
                    {branch.leader.role || "ប្រធានសាខា"}
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
                    {branch.leader.phone || "-"}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Mail
                    size={15}
                    className="shrink-0 text-text-secondary"
                  />

                  <span className="truncate text-sm font-medium text-text-primary">
                    {branch.leader.email || "-"}
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
                  {branch.leader.dateOfBirth || "-"}
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
                      {branch.leader.joinedAt || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 justify-start lg:justify-end">
                <Link
                  href={`/member/memberInfo/${branch.leader.id}/documents`}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
                >
                  <List size={15} />
                  ព័ត៌មានលម្អិត
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-white p-6 text-center shadow-sm">
            <Building2
              size={30}
              className="mx-auto text-text-secondary"
            />

            <p className="mt-2 text-sm font-semibold text-text-primary">
              សាខានេះមិនទាន់មានប្រធានសាខា
            </p>

            <p className="mt-1 text-xs text-text-secondary">
              បង្កើតសមាជិកក្នុងសាខានេះជាមុន ហើយបន្ទាប់មកកែប្រែសាខាដើម្បីកំណត់ប្រធាន។
            </p>

            {canManageBranchLeader && <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-success px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <PlusCircle size={15} />
              បន្ថែមប្រធានសាខា
            </button>}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-[320px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="ស្វែងរកសមាជិក..."
              width="w-full"
            />
          </div>

          <FilterBar filters={filters} />

          <div className="ml-auto">
            <Button
              type="button"
              variant="success"
              icon={<PlusCircle size={16} />}
            >
              បន្ថែមសមាជិកថ្មី
            </Button>
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

      <CreateBranchModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={branch}
        leaderOptions={leaderOptions}
        enableLeaderAssignment={canManageBranchLeader}
        levelOptions={lookupOptions.levels.map((item) => ({ label: item.labelKm || item.labelEn, value: item.value, code: item.code }))}
        statusOptions={lookupOptions.statuses.map((item) => ({ label: item.labelKm || item.labelEn, value: item.value, code: item.code }))}
        provinceOptions={lookupOptions.provinces.map((item) => ({ label: item.labelKm || item.labelEn, value: item.value }))}
        onSave={updateBranch}
      />
    </div>
  );
}
