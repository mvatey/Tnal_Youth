"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  Building2,
  Mail,
  MapPin,
  Navigation,
  Phone,
  X,
} from "lucide-react";

import { HiSaveAs } from "react-icons/hi";

import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";

const EMPTY_FORM = {
  nameKm: "",
  nameEn: "",
  branchLevelId: "",
  provinceId: "",
  districtId: "",
  communeId: "",
  address: "",
  googleMapUrl: "",
  phone: "",
  email: "",
  statusId: "",
  branchLeaderId: "",
};

const LEVEL_OPTIONS = [
  {
    label: "រាជធានី/ខេត្ត",
    value: "1",
  },
  {
    label: "ក្រុង/ស្រុក/ខណ្ឌ",
    value: "2",
  },
  {
    label: "ឃុំ/សង្កាត់",
    value: "3",
  },
];

async function requestJson(
  path,
  {
    method = "GET",
    body,
    signal,
  } = {},
) {
  const response = await fetch(
    `/api${path}`,
    {
      method,
      headers: {
        Accept: "application/json",

        ...(body
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),
      },

      body: body
        ? JSON.stringify(body)
        : undefined,

      cache: "no-store",
      signal,
    },
  );

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
          responseBody?.detail ||
          responseBody?.error ||
          responseBody?.title
        : responseBody;

        console.error("API request failed:", {
          path,
          status: response.status,
          body: responseBody,
        });

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return responseBody;
}

function getLocationLabel(item) {
  return (
    item?.name_km ||
    item?.nameKm ||
    item?.label_km ||
    item?.labelKm ||
    item?.name_en ||
    item?.nameEn ||
    item?.label_en ||
    item?.labelEn ||
    item?.label ||
    item?.code ||
    "-"
  );
}

function getStatusLabel(item) {
  return (
    item?.name_km ||
    item?.nameKm ||
    item?.label_km ||
    item?.labelKm ||
    item?.name_en ||
    item?.nameEn ||
    item?.label_en ||
    item?.labelEn ||
    item?.code ||
    "-"
  );
}

function toLocationOptions(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    label: getLocationLabel(item),
    value: String(item?.id ?? ""),
  }));
}

function toStatusOptions(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    label: getStatusLabel(item),
    value: String(item?.id ?? ""),
  }));
}

function getInitialForm(branch) {
  if (!branch) {
    return EMPTY_FORM;
  }

  return {
    nameKm:
      branch?.nameKm ||
      branch?.name_km ||
      branch?.name ||
      "",

    nameEn:
      branch?.nameEn ||
      branch?.name_en ||
      "",

    branchLevelId: String(
      branch?.branchLevelId ??
        branch?.branch_level_id ??
        "",
    ),

    provinceId: String(
      branch?.provinceId ??
        branch?.province_id ??
        "",
    ),

    districtId: String(
      branch?.districtId ??
        branch?.district_id ??
        "",
    ),

    communeId: String(
      branch?.communeId ??
        branch?.commune_id ??
        "",
    ),

    address:
      branch?.address ||
      branch?.addressLine ||
      "",

    googleMapUrl:
      branch?.googleMapUrl ||
      branch?.google_map_url ||
      "",

    phone:
      branch?.phone || "",

    email:
      branch?.email || "",

    statusId: String(
      branch?.statusId ??
        branch?.status_id ??
        "",
    ),

    branchLeaderId: String(
      branch?.leader?.id ??
        branch?.branchLeaderId ??
        "",
    ),
  };
}


