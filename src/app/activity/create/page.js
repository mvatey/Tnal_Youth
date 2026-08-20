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
  date.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return date.toISOString();
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);
  const [editingActivity, setEditingActivity] = useState(null);
  const [form, setForm] = useState(() => createInitialForm(null));
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

  const incomeBranchId = isInvitedBranchOnly
    ? invitedBranchId
    : (editingActivity?.branchId ?? editingActivity?.branch_id ?? null);

  const activityIncomeHref =
    isEditMode && incomeBranchId != null
      ? `/donation/eventdonation/detail?event=${encodeURIComponent(editId)}&branch=${encodeURIComponent(incomeBranchId)}`
      : isEditMode
        ? `/donation/eventdonation/detail?event=${encodeURIComponent(editId)}`
        : null;
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

  const branchOptions = lookupData.branches.map(getOptionLabel).filter(Boolean);
  const allInvitableBranchOptions = lookupData.invitableBranches
    .map(getOptionLabel)
    .filter(Boolean);
  const provinceOptions = lookupData.provinces.map(getOptionLabel).filter(Boolean);
  const typeOptions = lookupData.types.map(getOptionLabel).filter(Boolean);
  const sectorOptions = lookupData.sectors.map(getOptionLabel).filter(Boolean);
  const statusOptions = lookupData.statuses.map(getOptionLabel).filter(Boolean);

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
            setExistingParticipantIds(currentParticipantIds);
            setSelectedMemberIds(currentParticipantIds);
            setExistingImages(normalizedImages);
            setExistingDocuments(normalizedDocuments);
          }
        }
      } catch (error) {
        console.error("Load activity form data error:", error);
        if (!cancelled) alert(error.message || "Unable to load activity form data.");
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
          setMemberLoadError(error.message || "Unable to load members for this branch.");
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
    if (!window.confirm("តើអ្នកចង់លុបរូបភាពនេះមែនទេ?")) return;

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
      alert(error.message || "លុបរូបភាពមិនបានសម្រេច");
    } finally {
      setDeletingExistingId(null);
    }
  };

  const handleDeleteExistingDocument = async (document) => {
    if (!document?.id || !editId) return;
    if (!window.confirm("តើអ្នកចង់លុបឯកសារនេះមែនទេ?")) return;

    setDeletingExistingId(`document-${document.id}`);
    try {
      await fetchJson(
        `/api/backend/activities/${encodeURIComponent(editId)}/attachments/${document.id}`,
        { method: "DELETE" }
      );
      setExistingDocuments((current) => current.filter((item) => item.id !== document.id));
    } catch (error) {
      console.error("Delete activity attachment error:", error);
      alert(error.message || "លុបឯកសារមិនបានសម្រេច");
    } finally {
      setDeletingExistingId(null);
    }
  };

  const handleOpenMemberModal = () => {
    if (isInvitedBranchOnly) {
      if (!invitedBranchId) {
        alert("មិនអាចកំណត់អត្តសញ្ញាណសាខារបស់អ្នកទេ");
        return;
      }
      setShowMemberModal(true);
      return;
    }

    if (!form.branch) {
      alert("សូមជ្រើសរើសសាខាជាមុនសិន");
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
      alert(error.message || "មិនអាចអញ្ជើញសមាជិកបន្ថែមបានទេ");
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
      alert("សូមបញ្ចូលឈ្មោះកម្មវិធី");
      return false;
    }

    if (!form.branch) {
      alert("សូមជ្រើសរើសសាខារៀបចំកម្មវិធី");
      return false;
    }

    if (!form.type) {
      alert("សូមជ្រើសរើសប្រភេទកម្មវិធី");
      return false;
    }

    if (!form.sector) {
      alert("សូមជ្រើសរើសវិស័យ");
      return false;
    }

    if (!form.startDate) {
      alert("សូមជ្រើសរើសកាលបរិច្ឆេទចាប់ផ្តើម");
      return false;
    }

    if (!form.endDate) {
      alert("សូមជ្រើសរើសកាលបរិច្ឆេទបញ្ចប់");
      return false;
    }

    if (!form.province) {
      alert("សូមជ្រើសរើសខេត្ត/រាជធានី");
      return false;
    }

    const startsAt = combineDateAndTime(form.startDate, form.startTime);
    const endsAt = combineDateAndTime(form.endDate, form.endTime);

    if (
      startsAt &&
      endsAt &&
      new Date(endsAt).getTime() <= new Date(startsAt).getTime()
    ) {
      alert("កាលបរិច្ឆេទបញ្ចប់មិនអាចមុនកាលបរិច្ឆេទចាប់ផ្តើមបានទេ");
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
        const match = options.find((option) => getOptionLabel(option) === label);
        const value = getOptionValue(match);
        return Number.isFinite(value) && value > 0 ? value : null;
      };
      const selectedStatusOption = lookupData.statuses.find(
        (option) => getOptionLabel(option) === form.status,
      );
      const shouldComplete = getOptionCode(selectedStatusOption) === "COMPLETED";
      const currentStatusId = getOptionValue(editingActivity?.status);
      const draftStatusId = getOptionValue(
        lookupData.statuses.find((option) => getOptionCode(option) === "DRAFT"),
      );
      // "ស្ថានភាព" (status) has no specific alert in validateForm above --
      // rather than force every create to explicitly pick a status, an
      // unselected one (getOptionValue returns NaN, not null/undefined, for
      // a not-found option -- so this can't just be a "?? draftStatusId")
      // silently falls back to DRAFT, same as a brand new activity
      // implicitly is until someone marks it otherwise.
      const explicitStatusId = getOptionValue(selectedStatusOption);
      const fallbackStatusId =
        Number.isFinite(explicitStatusId) && explicitStatusId > 0
          ? explicitStatusId
          : draftStatusId;
      const saveStatusId = shouldComplete
        ? Number.isFinite(currentStatusId) &&
          currentStatusId > 0 &&
          getOptionCode(editingActivity?.status) !== "COMPLETED"
          ? currentStatusId
          : draftStatusId
        : fallbackStatusId;
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
        isPublic: form.visibility === VISIBILITY_OPTIONS[0],
        startsAt: combineDateAndTime(form.startDate, form.startTime),
        endsAt: combineDateAndTime(form.endDate, form.endTime),
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
        ["ប្រភេទកម្មវិធី", payload.typeId],
        ["វិស័យ", payload.sectorId],
        ["ស្ថានភាព", payload.statusId],
        ["សាខារៀបចំកម្មវិធី", payload.branchId],
        ["ខេត្ត/រាជធានី", payload.provinceId],
        ["កាលបរិច្ឆេទចាប់ផ្តើម", payload.startsAt],
        ["កាលបរិច្ឆេទបញ្ចប់", payload.endsAt],
      ];
      const missingFieldLabels = requiredFieldLabels
        .filter(([, value]) => value == null)
        .map(([label]) => label);
      if (missingFieldLabels.length > 0) {
        throw new Error(
          `សូមបំពេញព័ត៌មានដែលខ្វះខាតៈ ${missingFieldLabels.join(", ")}`,
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
          "មិនអាចរក្សាទុកកម្មវិធីបានទេ",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // `canManage` (host) or `canManageAsInvitedBranch` (an accepted co-hosting
  // branch) are both computed server-side. Block the edit form entirely for
  // anyone with neither — the backend would reject every action anyway, but
  // this avoids a confusing failed submit.
  if (
    isEditMode &&
    editingActivity != null &&
    !canManage &&
    !canManageAsInvitedBranch
  ) {
    return (
      <div className="rounded-xl border border-error/30 bg-error-bg p-6 text-center text-error">
        <p className="text-sm font-semibold">
          អ្នកមិនមានសិទ្ធិកែប្រែកម្មវិធីនេះទេ
        </p>

        <p className="mt-1 text-xs">
          មានតែអ្នកដឹកនាំសាខា ឬលេខាធិការនៃសាខារៀបចំកម្មវិធីនេះ ឬសាខាដែលបានទទួល
          ការអញ្ជើញចូលរួមរៀបចំកម្មវិធីនេះប៉ុណ្ណោះ ដែលអាចចូលមើលទំព័រនេះបាន។
        </p>

        <Link
          href={`/activity/${editId}`}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-secondary px-4 text-sm font-medium text-white hover:bg-secondary-hover"
        >
          ត្រឡប់ទៅព័ត៌មានកម្មវិធី
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
              កម្មវិធី
            </Link>

            <ChevronRight size={14} className="shrink-0 text-text-secondary" />

            {isEditMode && (
              <>
                <Link href={`/activity/${editId}`} className="max-w-[250px] truncate text-text-secondary transition hover:text-primary">
                  {editingActivity?.name || "ព័ត៌មានកម្មវិធី"}
                </Link>

                <ChevronRight size={14} className="shrink-0 text-text-secondary" />
              </>
            )}

            <span className="font-semibold text-primary">
              {isEditMode
                ? "កែប្រែកម្មវិធី"
                : "បង្កើតកម្មវិធីថ្មី"}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-secondary">
            {isEditMode
              ? "កែប្រែកម្មវិធី"
              : "បង្កើតកម្មវិធីថ្មី"}
          </h1>

          {isInvitedBranchOnly && (
            <p className="mt-2 rounded-lg border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning">
              សាខារបស់អ្នកត្រូវបានអញ្ជើញចូលរួមរៀបចំកម្មវិធីនេះ។ អ្នកអាចអញ្ជើញ
              សមាជិកនៃសាខារបស់អ្នក និងកត់ត្រាចំណូល/ចំណាយបានប៉ុណ្ណោះ —
              ព័ត៌មានផ្សេងទៀតរបស់កម្មវិធីនេះកែប្រែបានតែពីសាខារៀបចំកម្មវិធីប៉ុណ្ណោះ។
            </p>
          )}
        </div>

        <section className="rounded-xl border border-border bg-bg-page-white p-5">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
            <Info size={18} />
            ព័ត៌មានកម្មវិធី
          </h2>

          {/* A co-hosting (invited) branch may never edit the activity's own
              info — only the host branch can. Locking the whole fieldset is
              simpler and safer than disabling each field individually. */}
          <fieldset disabled={isInvitedBranchOnly} className="m-0 min-w-0 border-0 p-0">
          <div className="space-y-5">
            <div className="grid grid-cols-1 items-end gap-5 md:grid-cols-2 xl:grid-cols-3">
              <FormControl
                label="ឈ្មោះកម្មវិធី"
                value={form.name}
                onChange={(event) => setValue("name", event.target.value)}
                placeholder="កម្មវិធីដាំដើមឈើ"
              />

              <FormSelect
                label="សាខារៀបចំកម្មវិធី"
                value={form.branch}
                onChange={handleBranchChange}
                placeholder="ជ្រើសរើសសាខា"
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
                label="ប្រភេទកម្មវិធី"
                value={form.type}
                onChange={(event) => setValue("type", event.target.value)}
                placeholder="ជ្រើសរើសប្រភេទ"
                options={typeOptions}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormSelect
                label="វិស័យ"
                value={form.sector}
                onChange={(event) => setValue("sector", event.target.value)}
                placeholder="ជ្រើសរើសវិស័យ"
                options={sectorOptions}
              />

              <FormSelect
                label="ការផ្សព្វផ្សាយ"
                value={form.visibility}
                onChange={(event) => setValue("visibility", event.target.value)}
                placeholder="ជ្រើសរើសការផ្សព្វផ្សាយ"
                options={VISIBILITY_OPTIONS}
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="activity-description"
              className="mb-2 block text-sm font-semibold text-text-primary"
            >
              ការពិពណ៌នា
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
                  : "ពិពណ៌នាអំពីកម្មវិធី..."
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
              កាលបរិច្ឆេទ និង ពេលវេលា
            </h2>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <DatePickerField
                label="កាលបរិច្ឆេទចាប់ផ្តើម"
                value={form.startDate}
                onChange={(date) => setValue("startDate", date)}
                variant="start"
              />

              <DatePickerField
                label="កាលបរិច្ឆេទបញ្ចប់"
                value={form.endDate}
                min={formatDate(form.startDate)}
                onChange={(date) => setValue("endDate", date)}
                variant="end"
              />

              <FormControl
                label="ពេលវេលាចាប់ផ្តើម"
                type="time"
                value={form.startTime}
                onChange={(event) => setValue("startTime", event.target.value)}
                className = "h-[34px]"
              />

              <FormControl
                label="ពេលវេលាបញ្ចប់"
                type="time"
                value={form.endTime}
                onChange={(event) => setValue("endTime", event.target.value)}
                className = "h-[34px]"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bg-page-white p-5">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
              <MapPin size={18} />
              ទីតាំង
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormSelect
                label="ខេត្ត/រាជធានី"
                value={form.province}
                onChange={(event) => setValue("province", event.target.value)}
                placeholder="ជ្រើសរើសខេត្ត/រាជធានី"
                options={provinceOptions}
                required
              />

              <div >
                <label className="mb-2 block text-sm font-semibold text-text-primary">
                  ទីតាំងផែនទី
                </label>

                <div className="relative">
                  <input type="url" value={form.mapLink} onChange={(event) => setValue("mapLink", event.target.value)} placeholder={form.mapLink ? "" : "បញ្ចូល Google Maps link"} className="h-[34px] w-full rounded-lg border border-border bg-bg-page-white pl-4 pr-11 text-sm text-text-primary outline-none transition placeholder:text-text-mute focus:border-secondary" />

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
                  label="អាសយដ្ឋានលម្អិត"
                  value={form.address}
                  onChange={(event) => setValue("address", event.target.value)}
                  placeholder="ភូមិ, ឃុំ, ស្រុក, ខេត្ត..."
                />
              </div>
            </div>
          </div>
        </section>
        </fieldset>

        <section className="rounded-xl border border-border bg-bg-page-white p-5">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
            <PencilLine size={18} />
            ព័ត៌មានបន្ថែម
          </h2>

          {/* Which branches are invited, and the activity's status, stay
              host-only — but the action buttons below (member invite /
              income / expense) must stay enabled for a co-hosting branch. */}
          <fieldset disabled={isInvitedBranchOnly} className="m-0 min-w-0 border-0 p-0">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SearchableBranchMultiSelect
              label="សាខាដែលត្រូវអញ្ជើញ"
              options={invitedBranchOptions}
              values={form.invitedBranches}
              onChange={(values) => setValue("invitedBranches", values)}
              placeholder="ស្វែងរក និងជ្រើសរើសសាខា"
            />

            <FormSelect
              label="ស្ថានភាព"
              value={form.status}
              onChange={(event) => setValue("status", event.target.value)}
              placeholder="ជ្រើសរើសស្ថានភាពកម្មវិធី"
                options={statusOptions}
            />
          </div>
          </fieldset>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
            {isEditMode ? (
              <Link href={`/activity/${editId}/participants`} className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90">
                សមាសភាពចូលរួម
              </Link>
            ) : (
              <button type="button" onClick={handleOpenMemberModal} className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90">
                ជ្រើសរើសសមាសភាព
              </button>
            )}

            {isEditMode ? (
              <Link href={activityIncomeHref} className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90">
                ចំណូល
              </Link>
            ) : (
              <button type="button" disabled title="សូមរក្សាទុកសកម្មភាពជាមុនសិន" className="flex h-10 cursor-not-allowed items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white opacity-60">
                ចំណូល
              </button>
            )}

            {isEditMode ? (
              <Link href={`/activity/create/expense?activityId=${editId}`} className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90">
                ចំណាយ
              </Link>
            ) : (
              <button type="button" disabled title="សូមរក្សាទុកសកម្មភាពជាមុនសិន" className="flex h-10 cursor-not-allowed items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white opacity-60">
                ចំណាយ
              </button>
            )}
          </div>

          {canInviteMoreMembers && (
            <button
              type="button"
              onClick={handleOpenMemberModal}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary text-sm font-semibold text-primary transition hover:bg-primary-light md:w-auto md:px-5"
            >
              អញ្ជើញសមាជិកបន្ថែម
            </button>
          )}
        </section>

        {/* A co-hosting (invited) branch never manages the activity's own
            cover image/gallery/attachments — only the host branch does. */}
        {!isInvitedBranchOnly && (
        <section className="rounded-xl border border-border bg-bg-page-white p-5">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
            <Paperclip size={18} />
            រូបភាព និងឯកសារ
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
                        aria-label={`លុប ${photo.name}`}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <MultipleFileUpload
                label="រូបភាពកម្មវិធី"
                files={activityImages}
                onChange={setActivityImages}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                uploadText="បញ្ចូលរូបភាព"
                helperText="PNG, JPG, JPEG, WEBP — អតិបរមា 5MB ក្នុងមួយរូប"
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
                            aria-label={`មើល ${document.name}`}
                          >
                            <Eye size={16} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteExistingDocument(document)}
                          disabled={deletingExistingId === `document-${document.id}`}
                          className="rounded-md p-1.5 text-error transition hover:bg-error-bg disabled:opacity-60"
                          aria-label={`លុប ${document.name}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <MultipleFileUpload
                label="ឯកសារផ្សេងៗ"
                files={activityDocuments}
                onChange={setActivityDocuments}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                uploadText="បញ្ចូលឯកសារ"
                helperText="PDF, DOC, DOCX, XLS, XLSX — អតិបរមា 20MB"
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
            label={isInvitedBranchOnly ? "ត្រឡប់ក្រោយ" : undefined}
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
                  ? "កំពុងរក្សាទុក..."
                  : isEditMode
                    ? "រក្សាទុកការកែប្រែ"
                    : "រក្សាទុក"
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
