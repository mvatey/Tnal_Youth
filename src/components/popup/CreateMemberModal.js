"use client";

import {
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { HiSaveAs } from "react-icons/hi";

import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";

const EMPTY_FORM = {
  fullNameKm: "",
  fullNameEn: "",
  gender: "",
  statusId: "",
  phone: "",
  email: "",
  branchId: "",
  dateOfBirth: "",
  joinedOn: "",
  levelId: "",
};

async function parseJsonSafely(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

function normalizeOptions(
  items,
  {
    valueKey = "id",
    labelKey = "label_km",
  } = {}
) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    if (
      typeof item === "string" ||
      typeof item === "number"
    ) {
      return {
        label: String(item),
        value: item,
      };
    }

    return {
      label:
        item.label ??
        item[labelKey] ??
        item.labelKm ??
        item.name_km ??
        item.nameKm ??
        String(item[valueKey] ?? ""),

      value:
        item.value ??
        item[valueKey],
    };
  });
}

export default function CreateMemberModal({
  open,
  onClose,
  onSave,

  branches = [],
  statuses = [],
  levels = [],
  genders = [
    {
      label: "ប្រុស",
      value: "MALE",
    },
    {
      label: "ស្រី",
      value: "FEMALE",
    },
    {
      label: "ផ្សេងៗ",
      value: "OTHER",
    },
  ],
}) {
  const [mounted, setMounted] =
    useState(false);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  const [
    createdResult,
    setCreatedResult,
  ] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    setForm(EMPTY_FORM);
    setSubmitError("");
    setCreatedResult(null);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  const branchOptions =
    normalizeOptions(branches, {
      valueKey: "id",
      labelKey: "name_km",
    });

  const statusOptions =
    normalizeOptions(statuses, {
      valueKey: "id",
      labelKey: "label_km",
    });

  const levelOptions =
    normalizeOptions(levels, {
      valueKey: "id",
      labelKey: "label_km",
    });

  const genderOptions =
    normalizeOptions(genders, {
      valueKey: "value",
      labelKey: "label",
    });

  function update(field) {
    return (event) => {
      setForm((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));

      setSubmitError("");
    };
  }

  function validateForm() {
    if (!form.fullNameKm.trim()) {
      return "សូមបញ្ចូលឈ្មោះជាភាសាខ្មែរ";
    }

    if (!form.gender) {
      return "សូមជ្រើសរើសភេទ";
    }

    if (!form.statusId) {
      return "សូមជ្រើសរើសស្ថានភាព";
    }

    if (!form.phone.trim()) {
      return "សូមបញ្ចូលលេខទូរស័ព្ទ";
    }

    if (!form.branchId) {
      return "សូមជ្រើសរើសសាខា";
    }

    return null;
  }

  async function submit(event) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    const payload = {
      full_name_km:
        form.fullNameKm.trim(),

      full_name_en:
        form.fullNameEn.trim() || null,

      branch_id:
        Number(form.branchId),

      status_id:
        Number(form.statusId),

      level_id:
        form.levelId
          ? Number(form.levelId)
          : null,

      religion_id: null,

      nationality_id: null,

      gender: form.gender,

      date_of_birth:
        form.dateOfBirth || null,

      place_of_birth: null,

      phone:
        form.phone.trim(),

      email:
        form.email.trim() || null,

      current_address: null,

      permanent_address: null,

      profile_photo_id: null,

      cv_file_id: null,

      joined_on:
        form.joinedOn || null,

      bio: null,
    };

    try {
      setSubmitting(true);
      setSubmitError("");
      setCreatedResult(null);

      const createResponse =
        await fetch("/api/members", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

      const createResult =
        await parseJsonSafely(
          createResponse
        );

      if (!createResponse.ok) {
        throw new Error(
          createResult?.message ??
            createResult?.error ??
            "មិនអាចបង្កើតសមាជិកបានទេ"
        );
      }

      const createdMember =
        createResult?.data ??
        createResult;

      const memberId =
        createdMember?.id;

      if (!memberId) {
        throw new Error(
          "Member was created, but the API did not return its ID."
        );
      }

      const accountResponse =
        await fetch(
          `/api/members/${memberId}/account/status`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

      const accountResult =
        await parseJsonSafely(
          accountResponse
        );

      if (!accountResponse.ok) {
        throw new Error(
          accountResult?.message ??
            "Member created, but account status could not be loaded."
        );
      }

      setCreatedResult({
        member: createdMember,
        account: accountResult,
      });

      onSave?.({
        member: createdMember,
        account: accountResult,
      });

      /*
       * Keep modal open while testing activation.
       * Later, you can close it here:
       *
       * onClose?.();
       */
    } catch (error) {
      console.error(
        "Create member error:",
        error
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : "មិនអាចបង្កើតសមាជិកបានទេ"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/40"
      onClick={onClose}
    >
      <div className="fixed bottom-0 left-0 right-0 top-[72px] flex items-center justify-center p-4 lg:left-[365px] lg:p-6">
        <div
          className="flex max-h-[calc(100vh-120px)] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold text-primary">
              បង្កើតសមាជិកថ្មី
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-700 transition hover:bg-gray-100"
              aria-label="បិទផ្ទាំង"
            >
              <X size={20} />
            </button>
          </div>

          <form
            id="create-member-form"
            onSubmit={submit}
            className="min-h-0 flex-1 overflow-y-auto px-6 py-5"
          >
            {submitError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {createdResult && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-4">
                <p className="font-semibold text-green-700">
                  បង្កើតសមាជិក និងគណនីបានជោគជ័យ
                </p>

                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  <p>
                    Member ID:{" "}
                    {
                      createdResult.account
                        ?.member_id
                    }
                  </p>

                  <p>
                    User ID:{" "}
                    {
                      createdResult.account
                        ?.user_id
                    }
                  </p>

                  <p>
                    Has account:{" "}
                    {createdResult.account
                      ?.has_account
                      ? "Yes"
                      : "No"}
                  </p>

                  <p>
                    Activated:{" "}
                    {createdResult.account
                      ?.is_activated
                      ? "Yes"
                      : "No"}
                  </p>

                  <p>
                    Status:{" "}
                    {createdResult.account
                      ?.status ?? "-"}
                  </p>

                  <p>
                    Email:{" "}
                    {createdResult.account
                      ?.email ?? "-"}
                  </p>

                  <p>
                    Phone:{" "}
                    {createdResult.account
                      ?.phone ?? "-"}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <BoxFill
                label="ឈ្មោះជាភាសាខ្មែរ"
                placeholder="បញ្ចូលឈ្មោះ"
                value={form.fullNameKm}
                onChange={update(
                  "fullNameKm"
                )}
              />

              <BoxFill
                label="ឈ្មោះជាអក្សរឡាតាំង"
                placeholder="បញ្ចូលឈ្មោះ"
                value={form.fullNameEn}
                onChange={update(
                  "fullNameEn"
                )}
              />

              <FormSelect
                label="ភេទ"
                type="select"
                placeholder="ជ្រើសរើសភេទ"
                options={genderOptions}
                value={form.gender}
                onChange={update("gender")}
              />

              <FormSelect
                label="ស្ថានភាព"
                type="select"
                placeholder="ជ្រើសរើសស្ថានភាព"
                options={statusOptions}
                value={form.statusId}
                onChange={update(
                  "statusId"
                )}
              />

              <BoxFill
                label="លេខទូរស័ព្ទ"
                placeholder="បញ្ចូលលេខទូរស័ព្ទ"
                value={form.phone}
                onChange={update("phone")}
              />

              <BoxFill
                label="អ៊ីមែល"
                type="email"
                placeholder="បញ្ចូលអ៊ីមែល"
                value={form.email}
                onChange={update("email")}
              />

              <FormSelect
                label="សាខា"
                type="select"
                placeholder="ជ្រើសរើសសាខា"
                options={branchOptions}
                value={form.branchId}
                onChange={update(
                  "branchId"
                )}
              />

              <FormSelect
                label="កម្រិត"
                type="select"
                placeholder="ជ្រើសរើសកម្រិត"
                options={levelOptions}
                value={form.levelId}
                onChange={update(
                  "levelId"
                )}
              />

              <BoxFill
                label="ថ្ងៃខែឆ្នាំកំណើត"
                type="date"
                value={form.dateOfBirth}
                onChange={update(
                  "dateOfBirth"
                )}
              />

              <BoxFill
                label="ថ្ងៃខែឆ្នាំចូលរួម"
                type="date"
                value={form.joinedOn}
                onChange={update(
                  "joinedOn"
                )}
              />
            </div>
          </form>

          <div className="flex shrink-0 items-center gap-3 border-t border-gray-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-60"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              form="create-member-form"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <HiSaveAs size={17} />

              {submitting
                ? "កំពុងរក្សាទុក..."
                : "រក្សាទុក"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}