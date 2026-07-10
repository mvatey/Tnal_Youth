"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Eye,
  FileText,
  Info,
  Link2,
  MapPin,
  PencilLine,
  Upload,
} from "lucide-react";

import FormField from "@/components/forms/FormField";
import FormSelect from "@/components/forms/FormSelect";
import DateInput from "@/components/forms/DateInput";
import MemberSelectModal from "@/components/activity/MemberSelectModal";

import activities from "@/data/activity.json";

function convertToDate(dateValue) {
  if (!dateValue) return null;

  const date = new Date(dateValue);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getActivityLocation(location) {
  if (!location) return "";

  if (typeof location === "string") {
    return location;
  }

  return location.name || location.city || "";
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
      additionalBranch: "",
      status: "",
    };
  }

  return {
    name: activity.name || "",
    branch: activity.branch || "",
    type: activity.type || "",
    sector: activity.sector || "",
    visibility: activity.visibility || "សាធារណៈ",

    description:
      activity.descriptionDetail ||
      activity.description ||
      "",

    startDate: convertToDate(
      activity.startDateISO || activity.startDate
    ),

    endDate: convertToDate(
      activity.endDateISO || activity.endDate
    ),

    startTime:
      activity.startTime24 ||
      activity.startTime ||
      "",

    endTime:
      activity.endTime24 ||
      activity.endTime ||
      "",

    location: getActivityLocation(activity.location),

    mapLink: activity.mapLink || "",
    address: activity.address || "",

    additionalBranch:
      activity.additionalBranch ||
      activity.branch2 ||
      activity.branch ||
      "",

    status:
      activity.status ||
      activity.status2 ||
      "",
  };
}

function formatDate(date) {
  if (!date) return "";

  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date.toISOString();
  }

  return date;
}

