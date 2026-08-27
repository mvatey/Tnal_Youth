"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  ImageIcon,
  Info,
  Link2,
  MapPin,
  Paperclip,
  PencilLine,
  Search,
  UploadCloud,
  X,
} from "lucide-react";

import FormField from "@/components/forms/FormField";
import FormControl from "@/components/forms/FormControl";
import FormSelect from "@/components/forms/FormSelect";
import DatePickerField from "@/components/forms/DatePickerField";
import FormActionButton from "@/components/ui/actions/FormActionButton";
import MemberSelectModal from "@/components/activity/MemberSelectModal";
import { useBranch } from "@/context/BranchContext";
import useCurrentMember from "@/hooks/useCurrentMember";
import useMemberPermissions from "@/hooks/useMemberPermissions";
import { useLanguage } from "@/context/LanguageContext";
import { activityStatusLabel } from "@/lib/activityStatusLabels";

const BRANCH_OPTIONS = [
  "ភ្នំពេញ",
  "កណ្ដាល",
  "កំពង់ចាម",
  "សៀមរាប",
  "បាត់ដំបង",
];

const TYPE_OPTIONS = [
  "កម្មវិធីផ្ទៃក្នុង",
  "កម្មវិធីខាងក្រៅ",
];

const SECTOR_OPTIONS = [
  "បរិស្ថាន",
  "អប់រំ",
  "សង្គម",
  "បច្ចេកវិទ្យា",
];

const VISIBILITY_OPTIONS = [
  "សាធារណៈ",
  "ឯកជន",
];

const STATUS_OPTIONS = [
  "ឆាប់ៗនេះ",
  "កំពុងដំណើរការ",
  "បានបញ្ចប់",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
// The backend's own hard ceiling for activity attachments (see
// FileServiceImpl.MAX_ATTACHMENT_SIZE) is 20MB -- this used to cap at 5MB
// client-side, well below what the backend actually allows, so a
// perfectly valid 6-19MB document was rejected here before it ever got a
// chance to upload. Matched to the backend's real limit instead of an
// arbitrary stricter one.
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;

function convertToDate(dateValue) {
  if (!dateValue) return null;

  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    return dateValue;
  }

  if (typeof dateValue === "string") {
    const simpleDate = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (simpleDate) {
      const [, year, month, day] = simpleDate;

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );
    }
  }

  const date = new Date(dateValue);

  return Number.isNaN(date.getTime()) ? null : date;
}

// Local Date object for comparison purposes only -- distinct from
// combineDateAndTime further below, which returns an ISO string (with
// timezone offset) for the actual save payload. Kept separate rather than
// reusing that one so a parsing change on either side can't silently
// break the other.
function combineDateAndTimeAsDate(dateValue, timeValue) {
  const base = convertToDate(dateValue);
  if (!base) return null;

  const result = new Date(base);
  const match = String(timeValue || "").match(/^(\d{1,2}):(\d{2})/);

  if (match) {
    result.setHours(Number(match[1]), Number(match[2]), 0, 0);
  } else {
    result.setHours(0, 0, 0, 0);
  }

  return result;
}

// Mirrors getEffectiveActivityStatus on the Activity list page (see
// src/app/activity/page.js) so what this form previews/saves an activity
// as always matches what the list page will display it as afterward.
// Returns null until both dates are filled in.
function computeEffectiveStatusCode(startDate, startTime, endDate, endTime) {
  const start = combineDateAndTimeAsDate(startDate, startTime);
  const end = combineDateAndTimeAsDate(endDate, endTime);

  if (!start || !end) return null;

  const now = Date.now();

  if (now >= end.getTime()) return "COMPLETED";
  if (now >= start.getTime()) return "ONGOING";
  return "UPCOMING";
}

