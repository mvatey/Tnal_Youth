"use client";

import { use, useEffect, useMemo, useState } from "react";
import { ChevronRight, Eye, Pencil } from "lucide-react";
import { RiDownloadCloud2Line } from "react-icons/ri";
import Link from "next/link";

import SearchBar from "@/components/table-items/SearchBar";
import FilterBar from "@/components/table-items/FilterBar";
import Button from "@/components/table-items/Button";
import Table from "@/components/table-items/Table";
import ParticipantStats, { ParticipantStatusBadge as StatusBadge } from "@/components/activity/ParticipantStats";
import ParticipationEditModal from "@/components/activity/ParticipantEditModal";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/navigation";

async function fetchApi(path) {
  const response = await fetch(`/api/backend${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }

  return body;
}

function getValue(record, camelKey, snakeKey) {
  return record?.[camelKey] ?? record?.[snakeKey];
}

function getLabel(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.labelKm ?? value.label_km ?? value.labelEn ?? value.label_en ?? value.code ?? "";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function normalizeExistingParticipant(participant) {
  return {
    ...participant,
    memberId: Number(getValue(participant, "memberId", "member_id")),
    branchId: Number(getValue(participant, "branchId", "branch_id")),
    checkedInAt: getValue(participant, "checkedInAt", "checked_in_at"),
  };
}

function isCompletedActivity(activity) {
  const status = String(
    getValue(activity, "statusCode", "status_code") ??
      activity?.status?.code ??
      activity?.status ??
      "",
  ).toUpperCase();

  return status === "COMPLETED" || status === "បានបញ្ចប់";
}

export default function ActivityParticipantsPage({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const canEditParticipation = [
    "admin",
    "secretary",
    "branch_leader",
  ].includes(role);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);
  const [activityParticipants, setActivityParticipants] = useState([]);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadParticipants() {
      setLoading(true);
      setLoadError("");

      try {
        const activityRecord = await fetchApi(`/activities/${id}`);
        const branchId = Number(getValue(activityRecord, "branchId", "branch_id"));

        if (!Number.isFinite(branchId) || branchId <= 0) {
          throw new Error("This activity is not assigned to a branch.");
        }

        const [memberPage, existingResponse] = await Promise.all([
          fetchApi(`/members?branchId=${branchId}&page=0&size=100`),
          fetchApi(`/activities/${id}/participants`),
        ]);

        const members = Array.isArray(memberPage)
          ? memberPage
          : Array.isArray(memberPage?.content)
            ? memberPage.content
            : [];
        const existingParticipants = (Array.isArray(existingResponse)
          ? existingResponse
          : Array.isArray(existingResponse?.content)
            ? existingResponse.content
            : []
        ).map(normalizeExistingParticipant);
        const existingByMemberId = new Map(
          existingParticipants.map((participant) => [participant.memberId, participant]),
        );

        const rows = members.map((member) => {
          const memberId = Number(member.id);
          const existing = existingByMemberId.get(memberId);
          const joinedDateValue = getValue(member, "joinedOn", "joined_on") ||
            getValue(existing, "registeredAt", "registered_at") || "";

          return {
            id: memberId,
            memberId,
            name: getValue(member, "fullNameKm", "full_name_km") ||
              getValue(member, "fullNameEn", "full_name_en") ||
              getValue(existing, "fullNameKm", "full_name_km") ||
              getValue(existing, "fullNameEn", "full_name_en") || "-",
            email: member.email || existing?.email || "",
            gender: getLabel(member.gender) || "-",
            role: getLabel(member.level) || "-",
            branch: getLabel(member.branch) ||
              getValue(existing, "branchNameKm", "branch_name_km") ||
              getValue(existing, "branchNameEn", "branch_name_en") || "-",
            branchId,
            joinedDateValue: joinedDateValue ? String(joinedDateValue).slice(0, 10) : "",
            joinedDate: formatDate(joinedDateValue),
            isInvited: Boolean(existing),
            isParticipated: Boolean(existing?.checkedInAt),
          };
        }).filter((member) => member.isInvited);

        if (!cancelled) {
          setActivity({
            ...activityRecord,
            name: getValue(activityRecord, "titleKm", "title_km") ||
              getValue(activityRecord, "titleEn", "title_en") || "-",
          });
          setActivityParticipants(rows);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Something went wrong");
          setActivityParticipants([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadParticipants();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const roles = useMemo(
    () => [...new Set(activityParticipants.map((item) => item.role).filter((value) => value && value !== "-"))],
    [activityParticipants],
  );
  const branches = useMemo(
    () => [...new Set(activityParticipants.map((item) => item.branch).filter((value) => value && value !== "-"))],
    [activityParticipants],
  );
  const completed = isCompletedActivity(activity);

  const filteredParticipants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activityParticipants.filter((participant) => {
      const name = participant.name?.toLowerCase() ?? "";
      const email = participant.email?.toLowerCase() ?? "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query);

      const matchesRole =
        selectedRole === "all" ||
        participant.role === selectedRole;

      const matchesBranch =
        selectedBranch === "all" ||
        participant.branch === selectedBranch;

      const matchesDate =
        !selectedDate ||
        participant.joinedDate === selectedDate ||
        participant.joinedDateValue === selectedDate;

      return matchesSearch && matchesRole && matchesBranch && matchesDate;
    });
  }, [
    activityParticipants,
    searchQuery,
    selectedRole,
    selectedBranch,
    selectedDate,
  ]);

  const participantStats = useMemo(() => {
    const attended = activityParticipants.filter((participant) => participant.isParticipated === true).length;
    const absent = activityParticipants.filter((participant) => participant.isParticipated !== true).length;

    return {
      total: activityParticipants.length,
      attended,
      absent,
    };
  }, [activityParticipants]);

  const columns = useMemo(
    () => [
      {
        key: "no",
        label: "ល.រ",
        width: "5%",
        align: "center",
        render: (_row, index) => index + 1,
      },
      {
        key: "name",
        label: "ឈ្មោះអ្នកចូលរួម",
        width: "20%",
        truncate: true,
        cellClassName: "font-medium text-text-primary",
        render: (row) => (
          <div>
            <p className="font-semibold text-text-primary">{row.name || "-"}</p>
            <p className="text-xs text-text-secondary">{row.email || "-"}</p>
          </div>
        ),
      },
      {
        key: "gender",
        label: "ភេទ",
        width: "10%",
        align: "center",
        render: (row) => row.gender || "-",
      },
      {
        key: "role",
        label: "តួនាទី",
        width: "13%",
        align: "center",
        render: (row) => row.role || "-",
      },
      {
        key: "branch",
        label: "សាខា",
        width: "14%",
        align: "center",
        render: (row) => row.branch || "-",
      },
      {
        key: "joinedDate",
        label: "ថ្ងៃ/ខែ/ឆ្នាំ ចូលរួម",
        width: "17%",
        align: "center",
        render: (row) => row.joinedDate || "-",
      },
      {
        key: "isParticipated",
        label: "ស្ថានភាពចូលរួម",
        width: "14%",
        align: "center",
        render: (row) => (
          <StatusBadge status={row.isParticipated ? "បានចូលរួម" : "មិនបានចូលរួម"} />
        ),
      },
      {
        key: "actions",
        label: "សកម្មភាព",
        width: "7%",
        align: "center",
        render: (row) => (
          <Link
            href={`/member/memberInfo/${row.memberId || row.id}/documents`}
            aria-label={`មើល ${row.name || "សមាជិក"}`}
            className="mx-auto flex w-fit rounded-md p-1 text-primary transition hover:bg-primary-light"
          >
            <Eye size={17} />
          </Link>
        ),
      },
    ],
    [],
  );

  const handleSaveParticipation = async (updatedParticipants) => {
    setSaveError("");

    const currentByMemberId = new Map(
      activityParticipants.map((participant) => [
        participant.memberId,
        participant,
      ]),
    );
    const changedParticipants = updatedParticipants.filter((participant) => {
      const current = currentByMemberId.get(participant.memberId);
      return current && current.isParticipated !== participant.isParticipated;
    });

    try {
      await Promise.all(
        changedParticipants.map(async (participant) => {
          const response = await fetch(
            `/api/backend/activities/${encodeURIComponent(id)}/attendance/status`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                member_id: Number(participant.memberId),
                attendance_status: participant.isParticipated
                  ? "PRESENT"
                  : "ABSENT",
              }),
            },
          );
          const body = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(
              body?.message || `Request failed (${response.status})`,
            );
          }
        }),
      );

      setActivityParticipants(updatedParticipants);
      setIsEditOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      setSaveError(message);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-center text-text-secondary">
        Loading activity members...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-error/30 bg-error-bg p-6 text-center text-error">
        {loadError}
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-center text-text-secondary">
        មិនអាចរកឃើញកម្មវិធីនេះទេ
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="mb-1">
        <div className="flex items-center gap-1 text-sm text-text-secondary">
          <Link href="/activity" className="hover:text-primary">
            កម្មវិធី
          </Link>

          <ChevronRight size={14} />

          <Link href={`/activity/${activity.id}`} className="hover:text-primary">
            ព័ត៌មានលម្អិត
          </Link>

          <ChevronRight size={14} />

          <span className="font-semibold text-primary">
            សមាសភាពចូលរួម
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-secondary">
          {activity.name || activity.titleKm || activity.title || "-"}
        </h1>
      </div>

      <ParticipantStats
        total={participantStats.total}
        attended={participantStats.attended}
        absent={participantStats.absent}
      />

      {saveError && (
        <div className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {saveError}
        </div>
      )}

      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ស្វែងរកសមាជិក..."
            width="w-[300px]"
          />

          <FilterBar
            filters={[
              {
                key: "role",
                value: selectedRole,
                onChange: setSelectedRole,
                placeholder: "តួនាទី",
                options: roles,
              },
              {
                key: "branch",
                value: selectedBranch,
                onChange: setSelectedBranch,
                placeholder: "សាខា",
                options: branches,
              },
              {
                key: "date",
                value: selectedDate,
                onChange: setSelectedDate,
                placeholder: "ថ្ងៃ/ខែ/ឆ្នាំ",
                type: "date",
              },
            ]}
          />

          <div className="ml-auto flex items-center gap-3">
            {completed && canEditParticipation && (
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-success px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Pencil size={16} />
                កែប្រែការចូលរួម
              </button>
            )}

            <Button icon={RiDownloadCloud2Line}>
              ទាញយករបាយការណ៍
            </Button>
          </div>
        </div>

        {!completed && canEditParticipation && (
          <div className="mb-4 rounded-lg border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning">
            អាចកែប្រែស្ថានភាពចូលរួមបាន បន្ទាប់ពីកម្មវិធីបានបញ្ចប់។
          </div>
        )}

        <Table
          columns={columns}
          data={filteredParticipants}
          rowsPerPage={10}
          emptyMessage="មិនមានសមាជិកចូលរួមទេ"
        />
      </div>

      <ParticipationEditModal
        open={isEditOpen}
        participants={activityParticipants}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveParticipation}
      />

    </div>
  );
}