export default function CreateActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editId = searchParams.get("edit");

  const editingActivity = editId
    ? activities.find(
        (activity) =>
          String(activity.id) === String(editId)
      )
    : null;

  const isEditMode = Boolean(editingActivity);

  const [form, setForm] = useState(() =>
    createInitialForm(editingActivity)
  );

  const [showMemberModal, setShowMemberModal] =
    useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const setValue = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    if (isEditMode && editId) {
      router.push(`/activity/${editId}`);
      return;
    }

    router.push("/activity");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("សូមបញ្ចូលឈ្មោះកម្មវិធី");
      return;
    }

    if (!form.branch) {
      alert("សូមជ្រើសរើសសាខា");
      return;
    }

    if (!form.type) {
      alert("សូមជ្រើសរើសប្រភេទកម្មវិធី");
      return;
    }

    setIsSaving(true);

    try {
      const activityData = {
        ...editingActivity,
        ...form,

        id: isEditMode
          ? editingActivity.id
          : Date.now(),

        descriptionDetail: form.description,

        startDateISO: formatDate(form.startDate),
        endDateISO: formatDate(form.endDate),

        startTime24: form.startTime,
        endTime24: form.endTime,

        branch2: form.additionalBranch,
        status: form.status,

        updatedAt: new Date().toISOString(),
      };

      const storedActivities = JSON.parse(
        localStorage.getItem("activities") || "[]"
      );

      let newActivities;

      if (isEditMode) {
        const savedActivityExists =
          storedActivities.some(
            (activity) =>
              String(activity.id) === String(editId)
          );

        if (savedActivityExists) {
          newActivities = storedActivities.map(
            (activity) =>
              String(activity.id) === String(editId)
                ? activityData
                : activity
          );
        } else {
          newActivities = [
            ...storedActivities,
            activityData,
          ];
        }
      } else {
        newActivities = [
          ...storedActivities,
          activityData,
        ];
      }

      localStorage.setItem(
        "activities",
        JSON.stringify(newActivities)
      );

      alert(
        isEditMode
          ? "បានកែប្រែកម្មវិធីដោយជោគជ័យ"
          : "បានបង្កើតកម្មវិធីដោយជោគជ័យ"
      );

      if (isEditMode) {
        router.push(`/activity/${editId}`);
      } else {
        router.push("/activity");
      }

      router.refresh();
    } catch (error) {
      console.error("Save activity error:", error);
      alert("មិនអាចរក្សាទុកកម្មវិធីបានទេ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSave}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-1 text-sm">
            <Link
              href="/activity"
              className="text-text-secondary transition hover:text-primary"
            >
              កម្មវិធី
            </Link>

            <ChevronRight
              size={14}
              className="shrink-0 text-text-secondary"
            />

            {isEditMode && (
              <>
                <Link
                  href={`/activity/${editId}`}
                  className="max-w-[250px] truncate text-text-secondary transition hover:text-primary"
                >
                  {editingActivity.name ||
                    "ព័ត៌មានកម្មវិធី"}
                </Link>

                <ChevronRight
                  size={14}
                  className="shrink-0 text-text-secondary"
                />
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

          <p className="mt-1 text-sm text-text-secondary">
            {isEditMode
              ? "កែប្រែព័ត៌មានកម្មវិធី"
              : "បំពេញព័ត៌មានកម្មវិធី"}
          </p>
        </div>

        {/* Activity information */}
        <section className="rounded-xl border border-border bg-white p-5">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
            <Info size={18} />
            ព័ត៌មានកម្មវិធី
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <FormField
                label="ឈ្មោះកម្មវិធី"
                value={form.name}
                onChange={(value) =>
                  setValue("name", value)
                }
                placeholder="កម្មវិធីដាំដើមឈើ"
              />

              <FormSelect
                label="សាខា"
                value={form.branch}
                onChange={(value) =>
                  setValue("branch", value)
                }
                placeholder="ជ្រើសរើសសាខា"
                options={["ភ្នំពេញ", "កណ្ដាល"]}
              />

              <FormSelect
                label="ប្រភេទកម្មវិធី"
                value={form.type}
                onChange={(value) =>
                  setValue("type", value)
                }
                placeholder="ជ្រើសរើសប្រភេទ"
                options={[
                  "កម្មវិធីផ្ទៃក្នុង",
                  "កម្មវិធីខាងក្រៅ",
                ]}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormSelect
                label="វិស័យ"
                value={form.sector}
                onChange={(value) =>
                  setValue("sector", value)
                }
                placeholder="ជ្រើសរើសវិស័យ"
                options={[
                  "បរិស្ថាន",
                  "អប់រំ",
                  "សង្គម",
                  "បច្ចេកវិទ្យា",
                ]}
              />

              <FormSelect
                label="ការផ្សព្វផ្សាយ"
                value={form.visibility}
                onChange={(value) =>
                  setValue("visibility", value)
                }
                placeholder="ជ្រើសរើសការផ្សព្វផ្សាយ"
                options={["សាធារណៈ", "ឯកជន"]}
              />
            </div>
          </div>

          <div className="mt-5">
            <FormField label="ការពិពណ៌នា">
              <textarea
                value={form.description}
                onChange={(event) =>
                  setValue(
                    "description",
                    event.target.value
                  )
                }
                placeholder="ពិពណ៌នាអំពីកម្មវិធី..."
                className="h-32 w-full resize-none rounded-lg border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-secondary"
              />
            </FormField>
          </div>
        </section>

        {/* Date and location */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
              <CalendarDays size={18} />
              កាលបរិច្ឆេទ និង ពេលវេលា
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <DateInput
                label="កាលបរិច្ឆេទចាប់ផ្តើម"
                value={form.startDate}
                onChange={(date) =>
                  setValue("startDate", date)
                }
              />

              <DateInput
                label="កាលបរិច្ឆេទបញ្ចប់"
                value={form.endDate}
                onChange={(date) =>
                  setValue("endDate", date)
                }
              />

              <FormField
                label="ពេលវេលាចាប់ផ្តើម"
                type="time"
                value={form.startTime}
                onChange={(value) =>
                  setValue("startTime", value)
                }
              />

              <FormField
                label="ពេលវេលាបញ្ចប់"
                type="time"
                value={form.endTime}
                onChange={(value) =>
                  setValue("endTime", value)
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
              <MapPin size={18} />
              ទីតាំង
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormSelect
                label="ទីតាំងកម្មវិធី"
                value={form.location}
                onChange={(value) =>
                  setValue("location", value)
                }
                placeholder="ជ្រើសរើសទីតាំង"
                options={[
                  "សាលាបឋមសិក្សា",
                  "សាលប្រជុំធំ",
                  "មជ្ឈមណ្ឌលសហគមន៍",
                ]}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  ទីតាំងផែនទី
                </label>

                <div className="relative">
                  <input
                    type="url"
                    value={form.mapLink}
                    onChange={(event) =>
                      setValue(
                        "mapLink",
                        event.target.value
                      )
                    }
                    placeholder="បញ្ចូល Google Maps link"
                    className="h-11 w-full rounded-lg border border-border bg-white pl-4 pr-11 text-sm outline-none transition focus:border-secondary"
                  />

                  {form.mapLink ? (
                    <a
                      href={form.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary transition hover:text-primary"
                    >
                      <Link2 size={18} />
                    </a>
                  ) : (
                    <Link2
                      size={18}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                    />
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <FormField
                  label="អាសយដ្ឋានលម្អិត"
                  value={form.address}
                  onChange={(value) =>
                    setValue("address", value)
                  }
                  placeholder="ភូមិ, ឃុំ, ស្រុក, ខេត្ត..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Additional information */}
        <section className="rounded-xl border border-border bg-white p-5">
          <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-secondary">
            <PencilLine size={18} />
            ព័ត៌មានបន្ថែម
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormSelect
              label="សាខា"
              value={form.additionalBranch}
              onChange={(value) =>
                setValue("additionalBranch", value)
              }
              placeholder="ជ្រើសរើសសាខា"
              options={["ភ្នំពេញ", "កណ្ដាល"]}
            />

            <FormSelect
              label="ស្ថានភាព"
              value={form.status}
              onChange={(value) =>
                setValue("status", value)
              }
              placeholder="ជ្រើសរើសស្ថានភាពកម្មវិធី"
              options={[
                "ឆាប់ៗនេះ",
                "កំពុងដំណើរការ",
                "បានបញ្ចប់",
              ]}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
            {isEditMode ? (
              <Link
                href={`/activity/${editId}/participants`}
                className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90"
              >
                សមាជិកចូលរួម
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setShowMemberModal(true)
                }
                className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90"
              >
                សមាជិកចូលរួម
              </button>
            )}

            <Link
              href={
                isEditMode
                  ? `/activity/create/income?activityId=${editId}`
                  : "/activity/create/income"
              }
              className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90"
            >
              ចំណូល
            </Link>

            <Link
              href={
                isEditMode
                  ? `/activity/create/expense?activityId=${editId}`
                  : "/activity/create/expense"
              }
              className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:opacity-90"
            >
              ចំណាយ
            </Link>
          </div>
        </section>

        {/* Documents */}
        {isEditMode &&
          editingActivity.documents?.length > 0 && (
            <section className="rounded-xl border border-border bg-white p-5">
              <h3 className="mb-4 text-base font-bold text-secondary">
                ឯកសារដែលមានស្រាប់
              </h3>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {editingActivity.documents.map(
                  (document, index) => (
                    <div
                      key={`${document.name}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            document.type === "pdf"
                              ? "bg-error-bg text-error"
                              : "bg-secondary-light text-secondary"
                          }`}
                        >
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

                      <button
                        type="button"
                        className="ml-3 shrink-0 text-primary"
                      >
                        <Eye size={17} />
                      </button>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex h-11 w-full items-center justify-center rounded-lg border border-border bg-white text-sm font-semibold text-text-secondary transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-32"
          >
            បោះបង់
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-secondary text-sm font-semibold text-white transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-44"
          >
            <Upload size={17} />

            {isSaving
              ? "កំពុងរក្សាទុក..."
              : isEditMode
                ? "រក្សាទុកការកែប្រែ"
                : "រក្សាទុក"}
          </button>
        </div>
      </form>

      {showMemberModal && (
        <MemberSelectModal
          onClose={() => setShowMemberModal(false)}
        />
      )}
    </>
  );
}