export default function CreateBranchModal({
  open,
  onClose,
  onSave,
  initialData = null,
  leaderOptions = [],
}) {
  const isEditMode =
    Boolean(initialData?.id);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [provinceOptions, setProvinceOptions] =
    useState([]);

  const [districtOptions, setDistrictOptions] =
    useState([]);

  const [communeOptions, setCommuneOptions] =
    useState([]);

  const [statusOptions, setStatusOptions] =
    useState([]);

  const [error, setError] =
    useState("");

  const [isLoadingLookups, setIsLoadingLookups] =
    useState(false);

  const [isLoadingDistricts, setIsLoadingDistricts] =
    useState(false);

  const [isLoadingCommunes, setIsLoadingCommunes] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const [modalRoot, setModalRoot] =
    useState(null);

  const showDistrict =
    form.branchLevelId === "2" ||
    form.branchLevelId === "3";

  const showCommune =
    form.branchLevelId === "3";

  const branchLeaderOptions =
    useMemo(
      () => [
        {
          label:
            "មិនទាន់កំណត់ប្រធានសាខា",
          value: "",
        },
        ...leaderOptions,
      ],
      [leaderOptions],
    );

  useEffect(() => {
    setMounted(true);

    setModalRoot(
      document.getElementById(
        "branch-modal-root",
      ),
    );
  }, []);

  /*
   * Load provinces and branch statuses
   * whenever the modal opens.
   */
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const controller =
      new AbortController();

    async function loadInitialLookups() {
  setIsLoadingLookups(true);
  setError("");

  const initialForm =
    getInitialForm(initialData);

  try {
    const provinces =
      await requestJson(
        "/lookups/provinces",
        {
          signal:
            controller.signal,
        },
      );

    console.log(
      "Province lookup response:",
      provinces,
    );

    setProvinceOptions(
      toLocationOptions(provinces),
    );
  } catch (provinceError) {
    if (
      provinceError.name !==
      "AbortError"
    ) {
      console.error(
        "Province lookup failed:",
        provinceError,
      );

      setProvinceOptions([]);

      setError(
        `ខេត្ត: ${provinceError.message}`,
      );
    }
  }

  try {
    const statuses =
      await requestJson(
        "/lookups/branch-statuses",
        {
          signal:
            controller.signal,
        },
      );

    console.log(
      "Branch status lookup response:",
      statuses,
    );

    setStatusOptions(
      toStatusOptions(statuses),
    );

    if (
      !isEditMode &&
      !initialForm.statusId &&
      Array.isArray(statuses) &&
      statuses.length > 0
    ) {
      const activeStatus =
        statuses.find(
          (status) =>
            String(
              status?.code || "",
            ).toUpperCase() ===
            "ACTIVE",
        );

      initialForm.statusId =
        String(
          activeStatus?.id ??
            statuses[0]?.id ??
            "",
        );
    }
  } catch (statusError) {
    if (
      statusError.name !==
      "AbortError"
    ) {
      console.error(
        "Branch status lookup failed:",
        statusError,
      );

      setStatusOptions([]);

      setError((previous) => {
        const statusMessage =
          `ស្ថានភាព: ${statusError.message}`;

        return previous
          ? `${previous} | ${statusMessage}`
          : statusMessage;
      });
    }
  } finally {
    if (
      !controller.signal.aborted
    ) {
      setForm(initialForm);
      setIsLoadingLookups(false);
    }
  }
}

    loadInitialLookups();

    const handleEscape = (
      event,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      controller.abort();

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    open,
    initialData,
    isEditMode,
    onClose,
  ]);

  /*
   * Load districts after province changes.
   */
  useEffect(() => {
    if (
      !open ||
      !form.provinceId ||
      !showDistrict
    ) {
      setDistrictOptions([]);

      return undefined;
    }

    const controller =
      new AbortController();

    async function loadDistricts() {
      setIsLoadingDistricts(true);

      try {
        const districts =
          await requestJson(
            `/lookups/districts?provinceId=${encodeURIComponent(
              form.provinceId,
            )}`,
            {
              signal:
                controller.signal,
            },
          );

        setDistrictOptions(
          toLocationOptions(
            districts,
          ),
        );
      } catch (districtError) {
        if (
          districtError.name !==
          "AbortError"
        ) {
          console.error(
            "Failed to load districts:",
            districtError,
          );

          setDistrictOptions([]);

          setError(
            districtError.message ||
              "មិនអាចទាញយកក្រុង/ស្រុក/ខណ្ឌបានទេ",
          );
        }
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setIsLoadingDistricts(false);
        }
      }
    }

    loadDistricts();

    return () => {
      controller.abort();
    };
  }, [
    open,
    form.provinceId,
    showDistrict,
  ]);

  /*
   * Load communes after district changes.
   */
  useEffect(() => {
    if (
      !open ||
      !form.districtId ||
      !showCommune
    ) {
      setCommuneOptions([]);

      return undefined;
    }

    const controller =
      new AbortController();

    async function loadCommunes() {
      setIsLoadingCommunes(true);

      try {
        const communes =
          await requestJson(
            `/lookups/communes?districtId=${encodeURIComponent(
              form.districtId,
            )}`,
            {
              signal:
                controller.signal,
            },
          );

        setCommuneOptions(
          toLocationOptions(
            communes,
          ),
        );
      } catch (communeError) {
        if (
          communeError.name !==
          "AbortError"
        ) {
          console.error(
            "Failed to load communes:",
            communeError,
          );

          setCommuneOptions([]);

          setError(
            communeError.message ||
              "មិនអាចទាញយកឃុំ/សង្កាត់បានទេ",
          );
        }
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setIsLoadingCommunes(false);
        }
      }
    }

    loadCommunes();

    return () => {
      controller.abort();
    };
  }, [
    open,
    form.districtId,
    showCommune,
  ]);

  const updateField =
    (field) => (event) => {
      const value =
        event?.target?.value ??
        event ??
        "";

      setForm((previous) => {
        const next = {
          ...previous,
          [field]: value,
        };

        if (
          field ===
          "branchLevelId"
        ) {
          if (value === "1") {
            next.districtId = "";
            next.communeId = "";
          }

          if (value === "2") {
            next.communeId = "";
          }
        }

        if (
          field === "provinceId"
        ) {
          next.districtId = "";
          next.communeId = "";
        }

        if (
          field === "districtId"
        ) {
          next.communeId = "";
        }

        return next;
      });

      setError("");
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!form.nameKm.trim()) {
        setError(
          "សូមបញ្ចូលឈ្មោះសាខា",
        );

        return;
      }

      if (!form.branchLevelId) {
        setError(
          "សូមជ្រើសរើសកម្រិតសាខា",
        );

        return;
      }

      if (!form.provinceId) {
        setError(
          "សូមជ្រើសរើសរាជធានី/ខេត្ត",
        );

        return;
      }

      if (
        showDistrict &&
        !form.districtId
      ) {
        setError(
          "សូមជ្រើសរើសក្រុង/ស្រុក/ខណ្ឌ",
        );

        return;
      }

      if (
        showCommune &&
        !form.communeId
      ) {
        setError(
          "សូមជ្រើសរើសឃុំ/សង្កាត់",
        );

        return;
      }

      if (!form.statusId) {
        setError(
          "សូមជ្រើសរើសស្ថានភាព",
        );

        return;
      }

      setIsSubmitting(true);
      setError("");

      /*
       * This payload follows the field names
       * already returned by the branch APIs.
       */
      const payload = {
        name_km:
          form.nameKm.trim(),

        name_en:
          form.nameEn.trim() ||
          null,

        branch_level_id:
          Number(
            form.branchLevelId,
          ),

        province_id:
          Number(form.provinceId),

        district_id:
          showDistrict
            ? Number(
                form.districtId,
              )
            : null,

        commune_id:
          showCommune
            ? Number(
                form.communeId,
              )
            : null,

        address:
          form.address.trim() ||
          null,

        google_map_url:
          form.googleMapUrl.trim() ||
          null,

        phone:
          form.phone.trim() ||
          null,

        email:
          form.email.trim() ||
          null,

        status_id:
          Number(form.statusId),
      };


