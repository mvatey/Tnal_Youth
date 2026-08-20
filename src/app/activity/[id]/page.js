import { cookies } from "next/headers";

import {
  InfoIcon,
  InfoItem,
  StatusRow,
  SummaryCard,
} from "@/components/activity/ActivityDetailItems";

import Image from "next/image";
import Link from "next/link";

import { FaUsers } from "react-icons/fa";
import { notFound } from "next/navigation";

import PendingInvitationBanner from "@/components/activity/PendingInvitationBanner";

import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  History,
  MapPin,
  Pencil,
  Phone,
  Tag,
  CircleDollarSign,
  Sprout,
  UserCheck,
  UserX,
  Users,
  ChevronRight,
} from "lucide-react";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

function lookupLabel(value) {
  return (
    value?.labelKm ||
    value?.labelEn ||
    value?.code ||
    "-"
  );
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("km-KH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function formatTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("km-KH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDuration(
  startsAt,
  endsAt,
) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return "-";
  }

  return `${Math.round(
    (end - start) / 3_600_000,
  )} ម៉ោង`;
}

function formatFileSize(bytes) {
  const size = Number(bytes);

  if (
    !Number.isFinite(size) ||
    size <= 0
  ) {
    return "-";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function isPdfDocument(doc) {
  const mime = String(
    doc?.mimeType || "",
  ).toLowerCase();

  const name = String(
    doc?.name || "",
  ).toLowerCase();

  return (
    mime.includes("pdf") ||
    name.endsWith(".pdf")
  );
}

function getEffectiveActivityStatus(
  status,
  startsAt,
  endsAt,
) {
  const storedStatus = String(
    status?.code ||
      status ||
      "",
  ).toLowerCase();

  if (
    storedStatus === "cancelled" ||
    storedStatus === "canceled"
  ) {
    return "cancelled";
  }

  const now = Date.now();

  const start =
    new Date(startsAt).getTime();

  const end =
    new Date(endsAt).getTime();

  if (
    Number.isFinite(end) &&
    now >= end
  ) {
    return "completed";
  }

  if (
    storedStatus === "completed"
  ) {
    return "completed";
  }

  if (
    Number.isFinite(start) &&
    now >= start
  ) {
    return "ongoing";
  }

  return (
    storedStatus ||
    "upcoming"
  );
}

function participantAttendanceCode(
  participant,
) {
  return String(
    participant
      .attendanceStatus
      ?.code ||
      participant
        .attendance_status
        ?.code ||
      participant
        .attendanceStatusCode ||
      participant
        .attendance_status_code ||
      participant
        .attendanceStatus ||
      participant
        .attendance_status ||
      "",
  ).toLowerCase();
}

async function backendGet(
  path,
  accessToken,
) {
  const response = await fetch(
    `${BACKEND_URL}${path}`,
    {
      headers: {
        Accept: "application/json",

        ...(accessToken
          ? {
              Authorization:
                `Bearer ${accessToken}`,
            }
          : {}),
      },

      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function ActivityDetailPage({
  params,
}) {
  const { id } = await params;

  const cookieStore =
    await cookies();

  const accessToken =
    cookieStore.get(
      "accessToken",
    )?.value;

  const [
    record,
    currentUser,
    participantData,
    branchData,
    attachmentData,
  ] = await Promise.all([
    backendGet(
      `/activities/${encodeURIComponent(
        id,
      )}`,
      accessToken,
    ),

    backendGet(
      "/auth/me",
      accessToken,
    ),

    backendGet(
      `/activities/${encodeURIComponent(
        id,
      )}/participants`,
      accessToken,
    ),

    backendGet(
      "/lookups/branches",
      accessToken,
    ),

    backendGet(
      `/activities/${encodeURIComponent(
        id,
      )}/attachments`,
      accessToken,
    ),
  ]);

  if (!record) {
    notFound();
  }

  const role = String(
    currentUser?.role ||
      "",
  ).toLowerCase();

  const isMember =
    role === "member";

  /*
   * HOST BRANCH permission.
   *
   * Only host Secretary /
   * Branch Leader receives this.
   */
  const canManage =
    Boolean(
      record.canManage,
    );

  /*
   * ACCEPTED INVITED BRANCH.
   */
  const canManageAsInvitedBranch =
    Boolean(
      record
        .canManageAsInvitedBranch,
    );

  /*
   * The income-entry branch is different for an accepted invited branch.
   * Host staff record under the activity host branch; invited staff record
   * under the accepted branch they manage.  Passing this branch explicitly
   * prevents the donation screen from trying to load host-branch members.
   */
  const incomeBranchId =
    canManageAsInvitedBranch
      ? (record.managedInvitedBranchId ?? record.managed_invited_branch_id ?? null)
      : record.branchId;

  const activityIncomeHref =
    incomeBranchId != null
      ? `/donation/eventdonation/detail?event=${encodeURIComponent(record.id)}&branch=${encodeURIComponent(incomeBranchId)}`
      : `/donation/eventdonation/detail?event=${encodeURIComponent(record.id)}`;

  const branches =
    Array.isArray(branchData)
      ? branchData
      : [];

  const branch =
    branches.find(
      (item) =>
        String(
          item.value,
        ) ===
        String(
          record.branchId,
        ),
    );

  /*
   * Participant endpoint is now
   * branch scoped:
   *
   * host staff -> host members
   * invited staff -> own members
   */
  const activityParticipants =
    Array.isArray(
      participantData,
    )
      ? participantData
      : [];

  const attachments =
    Array.isArray(
      attachmentData,
    )
      ? attachmentData
      : [];

  const activity = {
    id:
      record.id,

    branchId:
      record.branchId,

    name:
      record.titleKm ||
      record.titleEn ||
      "-",

    descriptionBrief:
      record.description ||
      "-",

    descriptionDetail:
      record.description ||
      "-",

    type:
      lookupLabel(
        record.type,
      ),

    sector:
      lookupLabel(
        record.sector,
      ),

    status:
      getEffectiveActivityStatus(
        record.status,
        record.startsAt,
        record.endsAt,
      ),

    branch:
      branch?.labelKm ||
      branch?.labelEn ||
      branch?.code ||
      `#${record.branchId}`,

    location:
      record.locationName ||
      record.address ||
      "-",

    address:
      record.address ||
      record.locationName ||
      "-",

    mapLink:
      record.googleMapUrl ||
      "#",

    mapImage:
      "/map.png",

    image:
      record.coverImageId
        ? `/api/backend/files/${record.coverImageId}/content`
        : "/activity-placeholder.svg",

    date:
      formatDate(
        record.startsAt,
      ),

    startDate:
      formatDate(
        record.startsAt,
      ),

    endDate:
      formatDate(
        record.endsAt,
      ),

    startTime:
      formatTime(
        record.startsAt,
      ),

    endTime:
      formatTime(
        record.endsAt,
      ),

    duration:
      formatDuration(
        record.startsAt,
        record.endsAt,
      ),

    participants:
      `${activityParticipants.length}/${record.capacity || "-"}`,

    visibility:
      record.publicActivity
        ? "សាធារណៈ"
        : "ផ្ទៃក្នុង",

    leader:
      record.organizerName ||
      record.createdByName ||
      record.creatorName ||
      (record.createdBy
        ? `#${record.createdBy}`
        : "-"),

    phone:
      record.organizerPhone ||
      record.createdByPhone ||
      record.creatorPhone ||
      "-",

    donation:
      "$ 0",

    budget:
      "$ 0",

    documents:
      attachments.map(
        (attachment) => ({
          name:
            attachment
              .original_name ||
            attachment
              .originalName ||
            attachment.title ||
            "ឯកសារ",

          size:
            formatFileSize(
              attachment
                .size_bytes ??
                attachment
                  .sizeBytes,
            ),

          mimeType:
            attachment
              .mime_type ||
            attachment
              .mimeType ||
            "",

          url:
            attachment.file_id
              ? `/api/backend/files/${attachment.file_id}/content`
              : attachment.fileId
                ? `/api/backend/files/${attachment.fileId}/content`
                : null,

          key:
            attachment
              .attachment_id ??
            attachment
              .attachmentId,
        }),
      ),
  };

  const attendedCount =
    activityParticipants.filter(
      (participant) => {
        const code =
          participantAttendanceCode(
            participant,
          );

        return (
          code === "present" ||
          code === "attended" ||
          Boolean(
            participant
              .checked_in_at ||
              participant
                .checkedInAt,
          )
        );
      },
    ).length;

  const absentCount =
    activityParticipants.filter(
      (participant) =>
        participantAttendanceCode(
          participant,
        ) ===
        "absent",
    ).length;

  const totalParticipantCount =
    activityParticipants.length;

  const statusLabel =
    activity.status ===
    "completed"
      ? "បានបញ្ចប់"
      : activity.status ===
          "ongoing"
        ? "កំពុងដំណើរការ"
        : activity.status ===
            "cancelled"
          ? "បានលុបចោល"
          : "នាពេលខាងមុខ";

  const statusStyle =
    activity.status ===
    "completed"
      ? "bg-success-bg text-success"
      : activity.status ===
          "ongoing"
        ? "bg-warning-bg text-warning"
        : activity.status ===
            "cancelled"
          ? "bg-danger-bg text-danger"
          : "bg-secondary-light text-secondary";

  const visibilityLabel =
    activity.visibility ||
    "សាធារណៈ";

  /*
   * Both host staff and accepted
   * invited staff can invite members.
   */
  const canInviteMembers =
    canManage ||
    canManageAsInvitedBranch;

  /*
   * Your required button flow:
   *
   * not completed
   * -> អញ្ជើញសមាជិក
   *
   * completed
   * -> សមាសភាពចូលរួម
   */
  const participantButtonHref =
    canInviteMembers &&
    activity.status !==
      "completed"
      ? `/activity/${activity.id}/members`
      : `/activity/${activity.id}/participants`;

  const participantButtonLabel =
    canInviteMembers &&
    activity.status !==
      "completed"
      ? "អញ្ជើញសមាជិក"
      : "សមាសភាពចូលរួម";

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-text-secondary">
            <div className="flex items-center gap-1 text-sm">
              <Link
                href="/activity"
                className="text-text-secondary transition hover:text-primary"
              >
                កម្មវិធី
              </Link>

              <ChevronRight
                size={14}
                className="text-text-secondary"
              />

              <span className="font-semibold text-primary">
                ព័ត៌មានលម្អិត
              </span>
            </div>
          </div>

          <h1 className="text-xl font-bold text-secondary">
            ព័ត៌មានកម្មវិធី
          </h1>
        </div>

        {/*
         * HOST BRANCH ONLY.
         *
         * Invited branch must NOT see
         * Edit Activity.
         */}
        {canManage && (
          <Link
            href={`/activity/create?edit=${activity.id}`}
            className="flex h-[34px] items-center gap-2 rounded-lg bg-secondary px-4 text-sm font-medium text-white hover:bg-secondary-hover"
          >
            <Pencil size={15} />

            កែព័ត៌មាន
          </Link>
        )}
      </div>

      {!isMember && (
        <PendingInvitationBanner
          activityId={
            activity.id
          }
        />
      )}

      {/* HERO */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-bg-page-white p-5 xl:col-span-2">
          <div className="flex flex-col gap-5 md:flex-row">
            <Image
              src={
                activity.image
              }
              width={300}
              height={200}
              className="h-[200px] w-full shrink-0 rounded-lg object-cover md:w-[300px]"
              alt={
                activity.name
              }
              unoptimized={
                activity.image.startsWith(
                  "/api/",
                )
              }
            />

            <div className="flex flex-1 flex-col">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-text-primary">
                    {
                      activity.name
                    }
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-[11px] ${statusStyle}`}
                  >
                    {
                      statusLabel
                    }
                  </span>
                </div>

                <p className="mt-2 text-sm text-text-secondary">
                  {
                    activity
                      .descriptionBrief
                  }
                </p>
              </div>

              <div className="mt-12 grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-5 text-xs text-text-secondary">
                <div className="flex items-start gap-2">
                  <CalendarDays
                    size={15}
                    className="mt-0.5 shrink-0 text-text-secondary"
                  />

                  <div>
                    <p className="font-semibold text-text-primary">
                      {
                        activity.date
                      }
                    </p>

                    <p className="mt-1 whitespace-nowrap text-text-secondary">
                      {
                        activity.startTime
                      }
                      {" - "}
                      {
                        activity.endTime
                      }
                    </p>
                  </div>
                </div>

                <InfoIcon
                  icon={MapPin}
                  label={
                    activity.branch
                  }
                  sub={
                    activity.location
                  }
                />

                <InfoIcon
                  icon={Users}
                  label={
                    activity.participants
                  }
                  sub="បានចូលរួម"
                />

                <InfoIcon
                  icon={Sprout}
                  label="បរិស្ថាន"
                  sub="ប្រភេទវិស័យ"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-bg-page-white p-5">
          <h3 className="mb-5 text-base font-bold text-secondary">
            សង្ខេបស្ថានភាព
          </h3>

          <StatusRow
            icon={
              CheckCircle2
            }
            label="ស្ថានភាព"
          >
            <span
              className={`rounded-full px-3 py-1 text-[11px] ${statusStyle}`}
            >
              {statusLabel}
            </span>
          </StatusRow>

          <StatusRow
            icon={Eye}
            label="ការមើលឃើញ"
          >
            <span className="text-sm font-semibold text-text-primary">
              {
                visibilityLabel
              }
            </span>
          </StatusRow>

          <StatusRow
            icon={
              CalendarDays
            }
            label="ថ្ងៃចាប់ផ្តើម"
          >
            <span className="text-sm font-semibold text-text-primary">
              {
                activity.startDate ||
                activity.date
              }
            </span>
          </StatusRow>

          <StatusRow
            icon={History}
            label="ថ្ងៃបញ្ចប់"
            last
          >
            <span className="text-sm font-semibold text-text-primary">
              {
                activity.endDate ||
                activity.date
              }
            </span>
          </StatusRow>
        </div>
      </div>

      {/* GENERAL INFO + MAP */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="flex flex-col xl:col-span-2">
          <h3 className="mb-2 text-base font-bold text-secondary">
            ទិដ្ឋភាពទូទៅ
          </h3>

          <div className="flex-1 rounded-xl border border-border bg-bg-page-white p-5">
            <p className="mb-5 text-sm leading-7 text-text-secondary">
              {
                activity
                  .descriptionDetail
              }
            </p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-border pt-5 text-sm">
              <InfoItem
                icon={FileText}
                label="ឈ្មោះកម្មវិធី"
                value={
                  activity.name
                }
              />

              <InfoItem
                icon={
                  CalendarDays
                }
                label="ថ្ងៃចាប់ផ្តើម"
                value={
                  activity.startDate ||
                  activity.date
                }
              />

              <InfoItem
                icon={Tag}
                label="ប្រភេទកម្មវិធី"
                value={
                  activity.type
                }
              />

              <InfoItem
                icon={Clock}
                label="រយៈពេលចូលរួម"
                value={
                  activity.duration
                }
              />

              <InfoItem
                icon={MapPin}
                label="វិស័យ"
                value={
                  activity.sector
                }
              />

              <InfoItem
                icon={Users}
                label="អ្នកគ្រប់គ្រង"
                value={
                  activity.leader
                }
              />

              <InfoItem
                icon={Users}
                label="ចំនួនអ្នកចូលរួម"
                value={`${attendedCount}/${totalParticipantCount} នាក់`}
              />

              <InfoItem
                icon={Phone}
                label="លេខទំនាក់ទំនង"
                value={
                  activity.phone
                }
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <h3 className="mb-2 text-base font-bold text-secondary">
            ទីតាំង
          </h3>

          <div className="flex-1 rounded-xl border border-border bg-bg-page-white p-5">
            <a
              href={
                activity.mapLink ||
                "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="block h-[190px] overflow-hidden rounded-lg bg-bg-page-gray"
            >
              <Image
                src={
                  activity.mapImage ||
                  "/map.jpg"
                }
                width={500}
                height={220}
                className="h-full w-full rounded-lg object-cover transition-opacity hover:opacity-90"
                alt="map"
              />
            </a>

            <p className="mt-3 flex items-start gap-2 text-sm text-text-secondary">
              <MapPin
                size={16}
                className="mt-0.5 shrink-0 text-primary"
              />

              {activity.address ||
                activity.location}
            </p>
          </div>
        </div>
      </div>

      {/* MEMBERSHIP + FINANCE + DOCUMENTS */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {!isMember && (
          <div className="rounded-xl border border-border bg-bg-page-white p-5">
            <h3 className="mb-4 text-base font-bold text-secondary">
              សមាសភាព
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <SummaryCard
                icon={
                  UserCheck
                }
                iconClass="bg-success-bg text-success"
                label="បានចូលរួម"
                value={
                  attendedCount
                }
                unit="នាក់"
              />

              <SummaryCard
                icon={UserX}
                iconClass="bg-error-bg text-error"
                label="មិនបានចូលរួម"
                value={
                  absentCount
                }
                unit="នាក់"
              />
            </div>

            <Link
              href={
                participantButtonHref
              }
              className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              <FaUsers
                size={15}
              />

              {
                participantButtonLabel
              }
            </Link>
          </div>
        )}

        {!isMember && (
          <div className="rounded-xl border border-border bg-bg-page-white p-5">
            <h3 className="mb-4 text-base font-bold text-secondary">
              ថវិកា
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <SummaryCard
                icon={
                  CircleDollarSign
                }
                iconClass="bg-warning-bg text-warning"
                label="ចំណូល"
                value={
                  activity.donation ||
                  "$ 0"
                }
              />

              <SummaryCard
                icon={Banknote}
                iconClass="bg-error-bg text-error"
                label="ចំណាយ"
                value={
                  activity.budget ||
                  "$ 0"
                }
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link
                href={activityIncomeHref}
                className={`flex h-10 items-center justify-center gap-2 rounded-lg bg-[#D3AF3C] text-sm font-semibold text-white transition-colors hover:bg-[#BF9C2D] ${
                  !canManage
                    ? "col-span-2"
                    : ""
                }`}
              >
                <CircleDollarSign
                  size={16}
                />

                ចំណូល
              </Link>

              {/*
               * Expense ACTION is HOST ONLY.
               */}
              {canManage && (
                <Link
                  href={`/activity/create/expense?activityId=${activity.id}`}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#D9534F] text-sm font-semibold text-white transition-colors hover:bg-[#C4413E]"
                >
                  <Banknote
                    size={16}
                  />

                  ចំណាយ
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border bg-bg-page-white p-5">
          <h3 className="mb-4 text-base font-bold text-secondary">
            ឯកសារ
          </h3>

          <div className="space-y-3">
            {(activity.documents || [])
              .map((doc) => {
                const fileStyle =
                  isPdfDocument(
                    doc,
                  )
                    ? "bg-error-bg text-error"
                    : "bg-blue-100 text-blue-600";

                return (
                  <div
                    key={
                      doc.key ??
                      doc.name
                    }
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${fileStyle}`}
                      >
                        <FileText
                          size={18}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {
                            doc.name
                          }
                        </p>

                        <p className="text-xs text-text-secondary">
                          {
                            doc.size
                          }
                        </p>
                      </div>
                    </div>

                    {doc.url ? (
                      <a
                        href={
                          doc.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`មើល ${doc.name}`}
                      >
                        <Eye
                          size={17}
                          className="cursor-pointer text-primary transition hover:text-primary-hover"
                        />
                      </a>
                    ) : (
                      <Eye
                        size={17}
                        className="text-text-secondary opacity-40"
                      />
                    )}
                  </div>
                );
              })}

            {(activity.documents ||
              []).length ===
              0 && (
              <p className="py-6 text-center text-sm text-text-secondary">
                មិនទាន់មានឯកសារនៅឡើយទេ
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
