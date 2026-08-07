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
import { useActivityCreateDraft } from "./ActivityCreateDraftContext";

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

const LOCATION_OPTIONS = [
  "សាលាបឋមសិក្សា",
  "សាលប្រជុំធំ",
  "មជ្ឈមណ្ឌលសហគមន៍",
];

const STATUS_OPTIONS = [
  "ឆាប់ៗនេះ",
  "កំពុងដំណើរការ",
  "បានបញ្ចប់",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;

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
      mapLink: "",
      address: "",
      invitedBranches: [],
      status: "",
    };
  }

  return {
    name: activity.name || "",
    branch: activity.branch || "",
    type: activity.type || "",
    sector: activity.sector || "",
    visibility: activity.visibility || "សាធារណៈ",
    description: activity.descriptionDetail || activity.description || "",
    startDate: convertToDate(
      activity.startDateISO ||
        activity.startDateValue ||
        activity.startDate ||
        activity.dateValue ||
        activity.date
    ),
    endDate: convertToDate(
      activity.endDateISO ||
        activity.endDateValue ||
        activity.endDate ||
        activity.finishDate ||
        activity.dateValue ||
        activity.date
    ),
    startTime: activity.startTime24 || activity.startTime || "",
    endTime: activity.endTime24 || activity.endTime || "",
    location: getActivityLocation(activity.location),
    mapLink: activity.mapLink || "",
    address: activity.address || "",
    invitedBranches: normalizeInvitedBranches(activity),
    status: activity.status || activity.status2 || "",
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

      <button type="button" onClick={() => setOpen((current) => !current)} className={`flex h-[34px] w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm outline-none transition ${open ? "border-secondary ring-1 ring-secondary/20" : "border-border hover:border-secondary"}`}>
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
            <span role="button" tabIndex={0} onClick={clearAll} onKeyDown={(event) => event.key === "Enter" && clearAll(event)} className="rounded-md p-1 text-text-secondary transition hover:bg-gray-100 hover:text-error">
              <X size={14} />
            </span>
          )}

          <ChevronDown size={16} className={`text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[260px] overflow-hidden rounded-lg border border-border bg-white shadow-xl">
          <div className="border-b border-border p-2">
            <div className="flex h-9 items-center gap-2 rounded-md border border-border px-3 focus-within:border-secondary">
              <Search size={15} className="shrink-0 text-text-secondary" />

              <input ref={searchInputRef} type="text" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ស្វែងរកសាខា..." className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary" />

              {query && (
                <button type="button" onClick={() => setQuery("")} className="rounded p-0.5 text-text-secondary transition hover:bg-gray-100 hover:text-text-primary">
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
                  <button key={option} type="button" onClick={() => toggleOption(option)} className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition ${selected ? "bg-secondary-light text-secondary" : "text-text-primary hover:bg-gray-50"}`}>
                    <span>{option}</span>

                    <span className={`flex h-5 w-5 items-center justify-center rounded border ${selected ? "border-secondary bg-secondary text-white" : "border-gray-300 bg-white"}`}>
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

      <button type="button" onClick={() => inputRef.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { event.preventDefault(); setDragging(false); }} onDrop={handleDrop} className={`flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${dragging ? "border-secondary bg-secondary-light/50" : "border-border bg-gray-50 hover:border-secondary hover:bg-secondary-light/30"}`}>
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
            <div key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2.5">
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
  const { draft, updateDraft, clearDraft } = useActivityCreateDraft();

  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);
  const [editingActivity, setEditingActivity] = useState(null);
  const [form, setForm] = useState(() => draft.form || createInitialForm(null));
  const [branchOptions, setBranchOptions] = useState(BRANCH_OPTIONS);
  const [typeOptions, setTypeOptions] = useState(TYPE_OPTIONS);
  const [sectorOptions, setSectorOptions] = useState(SECTOR_OPTIONS);
  const [statusOptions, setStatusOptions] = useState(STATUS_OPTIONS);
  const [lookupIds, setLookupIds] = useState({ branches: {}, types: {}, sectors: {}, statuses: {} });
  const [invitationRecords, setInvitationRecords] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [activityImages, setActivityImages] = useState(() => draft.activityImages || []);
  const [activityDocuments, setActivityDocuments] = useState(() => draft.activityDocuments || []);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState(() => draft.selectedMemberIds || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) return;
    updateDraft({ form, activityImages, activityDocuments, selectedMemberIds });
  }, [isEditMode, form, activityImages, activityDocuments, selectedMemberIds, updateDraft]);

  useEffect(() => {
    let cancelled = false;

    async function loadFormData() {
      setLoadError("");
      try {
        const urls = [
          "/api/lookups/branches",
          "/api/lookups/activity-types",
          "/api/lookups/activity-sectors",
          "/api/lookups/activity-statuses",
        ];
        if (editId) {
          urls.push(
            `/api/backend/activities/${encodeURIComponent(editId)}`,
            `/api/backend/activities/${encodeURIComponent(editId)}/invited-branches`,
          );
        }
        const responses = await Promise.all(urls.map((url) => fetch(url, { cache: "no-store" })));
        const failed = responses.find((response) => !response.ok);
        if (failed) {
          const problem = await failed.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to load activity form data.");
        }
        const data = await Promise.all(responses.map((response) => response.json()));
        const [branches, types, sectors, statuses, activityRecord, invitations = []] = data;
        const toLabel = (item) => item.labelKm || item.labelEn || item.code;
        const makeMap = (items) => Object.fromEntries(items.map((item) => [toLabel(item), item.value ?? item.id]));
        const branchLabels = branches.map(toLabel);
        const typeLabels = types.map(toLabel);
        const sectorLabels = sectors.map(toLabel);
        const statusLabels = statuses.map(toLabel);
        const maps = {
          branches: makeMap(branches),
          types: makeMap(types),
          sectors: makeMap(sectors),
          statuses: makeMap(statuses),
        };

        if (cancelled) return;
        setBranchOptions(branchLabels);
        setTypeOptions(typeLabels);
        setSectorOptions(sectorLabels);
        setStatusOptions(statusLabels);
        setLookupIds(maps);
        setInvitationRecords(invitations);

        if (activityRecord) {
          const startsAt = activityRecord.startsAt ? new Date(activityRecord.startsAt) : null;
          const endsAt = activityRecord.endsAt ? new Date(activityRecord.endsAt) : null;
          const branchLabel = branches.find((item) => String(item.value) === String(activityRecord.branchId));
          const invitedLabels = invitations.map((invitation) =>
            invitation.branch_name_km || invitation.branch_name_en || invitation.branch_code,
          );
          const normalized = {
            ...activityRecord,
            name: activityRecord.titleKm || activityRecord.titleEn || "",
            documents: [],
          };
          setEditingActivity(normalized);
          setForm({
            name: normalized.name,
            branch: branchLabel ? toLabel(branchLabel) : "",
            type: toLabel(activityRecord.type),
            sector: toLabel(activityRecord.sector),
            visibility: activityRecord.publicActivity === false ? "ឯកជន" : "សាធារណៈ",
            description: activityRecord.description || "",
            startDate: startsAt,
            endDate: endsAt,
            startTime: startsAt ? startsAt.toTimeString().slice(0, 5) : "",
            endTime: endsAt ? endsAt.toTimeString().slice(0, 5) : "",
            location: activityRecord.locationName || "",
            mapLink: activityRecord.googleMapUrl || "",
            address: activityRecord.address || "",
            invitedBranches: invitedLabels,
            status: toLabel(activityRecord.status),
          });
        }
      } catch (error) {
        if (!cancelled) setLoadError(error.message || "Unable to load activity form data.");
      }
    }

    loadFormData();
    return () => {
      cancelled = true;
    };
  }, [editId]);

  const invitedBranchOptions = useMemo(() => {
    return branchOptions.filter(
      (branch) => branch !== form.branch
    );
  }, [branchOptions, form.branch]);

  const setValue = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleBranchChange = (value) => {
    setForm((currentForm) => ({
      ...currentForm,
      branch: value,
      invitedBranches: currentForm.invitedBranches.filter(
        (branch) => branch !== value
      ),
    }));
  };

  const handleCancel = () => {
    if (isEditMode && editId) {
      router.push(`/activity/${editId}`);
      return;
    }

    clearDraft();
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

    if (!form.sector || !form.status || !form.endDate || !form.startTime || !form.endTime) {
      alert("សូមបំពេញប្រភេទ វិស័យ ស្ថានភាព កាលបរិច្ឆេទ និងពេលវេលាឱ្យបានគ្រប់គ្រាន់");
      return false;
    }

    if (!form.startDate) {
      alert("សូមជ្រើសរើសកាលបរិច្ឆេទចាប់ផ្តើម");
      return false;
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
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
      const toOffsetDateTime = (date, time) => {
        const value = new Date(`${formatDate(date)}T${time}:00`);
        return value.toISOString();
      };
      const payload = {
        titleKm: form.name.trim(),
        titleEn: editingActivity?.titleEn || null,
        description: form.description.trim() || null,
        typeId: Number(lookupIds.types[form.type]),
        sectorId: Number(lookupIds.sectors[form.sector]),
        statusId: Number(lookupIds.statuses[form.status]),
        branchId: Number(lookupIds.branches[form.branch]),
        isPublic: form.visibility !== "ឯកជន",
        startsAt: toOffsetDateTime(form.startDate, form.startTime),
        endsAt: toOffsetDateTime(form.endDate, form.endTime),
        locationName: form.location.trim() || null,
        address: form.address.trim() || null,
        googleMapUrl: form.mapLink.trim() || null,
        capacity: editingActivity?.capacity || null,
        coverImageId: editingActivity?.coverImageId || null,
      };
      const url = isEditMode
        ? `/api/backend/activities/${encodeURIComponent(editId)}`
        : "/api/backend/activities";
      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.message || "Unable to save activity.");
      }
      const savedPayload = await response.json();
      const savedActivity = savedPayload?.data ?? savedPayload;
      const savedActivityId = Number(
        savedActivity?.id ?? savedActivity?.activityId ?? (isEditMode ? editId : null),
      );
      if (!Number.isSafeInteger(savedActivityId) || savedActivityId <= 0) {
        throw new Error("Activity was saved, but the server did not return a valid activity ID.");
      }
      const selectedBranchIds = new Set(
        form.invitedBranches.map((label) => Number(lookupIds.branches[label])).filter(Boolean),
      );
      await Promise.all(invitationRecords
        .filter((invitation) => !selectedBranchIds.has(Number(invitation.branch_id)))
        .map((invitation) => fetch(`/api/backend/activities/${savedActivityId}/invited-branches/${invitation.id}`, { method: "DELETE" })));
      const existingBranchIds = new Set(invitationRecords.map((invitation) => Number(invitation.branch_id)));
      await Promise.all([...selectedBranchIds]
        .filter((branchId) => !existingBranchIds.has(branchId))
        .map((branchId) => fetch(`/api/backend/activities/${savedActivityId}/invited-branches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branch_id: branchId, can_manage_attendance: false, can_record_donation: false }),
        })));

      if (!isEditMode && selectedMemberIds.length > 0) {
        const inviteResponse = await fetch(
          `/api/backend/activities/${savedActivityId}/participants/invite`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ member_ids: selectedMemberIds.map(Number) }),
          },
        );
        if (!inviteResponse.ok) {
          const problem = await inviteResponse.json().catch(() => ({}));
          throw new Error(problem.message || "Activity saved, but participants could not be invited.");
        }
      }

      if (activityImages.length > 0) {
        const imageData = new FormData();
        activityImages.forEach((file) => imageData.append("files", file));
        const imageResponse = await fetch(
          `/api/backend/activities/${savedActivityId}/gallery`,
          { method: "POST", body: imageData },
        );
        if (!imageResponse.ok) {
          const problem = await imageResponse.json().catch(() => ({}));
          throw new Error(problem.message || "Activity saved, but images could not be uploaded.");
        }
      }

      for (const [index, file] of activityDocuments.entries()) {
        const documentData = new FormData();
        documentData.append("file", file);
        documentData.append("title", file.name);
        documentData.append("sortOrder", String(index));
        const documentResponse = await fetch(
          `/api/backend/activities/${savedActivityId}/attachments`,
          { method: "POST", body: documentData },
        );
        if (!documentResponse.ok) {
          const problem = await documentResponse.json().catch(() => ({}));
          throw new Error(problem.message || "Activity saved, but a document could not be uploaded.");
        }
      }

      if (!isEditMode && Array.isArray(draft.incomeRows)) {
        const incomeItems = draft.incomeRows.filter(
          (row) => Number(row.amountRiel) > 0 || Number(row.amountDollar) > 0,
        );
        if (incomeItems.length > 0) {
          const incomeResponse = await fetch(
            `/api/backend/activities/${savedActivityId}/incomes/batch`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                received_at: new Date().toISOString(),
                items: incomeItems.map((row) => ({
                  member_id: Number(row.id),
                  amount_khr: Number(row.amountRiel) || 0,
                  amount_usd: Number(row.amountDollar) || 0,
                  payment_method_id: Number(row.paymentMethod),
                  receipt_file_id: row.receiptFileId || null,
                  description: null,
                  client_request_id: crypto.randomUUID(),
                })),
              }),
            },
          );
          if (!incomeResponse.ok) {
            const problem = await incomeResponse.json().catch(() => ({}));
            throw new Error(problem.message || "Activity saved, but income could not be saved.");
          }
        }
      }

      if (!isEditMode && Array.isArray(draft.expenseRows)) {
        const expenses = draft.expenseRows.filter((row) => row.name?.trim());
        for (const row of expenses) {
          const expenseResponse = await fetch(
            `/api/backend/activities/${savedActivityId}/expenses`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: row.name.trim(),
                description: row.category?.trim() || null,
                quantity: Number(row.quantity) || 1,
                amount_khr: Number(row.totalRiel) || 0,
                amount_usd: Number(row.directDollarTotal) || 0,
                spent_on: row.spentOn || new Date().toISOString().slice(0, 10),
                receipt_file_id: row.receiptFileId || null,
              }),
            },
          );
          if (!expenseResponse.ok) {
            const problem = await expenseResponse.json().catch(() => ({}));
            throw new Error(problem.message || "Activity saved, but expenses could not be saved.");
          }
        }
      }

      if (!isEditMode) clearDraft();
      router.push(`/activity/${savedActivityId}`);
    } catch (error) {
      setLoadError(error.message || "មិនអាចរក្សាទុកកម្មវិធីបានទេ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSave} className="activity-create-form space-y-6">
        {loadError && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>}
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
        </div>

        <section className="rounded-xl border border-border bg-white p-5">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
            <Info size={18} />
            ព័ត៌មានកម្មវិធី
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 items-end gap-5 md:grid-cols-2 xl:grid-cols-3">
              <FormControl
                label="ឈ្មោះកម្មវិធី"
                value={form.name}
                onChange={(value) => setValue("name", value)}
                placeholder="ឈ្មោះកម្មវិធី"
              />

              <FormSelect
                label="សាខារៀបចំកម្មវិធី"
                value={form.branch}
                onChange={handleBranchChange}
                placeholder="ជ្រើសរើសសាខា"
                options={branchOptions}
              />

              <FormSelect
                label="ប្រភេទកម្មវិធី"
                value={form.type}
                onChange={(value) => setValue("type", value)}
                placeholder="ជ្រើសរើសប្រភេទ"
                options={typeOptions}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormSelect
                label="វិស័យ"
                value={form.sector}
                onChange={(value) => setValue("sector", value)}
                placeholder="ជ្រើសរើសវិស័យ"
                options={sectorOptions}
              />

              <FormSelect
                label="ការផ្សព្វផ្សាយ"
                value={form.visibility}
                onChange={(value) => setValue("visibility", value)}
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
              className="h-32 w-full resize-none rounded-lg border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-border bg-white p-5">
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
                onChange={(value) => setValue("startTime", value)}
                className = "h-[34px]"
              />

              <FormControl
                label="ពេលវេលាបញ្ចប់"
                type="time"
                value={form.endTime}
                onChange={(value) => setValue("endTime", value)}
                className = "h-[34px]"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
              <MapPin size={18} />
              ទីតាំង
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormControl
                label="ទីតាំងកម្មវិធី"
                value={form.location}
                onChange={(value) => setValue("location", value)}
                placeholder="បញ្ចូលទីតាំងកម្មវិធី"
              />

              <div >
                <label className="mb-2 block text-sm font-semibold text-text-primary">
                  ទីតាំងផែនទី
                </label>

                <div className="relative">
                  <input type="url" value={form.mapLink} onChange={(event) => setValue("mapLink", event.target.value)} placeholder={form.mapLink ? "" : "បញ្ចូល Google Maps link"} className="h-[34px] w-full rounded-lg border border-border bg-white pl-4 pr-11 text-sm outline-none transition focus:border-secondary" />

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
                  onChange={(value) => setValue("address", value)}
                  placeholder="ភូមិ, ឃុំ, ស្រុក, ខេត្ត..."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white p-5">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
            <PencilLine size={18} />
            ព័ត៌មានបន្ថែម
          </h2>

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
              onChange={(value) => setValue("status", value)}
              placeholder="ជ្រើសរើសស្ថានភាពកម្មវិធី"
              options={statusOptions}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
            {isEditMode ? (
              <Link href={`/activity/${editId}/participants`} className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90">
                សមាសភាពចូលរួម
              </Link>
            ) : (
              <button type="button" onClick={() => setShowMemberModal(true)} className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90">
                ជ្រើសរើសសមាសភាព
              </button>
            )}

            <Link
              href={isEditMode ? `/activity/create/income?activityId=${editId}` : "/activity/create/income"}
              onClick={() => {
                if (!isEditMode) updateDraft({ form, activityImages, activityDocuments, selectedMemberIds });
              }}
              className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90"
            >
              ចំណូល
            </Link>

            <Link
              href={isEditMode ? `/activity/create/expense?activityId=${editId}` : "/activity/create/expense"}
              onClick={() => {
                if (!isEditMode) updateDraft({ form, activityImages, activityDocuments, selectedMemberIds });
              }}
              className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90"
            >
              ចំណាយ
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white p-5">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
            <Paperclip size={18} />
            រូបភាព និងឯកសារ
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

            <MultipleFileUpload
              label="ឯកសារផ្សេងៗ"
              files={activityDocuments}
              onChange={setActivityDocuments}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              uploadText="បញ្ចូលឯកសារ"
              helperText="PDF, DOC, DOCX, XLS, XLSX — អតិបរមា 5MB"
              maxSize={MAX_DOCUMENT_SIZE}
              kind="file"
            />
          </div>
        </section>

        {isEditMode &&
          editingActivity?.documents?.length > 0 && (
            <section className="rounded-xl border border-border bg-white p-5">
              <h3 className="mb-4 text-base font-bold text-secondary">
                ឯកសារដែលមានស្រាប់
              </h3>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {editingActivity.documents.map(
                  (document, index) => (
                    <div key={`${document.name}-${index}`} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${document.type === "pdf" ? "bg-error-bg text-error" : "bg-secondary-light text-secondary"}`}>
                          <FileText size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-primary">
                            {document.name}
                          </p>

                          <p className="text-xs text-text-secondary">
                            {document.size}
                          </p>
                        </div>
                      </div>

                      <button type="button" className="ml-3 shrink-0 rounded-md p-1.5 text-primary transition hover:bg-primary/10" aria-label={`មើល ${document.name}`}>
                        <Eye size={17} />
                      </button>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

        <div className="flex items-center justify-between gap-3">
          <FormActionButton
            action="cancel"
            onClick={handleCancel}
            disabled={isSaving}
          />

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
        </div>
      </form>

      {showMemberModal && (
        <MemberSelectModal
          onClose={() => setShowMemberModal(false)}
          initialSelected={selectedMemberIds}
          onSave={setSelectedMemberIds}
        />
      )}
    </>
  );
}