try {
  let savedBranch;

  if (isEditMode) {
    savedBranch =
      await requestJson(
        `/branches/${initialData.id}`,
        {
          method: "PUT",
          body: payload,
        },
      );

    /*
     * Assign the selected candidate
     * using the dedicated endpoint.
     */
        if (form.branchLeaderId) {
          await requestJson(
            `/branches/${initialData.id}/leader`,
            {
              method: "PUT",
              body: {
                member_id:
                  Number(
                    form.branchLeaderId,
                  ),
              },
            },
          );
        }
      } else {
        savedBranch =
          await requestJson(
            "/branches",
            {
              method: "POST",
              body: payload,
            },
          );
      }

      await onSave?.(
        savedBranch ||
          payload,
      );

      onClose();
    } catch (submitError) {
      console.error(
        "Failed to save branch:",
        submitError,
      );

      setError(
        submitError.message ||
          "មិនអាចរក្សាទុកព័ត៌មានសាខាបានទេ",
      );
    } finally {
      setIsSubmitting(false);
    }
    };

  if (
    !mounted ||
    !open ||
    !modalRoot
  ) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-auto absolute inset-0 flex items-start justify-center overflow-y-auto bg-black/45 p-4 pt-8 lg:pt-12"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="branch-modal-title"
        className="no-scrollbar max-h-[calc(100vh-4rem)] w-full max-w-[720px] overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-start justify-between px-7 pb-3 pt-6">
            <h2
              id="branch-modal-title"
              className="text-xl font-bold text-secondary"
            >
              {isEditMode
                ? "កែប្រែព័ត៌មានសាខា"
                : "បង្កើតសាខា"}
            </h2>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:bg-gray-100 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="បិទ"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-5 px-7 pb-7">
            {isLoadingLookups && (
              <p className="text-sm text-text-secondary">
                កំពុងទាញយកទិន្នន័យ...
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BoxFill
                label="ឈ្មោះសាខា"
                name="nameKm"
                value={form.nameKm}
                onChange={updateField(
                  "nameKm",
                )}
                placeholder="បញ្ចូលឈ្មោះសាខា"
                leadingIcon={
                  <Building2 size={16} />
                }
              />

              <BoxFill
                label="ឈ្មោះជាអក្សរឡាតាំង"
                name="nameEn"
                value={form.nameEn}
                onChange={updateField(
                  "nameEn",
                )}
                placeholder="បញ្ចូលឈ្មោះសាខា"
                leadingIcon={
                  <Building2 size={16} />
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormSelect
                label="កម្រិតសាខា"
                name="branchLevelId"
                value={
                  form.branchLevelId
                }
                onChange={updateField(
                  "branchLevelId",
                )}
                placeholder="ជ្រើសរើសកម្រិត"
                options={LEVEL_OPTIONS}
              />

              <FormSelect
                label="រាជធានី/ខេត្ត"
                name="provinceId"
                value={
                  form.provinceId
                }
                onChange={updateField(
                  "provinceId",
                )}
                placeholder="ជ្រើសរើសរាជធានី/ខេត្ត"
                options={
                  provinceOptions
                }
                disabled={
                  isLoadingLookups
                }
              />

              {showDistrict && (
                <FormSelect
                  label="ក្រុង/ស្រុក/ខណ្ឌ"
                  name="districtId"
                  value={
                    form.districtId
                  }
                  onChange={updateField(
                    "districtId",
                  )}
                  placeholder={
                    isLoadingDistricts
                      ? "កំពុងទាញយក..."
                      : "ជ្រើសរើសក្រុង/ស្រុក/ខណ្ឌ"
                  }
                  options={
                    districtOptions
                  }
                  disabled={
                    !form.provinceId ||
                    isLoadingDistricts
                  }
                />
              )}

              {showCommune && (
                <FormSelect
                  label="ឃុំ/សង្កាត់"
                  name="communeId"
                  value={
                    form.communeId
                  }
                  onChange={updateField(
                    "communeId",
                  )}
                  placeholder={
                    isLoadingCommunes
                      ? "កំពុងទាញយក..."
                      : "ជ្រើសរើសឃុំ/សង្កាត់"
                  }
                  options={
                    communeOptions
                  }
                  disabled={
                    !form.districtId ||
                    isLoadingCommunes
                  }
                />
              )}
            </div>

            <BoxFill
              label="អាសយដ្ឋានលម្អិត"
              name="address"
              value={form.address}
              onChange={updateField(
                "address",
              )}
              placeholder="ឧ. អគារលេខ ផ្លូវ ភូមិ..."
              leadingIcon={
                <MapPin size={16} />
              }
            />

            <div className="flex items-end gap-3">
              <div className="min-w-0 flex-1">
                <BoxFill
                  label="តំណភ្ជាប់ទីតាំង"
                  name="googleMapUrl"
                  value={
                    form.googleMapUrl
                  }
                  onChange={updateField(
                    "googleMapUrl",
                  )}
                  placeholder="បញ្ចូលតំណ Google Maps"
                  leadingIcon={
                    <Navigation
                      size={16}
                    />
                  }
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const url =
                    form.googleMapUrl.trim();

                  if (!url) {
                    setError(
                      "សូមបញ្ចូលតំណ Google Maps",
                    );

                    return;
                  }

                  window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
                className="mb-[1px] flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-success px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Navigation size={15} />

                ទីតាំង
              </button>
            </div>

            <BoxFill
              label="លេខទូរស័ព្ទ"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={updateField(
                "phone",
              )}
              placeholder="បញ្ចូលលេខទូរស័ព្ទ"
              leadingIcon={
                <Phone size={16} />
              }
            />

            <BoxFill
              label="អ៊ីម៉ែល"
              type="email"
              name="email"
              value={form.email}
              onChange={updateField(
                "email",
              )}
              placeholder="បញ្ចូលអ៊ីម៉ែល"
              leadingIcon={
                <Mail size={16} />
              }
            />

            <FormSelect
              label="ស្ថានភាព"
              name="statusId"
              value={form.statusId}
              onChange={updateField(
                "statusId",
              )}
              placeholder="ជ្រើសរើសស្ថានភាព"
              options={statusOptions}
              disabled={isLoadingLookups}
            />

            {isEditMode && (
              <div className="space-y-2 rounded-xl border border-border bg-gray-50 p-4">
                <FormSelect
                  label="ប្រធានសាខា"
                  name="branchLeaderId"
                  value={
                    form.branchLeaderId
                  }
                  onChange={updateField(
                    "branchLeaderId",
                  )}
                  placeholder="ជ្រើសរើសប្រធានសាខា"
                  options={
                    branchLeaderOptions
                  }
                />

                <p className="text-xs text-text-secondary">
                  អាចជ្រើសរើសបានតែសមាជិកដែលស្ថិតនៅក្នុងសាខានេះ។
                </p>

                {leaderOptions.length ===
                  0 && (
                  <p className="text-xs font-medium text-warning">
                    មិនទាន់មានសមាជិកដែលអាចជ្រើសរើសជាប្រធានសាខាបានទេ។
                  </p>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-error">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex h-10 w-[110px] shrink-0 items-center justify-center rounded-lg border border-border bg-white px-5 text-sm font-semibold text-text-secondary transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                បោះបង់
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isLoadingLookups
                }
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HiSaveAs size={18} />

                {isSubmitting
                  ? "កំពុងរក្សាទុក..."
                  : isEditMode
                    ? "រក្សាទុកការកែប្រែ"
                    : "រក្សាទុក"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    modalRoot,
  );
}