function formatDate(dateValue) {
  if (!dateValue) return "";

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getOptionLabel(option) {
  return (
    option?.labelKm ||
    option?.label_km ||
    option?.nameKm ||
    option?.name_km ||
    option?.labelEn ||
    option?.label_en ||
    option?.nameEn ||
    option?.name_en ||
    option?.branchCode ||
    option?.code ||
    ""
  );
}

function getOptionValue(option) {
  return Number(option?.value ?? option?.id);
}

function getOptionCode(option) {
  return String(option?.code || "").trim().toUpperCase();
}

function getMemberProfileImage(member) {
  const profilePhoto = member?.profile_photo || member?.profilePhoto;
  const fileId = profilePhoto?.id || member?.profile_photo_id || member?.profilePhotoId;

  if (fileId) {
    return `/api/files/${fileId}/content`;
  }

  const value =
    profilePhoto?.url ||
    profilePhoto?.file_path ||
    profilePhoto?.filePath ||
    member?.profile_image ||
    member?.profileImage;

  if (!value) {
    return "/profiles/default-avatar.jpg";
  }

  try {
    const parsed = new URL(value);
    if (parsed.hostname === "localhost" && parsed.port === "8081") {
      return `/api/backend${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // Relative frontend and proxied API URLs can be used as-is.
  }

  return value;
}

function combineDateAndTime(dateValue, timeValue) {
  const date = convertToDate(dateValue);
  if (!date) return null;
  const [hours, minutes] = String(timeValue || "00:00").split(":").map(Number);
  const safeHours = Number.isFinite(hours) ? hours : 0;
  const safeMinutes = Number.isFinite(minutes) ? minutes : 0;

  // Do not use toISOString() here. It converts the selected local calendar
  // day into UTC, which can make the backend save/display the following day
  // after an activity is edited. Send the local calendar date and its actual
  // browser timezone offset instead.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(safeHours).padStart(2, "0");
  const minute = String(safeMinutes).padStart(2, "0");
  const offsetMinutes = -date.getTimezoneOffset();
  const offsetSign = offsetMinutes >= 0 ? "+" : "-";
  const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, "0");
  const offsetRemainder = String(Math.abs(offsetMinutes) % 60).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:00${offsetSign}${offsetHours}:${offsetRemainder}`;
}

async function fetchJson(path, options = {}) {
  const response = await fetch(path, { cache: "no-store", ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }
  return body;
}

function getActivityLocation(location) {
  if (!location) return "";

  if (typeof location === "string") {
    return location;
  }

  return location.name || location.city || "";
}

function normalizeInvitedBranches(activity) {
  if (!activity) return [];

  if (Array.isArray(activity.invitedBranches)) {
    return activity.invitedBranches;
  }

  if (Array.isArray(activity.additionalBranches)) {
    return activity.additionalBranches;
  }

  if (activity.additionalBranch) {
    return [activity.additionalBranch];
  }

  if (activity.branch2) {
    return [activity.branch2];
  }

  return [];
}

function createInitialForm(activity) {
  if (!activity) {
    return {
      name: "",
      branch: "",
      type: "",
      sector: "",
      visibility: "សាធារណៈ",
      description: "",
      startDate: null,
      endDate: null,
      startTime: "",
      endTime: "",
      dailySchedules: [],
      location: "",
      province: "",
      mapLink: "",
      address: "",
      invitedBranches: [],
      status: "",
    };
  }

  return {
    name: activity.name || activity.titleKm || activity.titleEn || "",
    branch: activity.branch || activity.branchLabel || "",
    type: typeof activity.type === "object" ? getOptionLabel(activity.type) : activity.type || "",
    sector: typeof activity.sector === "object" ? getOptionLabel(activity.sector) : activity.sector || "",
    visibility: activity.visibility || "សាធារណៈ",
    description: activity.descriptionDetail || activity.description || "",
    startDate: convertToDate(
      activity.startsAt ||
        activity.startDateISO ||
        activity.startDateValue ||
        activity.startDate ||
        activity.dateValue ||
        activity.date
    ),
    endDate: convertToDate(
      activity.endsAt ||
        activity.endDateISO ||
        activity.endDateValue ||
        activity.endDate ||
        activity.finishDate ||
        activity.dateValue ||
        activity.date
    ),
    startTime: activity.startTime24 || activity.startTime || activity.startsAt?.slice(11, 16) || "",
    endTime: activity.endTime24 || activity.endTime || activity.endsAt?.slice(11, 16) || "",
    dailySchedules: Array.isArray(activity.dailySchedules) ? activity.dailySchedules.map((item) => ({ scheduleDate: item.scheduleDate, startsAt: String(item.startsAt).slice(0, 5), endsAt: String(item.endsAt).slice(0, 5) })) : [],
    location: activity.locationName || getActivityLocation(activity.location),
    province:
      (typeof activity.province === "object"
        ? getOptionLabel(activity.province)
        : activity.province) ||
      activity.provinceLabel ||
      "",
    mapLink: activity.googleMapUrl || activity.mapLink || "",
    address: activity.address || "",
    invitedBranches: normalizeInvitedBranches(activity),
    status: typeof activity.status === "object" ? getOptionLabel(activity.status) : activity.status || activity.status2 || "",
  };
}

function SearchableBranchMultiSelect({
  label,
  options,
  values,
  onChange,
  placeholder = "ស្វែងរក និងជ្រើសរើសសាខា",
}) {
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  }, [open]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      option.toLowerCase().includes(normalizedQuery)
    );
  }, [options, query]);

  const toggleOption = (option) => {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
      return;
    }

    onChange([...values, option]);
  };

  const removeOption = (event, option) => {
    event.stopPropagation();
    onChange(values.filter((value) => value !== option));
  };

  const clearAll = (event) => {
    event.stopPropagation();
    onChange([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>

      <button type="button" onClick={() => setOpen((current) => !current)} className={`flex h-[34px] w-full items-center justify-between rounded-lg border bg-bg-page-white px-3 py-2 text-left text-sm outline-none transition ${open ? "border-secondary ring-1 ring-secondary/20" : "border-border hover:border-secondary"}`}>
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {values.length === 0 ? (
            <span className="text-text-secondary">{placeholder}</span>
          ) : (
            values.map((value) => (
              <span key={value} className="inline-flex max-w-full items-center gap-1 rounded-md bg-secondary-light px-2 py-1 text-xs text-secondary">
                <span className="truncate">{value}</span>

                <span role="button" tabIndex={0} onClick={(event) => removeOption(event, value)} onKeyDown={(event) => event.key === "Enter" && removeOption(event, value)} className="rounded-sm p-0.5 transition hover:bg-secondary/10">
                  <X size={12} />
                </span>
              </span>
            ))
          )}
        </div>

        <div className="ml-2 flex shrink-0 items-center gap-1">
          {values.length > 0 && (
            <span role="button" tabIndex={0} onClick={clearAll} onKeyDown={(event) => event.key === "Enter" && clearAll(event)} className="rounded-md p-1 text-text-secondary transition hover:bg-bg-page-gray hover:text-error">
              <X size={14} />
            </span>
          )}

          <ChevronDown size={16} className={`text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[260px] overflow-hidden rounded-lg border border-border bg-bg-page-white shadow-xl">
          <div className="border-b border-border p-2">
            <div className="flex h-9 items-center gap-2 rounded-md border border-border px-3 focus-within:border-secondary">
              <Search size={15} className="shrink-0 text-text-secondary" />

              <input ref={searchInputRef} type="text" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ស្វែងរកសាខា..." className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary" />

              {query && (
                <button type="button" onClick={() => setQuery("")} className="rounded p-0.5 text-text-secondary transition hover:bg-bg-page-gray hover:text-text-primary">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected = values.includes(option);

                return (
                  <button key={option} type="button" onClick={() => toggleOption(option)} className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition ${selected ? "bg-secondary-light text-secondary" : "text-text-primary hover:bg-bg-page-gray"}`}>
                    <span>{option}</span>

                    <span className={`flex h-5 w-5 items-center justify-center rounded border ${selected ? "border-secondary bg-secondary text-white" : "border-border bg-bg-page-white"}`}>
                      {selected && <Check size={13} />}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-5 text-center text-sm text-text-secondary">
                រកមិនឃើញសាខា
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatFileSize(size) {
  if (!size && size !== 0) return "";

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function MultipleFileUpload({
  label,
  files,
  onChange,
  accept,
  uploadText,
  helperText,
  maxSize,
  kind = "file",
}) {
  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const isAcceptedFile = (file) => {
    if (!accept) return true;

    const acceptedValues = accept
      .split(",")
      .map((value) => value.trim().toLowerCase());

    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    return acceptedValues.some((acceptedValue) => {
      if (acceptedValue.startsWith(".")) {
        return fileName.endsWith(acceptedValue);
      }

      if (acceptedValue.endsWith("/*")) {
        const acceptedGroup = acceptedValue.split("/")[0];
        const fileGroup = fileType.split("/")[0];

        return acceptedGroup === fileGroup;
      }

      return acceptedValue === fileType;
    });
  };

  const addFiles = (incomingFiles) => {
    setError("");

    const validFiles = [];
    const invalidMessages = [];

    incomingFiles.forEach((file) => {
      if (!isAcceptedFile(file)) {
        invalidMessages.push(`${file.name}: ប្រភេទឯកសារមិនត្រឹមត្រូវ`);
        return;
      }

      if (maxSize && file.size > maxSize) {
        invalidMessages.push(`${file.name}: ទំហំឯកសារធំពេក`);
        return;
      }

      const duplicated = [...files, ...validFiles].some(
        (existingFile) =>
          existingFile.name === file.name &&
          existingFile.size === file.size &&
          existingFile.lastModified === file.lastModified
      );

      if (!duplicated) {
        validFiles.push(file);
      }
    });

    if (invalidMessages.length > 0) {
      setError(invalidMessages[0]);
    }

    if (validFiles.length > 0) {
      onChange([...files, ...validFiles]);
    }
  };

  const handleInputChange = (event) => {
    addFiles(Array.from(event.target.files || []));
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    addFiles(Array.from(event.dataTransfer.files || []));
  };

  const removeFile = (index) => {
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
  };

  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>

      <input ref={inputRef} type="file" accept={accept} multiple onChange={handleInputChange} className="hidden" />

      <button type="button" onClick={() => inputRef.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { event.preventDefault(); setDragging(false); }} onDrop={handleDrop} className={`flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${dragging ? "border-secondary bg-secondary-light/50" : "border-border bg-bg-page-gray hover:border-secondary hover:bg-secondary-light/30"}`}>
        <UploadCloud size={30} className="mb-2 text-secondary" />

        <span className="text-sm font-semibold text-primary">
          {uploadText}
        </span>

        <span className="mt-1 text-xs text-text-secondary">
          {helperText}
        </span>
      </button>

      {error && (
        <p className="mt-2 text-xs text-error">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-page-white px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${kind === "image" ? "bg-success-bg text-success" : "bg-secondary-light text-secondary"}`}>
                  {kind === "image" ? (
                    <ImageIcon size={17} />
                  ) : (
                    <FileText size={17} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {file.name}
                  </p>

                  <p className="text-xs text-text-secondary">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <button type="button" onClick={() => removeFile(index)} className="shrink-0 rounded-md p-1.5 text-error transition hover:bg-error-bg" aria-label={`លុប ${file.name}`}>
                <X size={16} />
              </button>
            </div>
          ))}

          <button type="button" onClick={() => inputRef.current?.click()} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-secondary text-xs font-semibold text-secondary transition hover:bg-secondary-light">
            <UploadCloud size={15} />
            បន្ថែមទៀត
          </button>
        </div>
      )}
    </div>
  );
}

export default function CreateActivityPage() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);
  const [editingActivity, setEditingActivity] = useState(null);
  const [form, setForm] = useState(() => createInitialForm(null));
  // The activity's status is otherwise entirely auto-derived from its
  // dates (see computeEffectiveStatusCode below) -- CANCELLED is the one
  // state that can never be derived from a date, so it's the only thing
  // still under manual control, via this explicit toggle rather than a
  // free-pick status dropdown.
  const [isCancelled, setIsCancelled] = useState(false);
  // An untouched schedule must be sent back exactly as the server gave it to
  // us. Rebuilding it from a browser Date can otherwise shift the day.
  const scheduleChangedRef = useRef({
    startDate: false,
    endDate: false,
    startTime: false,
    endTime: false,
  });
  const [lookupData, setLookupData] = useState({
    branches: [],
    invitableBranches: [],
    provinces: [],
    types: [],
    sectors: [],
    statuses: [],
  });

  const [activityImages, setActivityImages] = useState([]);
  const [activityDocuments, setActivityDocuments] = useState([]);
  // Photos/attachments already saved on the server for this activity
  // (edit mode only) — separate from activityImages/activityDocuments
  // above, which only ever hold newly-selected files pending upload.
  const [existingImages, setExistingImages] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [deletingExistingId, setDeletingExistingId] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [memberOptions, setMemberOptions] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberLoadError, setMemberLoadError] = useState("");
  const [existingParticipantIds, setExistingParticipantIds] = useState([]);

  // `canManage` = full edit rights (the activity's own host branch).
  // `canManageAsInvitedBranch` = a co-hosting branch's leader/secretary —
  // may only invite/remove their own branch's members and record
  // income/expense, never edit the activity's own info. Both are computed
  // server-side and returned on every activity detail fetch.
  const canManage = Boolean(editingActivity?.canManage);
  const canManageAsInvitedBranch = Boolean(
    editingActivity?.canManageAsInvitedBranch,
  );
  const invitedBranchId = editingActivity?.managedInvitedBranchId ?? null;
  const isInvitedBranchOnly =
    isEditMode && !canManage && canManageAsInvitedBranch;

  const invitedBranchLabel = getOptionLabel(
    lookupData.branches.find(
      (option) => getOptionValue(option) === invitedBranchId,
    ),
  );

  const canInviteMoreMembers =
    isEditMode &&
    editingActivity != null &&
    (canManage || canManageAsInvitedBranch) &&
    !["COMPLETED", "CANCELLED"].includes(
      String(getOptionCode(editingActivity?.status) || "").toUpperCase(),
    );

  // Same single-branch scoping used across the rest of the app (sidebar,
  // activity list, donations, dashboard, members) -- a secretary/
  // branch_leader must not be able to pick a different "សាខារៀបចំកម្មវិធី"
  // (organizing branch) than the one currently active in the sidebar's
  // global dropdown (see BranchContext). ADMIN keeps the free pick.
  const { member: currentMember } = useCurrentMember();
  const { role: loggedInRole, loading: permissionsLoading } = useMemberPermissions();
  // Only branch staff can create an activity at all -- unlike edit mode
  // (guarded below by the server-computed canManage/canManageAsInvitedBranch
  // flags), a brand-new activity has no branch yet to check against, so this
  // is a plain role check.
  const canCreateActivity = ["SECRETARY", "BRANCH_LEADER"].includes(loggedInRole);
  const {
    branches: accessibleBranches = [],
    selectedBranch: globalSelectedBranch = "all",
  } = useBranch();

  const isBranchScoped =
    currentMember?.role === "secretary" ||
    currentMember?.role === "branch_leader";

  const effectiveBranchId = useMemo(() => {
    if (!isBranchScoped) return null;

    if (globalSelectedBranch && globalSelectedBranch !== "all") {
      return String(globalSelectedBranch);
    }

    if (accessibleBranches.length > 0) {
      return String(accessibleBranches[0].id);
    }

    return currentMember?.branchId
      ? String(currentMember.branchId)
      : null;
  }, [
    isBranchScoped,
    globalSelectedBranch,
    accessibleBranches,
    currentMember?.branchId,
  ]);

  // The lookup list uses labels (Khmer names), not ids -- form.branch is
  // stored/compared as a label everywhere else on this page, so resolve
  // the scoped branch id to its matching label once the lookup loads.
  const effectiveBranchLabel = useMemo(() => {
    if (!isBranchScoped || !effectiveBranchId) return "";

    const match = lookupData.branches.find(
      (option) =>
        String(getOptionValue(option)) === effectiveBranchId,
    );

    return getOptionLabel(match);
  }, [isBranchScoped, effectiveBranchId, lookupData.branches]);

  const localizedOptionLabel = (option) => locale === "en"
    ? (option?.labelEn || option?.label_en || option?.nameEn || option?.name_en || option?.labelKm || option?.label_km || option?.nameKm || option?.name_km || option?.code || "")
    : (option?.labelKm || option?.label_km || option?.nameKm || option?.name_km || option?.labelEn || option?.label_en || option?.nameEn || option?.name_en || option?.code || "");
  const branchOptions = lookupData.branches.map(localizedOptionLabel).filter(Boolean);
  const allInvitableBranchOptions = lookupData.invitableBranches
    .map(getOptionLabel)
    .filter(Boolean);
  const provinceOptions = lookupData.provinces.map(getOptionLabel).filter(Boolean);
  const typeOptions = lookupData.types.map(localizedOptionLabel).filter(Boolean);
  const sectorOptions = lookupData.sectors.map(localizedOptionLabel).filter(Boolean);
  const visibilityOptions = [t("activityPage.publicVisibility"), t("activityPage.internalVisibility")];
  // Status is no longer a free pick -- it's derived straight from the
  // dates/times above (see computeEffectiveStatusCode), the same way the
  // Activity list page computes what badge to show. CANCELLED is the one
  // exception, since no date makes an activity cancelled -- that stays a
  // manual toggle (isCancelled) instead of a dropdown option.
  const autoStatusCode = computeEffectiveStatusCode(
    form.startDate,
    form.startTime,
    form.endDate,
    form.endTime,
  );
  const displayStatusCode = isCancelled ? "CANCELLED" : autoStatusCode;
  const displayStatusLabel = displayStatusCode
    ? activityStatusLabel(displayStatusCode, t)
    : t("activityPage.selectActivityStatus");

  useEffect(() => {
    let cancelled = false;

    async function loadFormData() {
      try {
        const [branches, invitableBranches, provinces, types, sectors, statuses] = await Promise.all([
          fetchJson("/api/lookups/branches"),
          fetchJson("/api/lookups/activity-invitable-branches"),
          fetchJson("/api/lookups/provinces"),
          fetchJson("/api/lookups/activity-types"),
          fetchJson("/api/lookups/activity-sectors"),
          fetchJson("/api/lookups/activity-statuses"),
        ]);
        const nextLookups = { branches, invitableBranches, provinces, types, sectors, statuses };
        if (cancelled) return;
        setLookupData(nextLookups);

        if (editId) {
          const [activity, invitations, participants, gallery, attachments] = await Promise.all([
            fetchJson(`/api/backend/activities/${encodeURIComponent(editId)}`),
            fetchJson(`/api/backend/activities/${encodeURIComponent(editId)}/invited-branches`).catch(() => []),
            fetchJson(`/api/backend/activities/${encodeURIComponent(editId)}/participants`).catch(() => []),
            // Photos/documents already uploaded for this activity — the
            // activity detail endpoint above never includes these, so
            // without this fetch the edit form always looked empty even
            // when files had already been uploaded.
            fetchJson(`/api/backend/activities/${encodeURIComponent(editId)}/gallery`).catch(() => []),
            fetchJson(`/api/backend/activities/${encodeURIComponent(editId)}/attachments`).catch(() => []),
          ]);
          const branch = branches.find((option) => getOptionValue(option) === Number(activity.branchId));
          const province = provinces.find((option) => getOptionValue(option) === Number(activity.provinceId));
          const invitedBranches = (Array.isArray(invitations) ? invitations : [])
            .map((invitation) => invitableBranches.find((option) => getOptionValue(option) === Number(invitation.branchId ?? invitation.branch_id)))
            .filter(Boolean)
            .map(getOptionLabel);
          const normalized = {
            ...activity,
            branchLabel: getOptionLabel(branch),
            provinceLabel: getOptionLabel(province),
            invitedBranches,
          };
          const currentParticipantIds = (Array.isArray(participants) ? participants : [])
            .map((participant) => Number(participant.memberId ?? participant.member_id))
            .filter((memberId) => Number.isFinite(memberId));
          const normalizedImages = (Array.isArray(gallery) ? gallery : []).map((photo) => ({
            id: photo.photo_id ?? photo.photoId,
            fileId: photo.file_id ?? photo.fileId,
            name: photo.original_name || photo.originalName || "រូបភាព",
            url: (photo.file_id ?? photo.fileId)
              ? `/api/backend/files/${photo.file_id ?? photo.fileId}/content`
              : null,
          }));
          const normalizedDocuments = (Array.isArray(attachments) ? attachments : []).map((attachment) => ({
            id: attachment.attachment_id ?? attachment.attachmentId,
            fileId: attachment.file_id ?? attachment.fileId,
            name: attachment.original_name || attachment.originalName || attachment.title || "ឯកសារ",
            size: formatFileSize(attachment.size_bytes ?? attachment.sizeBytes),
            mimeType: attachment.mime_type || attachment.mimeType || "",
            url: (attachment.file_id ?? attachment.fileId)
              ? `/api/backend/files/${attachment.file_id ?? attachment.fileId}/content`
              : null,
          }));
          if (!cancelled) {
            setEditingActivity(normalized);
            setForm(createInitialForm(normalized));
            setIsCancelled(getOptionCode(normalized.status) === "CANCELLED");
            scheduleChangedRef.current = {
              startDate: false,
              endDate: false,
              startTime: false,
              endTime: false,
            };
            setExistingParticipantIds(currentParticipantIds);
            setSelectedMemberIds(currentParticipantIds);
            setExistingImages(normalizedImages);
            setExistingDocuments(normalizedDocuments);
          }
        }
      } catch (error) {
        console.error("Load activity form data error:", error);
        if (!cancelled) alert(error.message || t("activityPage.loadFormFailed"));
      }
    }

    loadFormData();
    return () => {
      cancelled = true;
    };
  }, [editId]);

  useEffect(() => {
    // A co-hosting (invited) branch's staff can only ever pick from their
    // OWN branch's members — never the host's form.branch selection, which
    // they cannot see or edit in the first place.
    let branchId;
    if (isInvitedBranchOnly) {
      branchId = invitedBranchId;
    } else {
      const branch = lookupData.branches.find((option) => getOptionLabel(option) === form.branch);
      branchId = getOptionValue(branch);
    }
    if (!Number.isFinite(branchId) || branchId <= 0) {
      setMemberOptions([]);
      setSelectedMemberIds([]);
      setMembersLoading(false);
      setMemberLoadError("");
      return;
    }
    let cancelled = false;
    setMembersLoading(true);
    setMemberLoadError("");
    fetchJson(`/api/members?branchId=${branchId}&page=0&size=100`)
      .then((page) => {
        const records = Array.isArray(page) ? page : page?.content || [];
        if (!cancelled) {
          setMemberOptions(records.map((member) => ({
            id: member.id,
            name: member.full_name_km || member.full_name_en || "-",
            email: member.email || "",
            gender: member.gender?.label_km || member.gender?.labelKm || member.gender?.code || "-",
            /*
             * "តួនាទី" is the member's linked login account role
             * (admin/secretary/branch leader/member) — was reading
             * member.level (a separate rank/tier lookup) before, which
             * only looked right by coincidence. "-" now legitimately
             * means this member has no linked user account.
             */
            role: member.account_role?.label_km || member.account_role?.labelKm || member.account_role?.code || "-",
            branch: member.branch?.label_km || member.branch?.labelKm || form.branch,
            joinedDate: member.joined_on || "-",
            joinedDateValue: member.joined_on || "",
            profileImage: getMemberProfileImage(member),
            status: member.status?.label_km || member.status?.labelKm || member.status?.code || "-",
          })));
        }
      })
      .catch((error) => {
        console.error("Load activity members error:", error);
        if (!cancelled) {
          setMemberOptions([]);
          setSelectedMemberIds([]);
          setMemberLoadError(error.message || t("activityPage.loadBranchMembersFailed"));
        }
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.branch, lookupData.branches, isInvitedBranchOnly, invitedBranchId]);

  const invitedBranchOptions = useMemo(() => {
    return allInvitableBranchOptions.filter(
      (branch) => branch !== form.branch
    );
  }, [allInvitableBranchOptions, form.branch]);

  const setValue = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const setScheduleValue = (field, value) => {
    scheduleChangedRef.current[field] = true;
    setValue(field, value);
  };

  const createDailySchedules = () => {
    if (!form.startDate || !form.endDate) return;
    const start = new Date(formatDate(form.startDate) + "T00:00:00");
    const end = new Date(formatDate(form.endDate) + "T00:00:00");
    const rows = [];
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      rows.push({ scheduleDate: formatDate(date), startsAt: form.startTime || "08:00", endsAt: form.endTime || "17:00" });
    }
    setForm((current) => ({ ...current, dailySchedules: rows }));
  };

  const handleBranchChange = (event) => {
    const value = event.target.value;
    setMemberOptions([]);
    setSelectedMemberIds([]);
    setMemberLoadError("");
    setForm((currentForm) => ({
      ...currentForm,
      branch: value,
      invitedBranches: currentForm.invitedBranches.filter(
        (branch) => branch !== value
      ),
    }));
  };

  // Creating a new activity as a secretary/branch_leader: auto-select the
  // organizing branch to whatever is active in the sidebar (never leave it
  // on the placeholder), and keep it following the sidebar if it changes
  // while this page is open. Edit mode is intentionally excluded here --
  // an existing activity's own branch is already the record's real branch
  // (and the field is locked below), so it must never get silently
  // overwritten just because the sidebar's selection differs.
  useEffect(() => {
    if (isEditMode) return;
    if (!isBranchScoped) return;
    if (!effectiveBranchLabel) return;

    setForm((currentForm) => {
      if (currentForm.branch === effectiveBranchLabel) {
        return currentForm;
      }

      return {
        ...currentForm,
        branch: effectiveBranchLabel,
        invitedBranches: currentForm.invitedBranches.filter(
          (branch) => branch !== effectiveBranchLabel
        ),
      };
    });
  }, [isEditMode, isBranchScoped, effectiveBranchLabel]);

  const handleDeleteExistingImage = async (photo) => {
    if (!photo?.id || !editId) return;
    if (!window.confirm(t("activityPage.confirmDeleteImage"))) return;

    setDeletingExistingId(`image-${photo.id}`);
    try {
      await fetchJson(
        `/api/backend/activities/${encodeURIComponent(editId)}/gallery/${photo.id}`,
        { method: "DELETE" }
      );

      const remaining = existingImages.filter((item) => item.id !== photo.id);
      setExistingImages(remaining);

      // The backend re-points the activity's cover image to the next
      // remaining gallery photo (in this same order) whenever the
      // deleted photo was the current cover — mirror that here so
      // Save doesn't resend the now-stale coverImageId and fail.
      setEditingActivity((currentActivity) => {
        if (!currentActivity || currentActivity.coverImageId !== photo.fileId) {
          return currentActivity;
        }
        return {
          ...currentActivity,
          coverImageId: remaining[0]?.fileId ?? null,
        };
      });
    } catch (error) {
      console.error("Delete activity photo error:", error);
      alert(error.message || t("activityPage.deleteImageFailed"));
    } finally {
      setDeletingExistingId(null);
    }
  };

  const handleDeleteExistingDocument = async (document) => {
    if (!document?.id || !editId) return;
    if (!window.confirm(t("activityPage.confirmDeleteDocument"))) return;

    setDeletingExistingId(`document-${document.id}`);
    try {
      await fetchJson(
        `/api/backend/activities/${encodeURIComponent(editId)}/attachments/${document.id}`,
        { method: "DELETE" }
      );
      setExistingDocuments((current) => current.filter((item) => item.id !== document.id));
    } catch (error) {
      console.error("Delete activity attachment error:", error);
      alert(error.message || t("activityPage.deleteDocumentFailed"));
    } finally {
      setDeletingExistingId(null);
    }
  };

  const handleOpenMemberModal = () => {
    if (isInvitedBranchOnly) {
      if (!invitedBranchId) {
        alert(t("activityPage.cannotResolveYourBranch"));
        return;
      }
      setShowMemberModal(true);
      return;
    }

    if (!form.branch) {
      alert(t("activityPage.selectBranchFirst"));
      return;
    }

    setShowMemberModal(true);
  };

  /*
   * In create mode this just stages the selection locally — the actual
   * invite call happens once the activity itself is saved (see handleSave).
   *
   * In edit mode the activity already exists, so members are invited right
   * away. Only members NOT already in existingParticipantIds are sent to
   * the invite endpoint, so re-opening this modal and saving again never
   * re-invites (and never re-notifies) someone who already joined.
   */
  const handleMemberModalSave = async (selectedIds) => {
    if (!isEditMode) {
      setSelectedMemberIds(selectedIds);
      return;
    }

    const previouslyInvited = new Set(existingParticipantIds.map(Number));
    const newlySelectedIds = selectedIds
      .map(Number)
      .filter((memberId) => !previouslyInvited.has(memberId));

    if (newlySelectedIds.length === 0) {
      setSelectedMemberIds(selectedIds);
      return;
    }

    try {
      await fetchJson(`/api/backend/activities/${encodeURIComponent(editId)}/participants/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_ids: newlySelectedIds }),
      });

      const updatedParticipantIds = [...existingParticipantIds, ...newlySelectedIds];
      setExistingParticipantIds(updatedParticipantIds);
      setSelectedMemberIds(updatedParticipantIds);
    } catch (error) {
      console.error("Invite additional members error:", error);
      alert(error.message || t("activityPage.inviteMoreMembersFailed"));
      throw error;
    }
  };

  const handleCancel = () => {
    if (isEditMode && editId) {
      router.push(`/activity/${editId}`);
      return;
    }

    router.push("/activity");
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      alert(t("activityPage.nameRequired"));
      return false;
    }

    if (!form.branch) {
      alert(t("activityPage.hostBranchRequired"));
      return false;
    }

    if (!form.type) {
      alert(t("activityPage.typeRequired"));
      return false;
    }

    if (!form.sector) {
      alert(t("activityPage.sectorRequired"));
      return false;
    }

    if (!form.startDate) {
      alert(t("activityPage.startDateRequired"));
      return false;
    }

    if (!form.endDate) {
      alert(t("activityPage.endDateRequired"));
      return false;
    }

    if (!form.province) {
      alert(t("activityPage.provinceRequired"));
      return false;
    }

    const startsAt = combineDateAndTime(form.startDate, form.startTime);
    const endsAt = combineDateAndTime(form.endDate, form.endTime);

    if (
      startsAt &&
      endsAt &&
      new Date(endsAt).getTime() <= new Date(startsAt).getTime()
    ) {
      alert(t("activityPage.endBeforeStart"));
      return false;
    }

    return true;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const findOptionId = (options, label) => {
        // The form can contain a Khmer value selected before switching to
        // English (or the reverse). Match either translation to one id.
        const match = options.find((option) => {
          const labels = [
            localizedOptionLabel(option),
            getOptionLabel(option),
            option?.labelKm,
            option?.label_km,
            option?.labelEn,
            option?.label_en,
            option?.nameKm,
            option?.nameEn,
          ].filter(Boolean);
          return labels.includes(label);
        });
        const value = getOptionValue(match);
        return Number.isFinite(value) && value > 0 ? value : null;
      };
      // displayStatusCode is derived from the dates/isCancelled toggle above
      // -- no more free-pick dropdown to match a label against.
      const currentStatusId = getOptionValue(editingActivity?.status);
      const draftStatusId = getOptionValue(
        lookupData.statuses.find((option) => getOptionCode(option) === "DRAFT"),
      );
      const alreadyCompleted = getOptionCode(editingActivity?.status) === "COMPLETED";
      // COMPLETED can only be reached through the dedicated /complete
      // endpoint (called further below, after this save succeeds) -- the
      // backend rejects it in a plain create/update payload. Submit
      // whatever status is already valid here instead (the activity's
      // current one when editing, DRAFT for a brand-new one) and let
      // shouldComplete finish the transition afterward.
      const shouldComplete = displayStatusCode === "COMPLETED" && !alreadyCompleted;
      const codeToSubmit = displayStatusCode === "COMPLETED" ? null : displayStatusCode;
      const idForCode = codeToSubmit
        ? getOptionValue(lookupData.statuses.find((option) => getOptionCode(option) === codeToSubmit))
        : null;
      const saveStatusId =
        Number.isFinite(idForCode) && idForCode > 0
          ? idForCode
          : Number.isFinite(currentStatusId) && currentStatusId > 0
            ? currentStatusId
            : draftStatusId;
      const scheduleIsUnchanged =
        isEditMode &&
        !Object.values(scheduleChangedRef.current).some(Boolean);

      const payload = {
        titleKm: form.name.trim(),
        titleEn: editingActivity?.titleEn || null,
        description: form.description.trim() || null,
        typeId: findOptionId(lookupData.types, form.type),
        sectorId: findOptionId(lookupData.sectors, form.sector),
        statusId: Number.isFinite(saveStatusId) && saveStatusId > 0
          ? saveStatusId
          : null,
        branchId: findOptionId(lookupData.branches, form.branch),
        isPublic: form.visibility === visibilityOptions[0],
        startsAt: scheduleIsUnchanged
          ? editingActivity?.startsAt
          : combineDateAndTime(form.startDate, form.startTime),
        endsAt: scheduleIsUnchanged
          ? editingActivity?.endsAt
          : combineDateAndTime(form.endDate, form.endTime),
        dailySchedules: form.dailySchedules.length ? form.dailySchedules : undefined,
        provinceId: findOptionId(lookupData.provinces, form.province),
        districtId: editingActivity?.districtId || null,
        communeId: editingActivity?.communeId || null,
        locationName: form.location || null,
        address: form.address.trim() || null,
        googleMapUrl: form.mapLink.trim() || null,
        capacity: editingActivity?.capacity || null,
        coverImageId: editingActivity?.coverImageId || null,
      };

      // Every one of these already has its own specific alert in
      // validateForm() above (or, for statusId, a silent DRAFT fallback
      // just above) -- so in normal use this should never actually catch
      // anything. It stays as a last-resort net for the case a selected
      // label no longer matches any loaded option (e.g. lookupData changed
      // under a stale selection), and names exactly which field(s) that
      // happened to instead of a single generic message that leaves the
      // person guessing.
      const requiredFieldLabels = [
        [t("activityPage.selectType"), payload.typeId],
        [t("activityPage.sector"), payload.sectorId],
        [t("memberPage.status"), payload.statusId],
        [t("activityPage.hostBranch"), payload.branchId],
        [t("activityPage.province"), payload.provinceId],
        [t("activityPage.startDate"), payload.startsAt],
        [t("activityPage.endDate"), payload.endsAt],
      ];
      const missingFieldLabels = requiredFieldLabels
        .filter(([, value]) => value == null)
        .map(([label]) => label);
      if (missingFieldLabels.length > 0) {
        throw new Error(
          t("activityPage.missingFields").replace("{fields}", missingFieldLabels.join(", ")),
        );
      }
      if (!isEditMode) {
        delete payload.isPublic;
      }

      const savedActivity = await fetchJson(
        isEditMode
          ? `/api/backend/activities/${encodeURIComponent(editId)}`
          : "/api/backend/activities",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const savedId = savedActivity.id;

      if (!isEditMode) {
        const invitedBranchIds = form.invitedBranches
          .map((label) => findOptionId(lookupData.invitableBranches, label))
          .filter(Boolean);
        await Promise.all(
          invitedBranchIds.map((branchId) =>
            fetchJson(`/api/backend/activities/${savedId}/invited-branches`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ branch_id: branchId }),
            }),
          ),
        );
      }

      if (!isEditMode && selectedMemberIds.length) {
        await fetchJson(`/api/backend/activities/${savedId}/participants/invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_ids: selectedMemberIds.map(Number) }),
        });
      }

      if (activityImages.length) {
        const imageData = new FormData();
        activityImages.forEach((file) => imageData.append("files", file));
        await fetchJson(`/api/backend/activities/${savedId}/gallery`, {
          method: "POST",
          body: imageData,
        });
      }

      await Promise.all(
        activityDocuments.map((file, index) => {
          const documentData = new FormData();
          documentData.append("file", file);
          documentData.append("title", file.name);
          documentData.append("sortOrder", String(index));
          return fetchJson(`/api/backend/activities/${savedId}/attachments`, {
            method: "POST",
            body: documentData,
          });
        }),
      );

      if (shouldComplete) {
        await fetchJson(
          `/api/backend/activities/${encodeURIComponent(savedId)}/complete`,
          { method: "PATCH" },
        );
      }

      router.push(`/activity/${savedId}`);
    } catch (error) {
      console.error("Save activity error:", error);
      alert(
        error?.message ||
          t("activityPage.saveFailed"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  // `canManage` (host) or `canManageAsInvitedBranch` (an accepted co-hosting
  // branch) are both computed server-side. Block the edit form entirely for
  // anyone with neither — the backend would reject every action anyway, but
  // this avoids a confusing failed submit. In create mode there's no
  // per-activity flag to check yet, so it falls back to a plain role check
  // (VIEWER / MEMBER accounts can never create an activity).
  const isBlockedFromEditing =
    isEditMode &&
    editingActivity != null &&
    !canManage &&
    !canManageAsInvitedBranch;
  const isBlockedFromCreating = !isEditMode && !permissionsLoading && !canCreateActivity;

  if (isBlockedFromEditing || isBlockedFromCreating) {
    return (
      <div className="rounded-xl border border-error/30 bg-error-bg p-6 text-center text-error">
        <p className="text-sm font-semibold">
          {isBlockedFromEditing
            ? t("activityPage.cannotEditActivity")
            : t("activityPage.cannotCreateActivity")}
        </p>

        <p className="mt-1 text-xs">
          {isBlockedFromEditing
            ? t("activityPage.editPermissionDescription")
            : t("activityPage.createPermissionDescription")}
        </p>

        <Link
          href={isBlockedFromEditing ? `/activity/${editId}` : "/activity"}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-secondary px-4 text-sm font-medium text-white hover:bg-secondary-hover"
        >
          {isBlockedFromEditing ? t("activityPage.backToActivityDetail") : t("activityPage.backToActivities")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSave} className="activity-create-form space-y-6">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-1 text-sm">
            <Link href="/activity" className="text-text-secondary transition hover:text-primary">
              {t("activityPage.activity")}
            </Link>

            <ChevronRight size={14} className="shrink-0 text-text-secondary" />

            {isEditMode && (
              <>
                <Link href={`/activity/${editId}`} className="max-w-[250px] truncate text-text-secondary transition hover:text-primary">
                  {editingActivity?.name || t("activityPage.activityInfo")}
                </Link>

                <ChevronRight size={14} className="shrink-0 text-text-secondary" />
              </>
            )}

            <span className="font-semibold text-primary">
              {isEditMode
                ? t("activityPage.editActivity")
                : t("activityPage.createNewActivity")}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-secondary">
            {isEditMode
              ? t("activityPage.editActivity")
              : t("activityPage.createNewActivity")}
          </h1>

          {isInvitedBranchOnly && (
            <p className="mt-2 rounded-lg border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning">
              {t("activityPage.invitedBranchNotice")}
            </p>
          )}
        </div>

        <section className="rounded-xl border border-border bg-bg-page-white p-5">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
            <Info size={18} />
            {t("activityPage.activityInfo")}
          </h2>

          {/* A co-hosting (invited) branch may never edit the activity's own
              info — only the host branch can. Locking the whole fieldset is
              simpler and safer than disabling each field individually. */}
          <fieldset disabled={isInvitedBranchOnly} className="m-0 min-w-0 border-0 p-0">
          <div className="space-y-5">
            <div className="grid grid-cols-1 items-end gap-5 md:grid-cols-2 xl:grid-cols-3">
              <FormControl
                label={t("activityPage.activityName")}
                value={form.name}
                onChange={(event) => setValue("name", event.target.value)}
                placeholder="កម្មវិធីដាំដើមឈើ"
              />

              <FormSelect
                label={t("activityPage.hostBranch")}
                value={form.branch}
                onChange={handleBranchChange}
                placeholder={t("memberPage.selectBranch")}
                options={
                  isBranchScoped
                    ? form.branch
                      ? [form.branch]
                      : []
                    : branchOptions
                }
                disabled={isBranchScoped}
              />

              <FormSelect
                label={t("memberPage.type")}
                value={form.type}
                onChange={(event) => setValue("type", event.target.value)}
                placeholder={t("activityPage.selectType")}
                options={typeOptions}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormSelect
                label={t("activityPage.sector")}
                value={form.sector}
                onChange={(event) => setValue("sector", event.target.value)}
                placeholder={t("activityPage.selectSector")}
                options={sectorOptions}
              />

              <FormSelect
                label={t("activityPage.visibility")}
                value={form.visibility}
                onChange={(event) => setValue("visibility", event.target.value)}
                placeholder={t("activityPage.selectVisibility")}
                options={visibilityOptions}
              />
            </div>

          </div>

          <div className="mt-5">
            <label
              htmlFor="activity-description"
              className="mb-2 block text-sm font-semibold text-text-primary"
            >
              {t("activityPage.description")}
            </label>

            <textarea
              id="activity-description"
              value={form.description}
              onChange={(event) =>
                setValue("description", event.target.value)
              }
              placeholder={
                form.description
                  ? ""
                  : t("activityPage.descriptionPlaceholder")
              }
              className="h-32 w-full resize-none rounded-lg border border-border bg-bg-page-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary"
            />
          </div>
          </fieldset>
        </section>

        <fieldset disabled={isInvitedBranchOnly} className="m-0 min-w-0 border-0 p-0">
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-border bg-bg-page-white p-5">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
              <CalendarDays size={18} />
              {t("activityPage.dateTime")}
            </h2>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <DatePickerField
                label={t("activityPage.startDate")}
                value={form.startDate}
                onChange={(date) => setScheduleValue("startDate", date)}
                variant="start"
              />

              <DatePickerField
                label={t("activityPage.endDate")}
                value={form.endDate}
                min={formatDate(form.startDate)}
                onChange={(date) => setScheduleValue("endDate", date)}
                variant="end"
              />

              <FormControl
                label={t("activityPage.startTime")}
                type="time"
                value={form.startTime}
                onChange={(event) => setScheduleValue("startTime", event.target.value)}
                className = "h-[34px]"
              />

              <FormControl
                label={t("activityPage.endTime")}
                type="time"
                value={form.endTime}
                onChange={(event) => setScheduleValue("endTime", event.target.value)}
                className = "h-[34px]"
              />
            </div>

            {form.startDate && form.endDate && formatDate(form.startDate) !== formatDate(form.endDate) && (
              <div className="mt-5 rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div><p className="font-semibold text-text-primary">{t("activityPage.dailySchedule")}</p><p className="text-xs text-text-secondary">{t("activityPage.optional")}</p></div>
                  <button type="button" onClick={createDailySchedules} className="rounded bg-primary px-3 py-1.5 text-sm text-white">{t("activityPage.createDays")}</button>
                </div>
                {form.dailySchedules.map((row, index) => (
                  <div key={row.scheduleDate} className="mb-2 grid grid-cols-3 gap-3 items-center">
                    <span className="text-sm">{t("activityPage.day")} {index + 1}: {row.scheduleDate}</span>
                    <input aria-label={`${t("activityPage.startTime")} ${index + 1}`} type="time" value={row.startsAt} onChange={(event) => setForm((current) => ({ ...current, dailySchedules: current.dailySchedules.map((item, itemIndex) => itemIndex === index ? { ...item, startsAt: event.target.value } : item) }))} />
                    <input aria-label={`${t("activityPage.endTime")} ${index + 1}`} type="time" value={row.endsAt} onChange={(event) => setForm((current) => ({ ...current, dailySchedules: current.dailySchedules.map((item, itemIndex) => itemIndex === index ? { ...item, endsAt: event.target.value } : item) }))} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-bg-page-white p-5">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
              <MapPin size={18} />
              {t("memberPage.location")}
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormSelect
                label={t("activityPage.province")}
                value={form.province}
                onChange={(event) => setValue("province", event.target.value)}
                placeholder={t("activityPage.selectProvince")}
                options={provinceOptions}
                required
              />

              <div >
                <label className="mb-2 block text-sm font-semibold text-text-primary">
                  {t("memberPage.location")}
                </label>

                <div className="relative">
                  <input type="url" value={form.mapLink} onChange={(event) => setValue("mapLink", event.target.value)} placeholder={form.mapLink ? "" : t("activityPage.mapLinkPlaceholder")} className="h-[34px] w-full rounded-lg border border-border bg-bg-page-white pl-4 pr-11 text-sm text-text-primary outline-none transition placeholder:text-text-mute focus:border-secondary" />

                  {form.mapLink ? (
                    <a href={form.mapLink} target="_blank" rel="noopener noreferrer" className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary transition hover:text-primary">
                      <Link2 size={18} />
                    </a>
                  ) : (
                    <Link2 size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <FormControl
                  label={t("activityPage.detailAddress")}
                  value={form.address}
                  onChange={(event) => setValue("address", event.target.value)}
                  placeholder={t("activityPage.detailAddressPlaceholder")}
                />
              </div>
            </div>
          </div>
        </section>
        </fieldset>

        <section className="rounded-xl border border-border bg-bg-page-white p-5">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
            <PencilLine size={18} />
            {t("memberPage.detail")}
          </h2>

          {/* Which branches are invited, and the activity's status, stay
              host-only — but the action buttons below (member invite /
              income / expense) must stay enabled for a co-hosting branch. */}
          <fieldset disabled={isInvitedBranchOnly} className="m-0 min-w-0 border-0 p-0">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SearchableBranchMultiSelect
              label={t("activityPage.branchesToInvite")}
              options={invitedBranchOptions}
              values={form.invitedBranches}
              onChange={(values) => setValue("invitedBranches", values)}
              placeholder={t("activityPage.selectBranchFirst")}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                {t("memberPage.status")}
              </label>

              <div
                className={`flex h-[34px] w-full items-center rounded-lg border border-border bg-bg-page-gray px-3 text-sm ${
                  displayStatusCode ? "text-text-primary" : "text-text-mute"
                }`}
              >
                {displayStatusLabel}
              </div>

              <p className="mt-1 text-xs text-text-mute">
                {t("activityPage.statusAutoNote")}
              </p>

              {isEditMode && (
                <label className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={isCancelled}
                    onChange={(event) => setIsCancelled(event.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  {t("activityPage.cancelThisActivity")}
                </label>
              )}
            </div>
          </div>
          </fieldset>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
            {isEditMode ? (
              <Link href={`/activity/${editId}/participants`} className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90">
                {t("activityPage.participantComposition")}
              </Link>
            ) : (
              <button type="button" onClick={handleOpenMemberModal} className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90">
                {t("activityPage.inviteMembers")}
              </button>
            )}

            {/* Income/expense are only ever clickable from the activity's
                own detail page (/activity/[id]) — managing money for an
                activity that's still being created, or that you're
                mid-edit on (dates/status could still change), belongs to
                a stable, already-saved view, not this form. */}
            <button
              type="button"
              disabled
              title={
                isEditMode
                  ? t("activityPage.manageIncomeExpenseFromDetail")
                  : t("activityPage.saveActivityFirst")
              }
              className="flex h-10 cursor-not-allowed items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white opacity-60"
            >
              {t("activityPage.income")}
            </button>

            <button
              type="button"
              disabled
              title={
                isEditMode
                  ? t("activityPage.manageIncomeExpenseFromDetail")
                  : t("activityPage.saveActivityFirst")
              }
              className="flex h-10 cursor-not-allowed items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white opacity-60"
            >
              {t("activityPage.expense")}
            </button>
          </div>

          {canInviteMoreMembers && (
            <button
              type="button"
              onClick={handleOpenMemberModal}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary text-sm font-semibold text-primary transition hover:bg-primary-light md:w-auto md:px-5"
            >
              {t("activityPage.inviteMembers")}
            </button>
          )}
        </section>

        {/* A co-hosting (invited) branch never manages the activity's own
            cover image/gallery/attachments — only the host branch does. */}
        {!isInvitedBranchOnly && (
        <section className="rounded-xl border border-border bg-bg-page-white p-5">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
            <Paperclip size={18} />
            {t("activityPage.imagesAndDocuments")}
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              {isEditMode && existingImages.length > 0 && (
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {existingImages.map((photo) => (
                    <div
                      key={photo.id ?? photo.url}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-bg-page-gray"
                    >
                      {photo.url ? (
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-text-secondary">
                          <ImageIcon size={20} />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(photo)}
                        disabled={deletingExistingId === `image-${photo.id}`}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-60"
                        aria-label={`${t("memberPage.delete")} ${photo.name}`}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <MultipleFileUpload
                label={t("activityPage.activityImages")}
                files={activityImages}
                onChange={setActivityImages}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                uploadText={t("activityPage.uploadImage")}
                helperText={t("activityPage.imageUploadHelp")}
                maxSize={MAX_IMAGE_SIZE}
                kind="image"
              />
            </div>

            <div>
              {isEditMode && existingDocuments.length > 0 && (
                <div className="mb-3 space-y-2">
                  {existingDocuments.map((document) => (
                    <div
                      key={document.id ?? document.url}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-page-white px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-light text-secondary">
                          <FileText size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text-primary">
                            {document.name}
                          </p>

                          <p className="text-xs text-text-secondary">
                            {document.size}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        {document.url && (
                          <a
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md p-1.5 text-primary transition hover:bg-primary/10"
                            aria-label={`${t("activityPage.detail")} ${document.name}`}
                          >
                            <Eye size={16} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteExistingDocument(document)}
                          disabled={deletingExistingId === `document-${document.id}`}
                          className="rounded-md p-1.5 text-error transition hover:bg-error-bg disabled:opacity-60"
                          aria-label={`${t("memberPage.delete")} ${document.name}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <MultipleFileUpload
                label={t("activityPage.otherDocuments")}
                files={activityDocuments}
                onChange={setActivityDocuments}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                uploadText={t("memberPage.uploadFile")}
                helperText={t("activityPage.documentUploadHelp")}
                maxSize={MAX_DOCUMENT_SIZE}
                kind="file"
              />
            </div>
          </div>
        </section>
        )}

        <div className="flex items-center justify-between gap-3">
          <FormActionButton
            action="cancel"
            onClick={handleCancel}
            disabled={isSaving}
            label={isInvitedBranchOnly ? t("activityPage.back") : undefined}
          />

          {/* Nothing on the main form is editable in invited-branch-only
              mode, so there is nothing to save here — member invite /
              income / expense above are their own immediate actions. */}
          {!isInvitedBranchOnly && (
            <FormActionButton
              action="save"
              type="submit"
              disabled={isSaving}
              label={
                isSaving
                  ? t("common.saving")
                  : isEditMode
                    ? t("activityPage.saveChanges")
                    : t("common.save")
              }
            />
          )}
        </div>
      </form>

      {showMemberModal && (
        <MemberSelectModal
          onClose={() => setShowMemberModal(false)}
          members={memberOptions}
          selectedIds={selectedMemberIds}
          onSave={handleMemberModalSave}
          branchName={isInvitedBranchOnly ? invitedBranchLabel : form.branch}
          loading={membersLoading}
          error={memberLoadError}
        />
      )}
    </>
  );
}
