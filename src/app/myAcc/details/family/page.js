"use client";

import {
  useEffect,
  useState,
} from "react";

import useCurrentMember from "@/hooks/useCurrentMember";
import { useLanguage } from "@/context/LanguageContext";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill";
import FormDate from "@/components/forms/FormDate";
import useUnsavedFormGuard from "@/hooks/useUnsavedFormGuard";

const EMPTY_PERSON = {
  full_name_km: "",
  full_name_en: "",
  date_of_birth: "",
  occupation: "",
  life_status: "",
  address: "",
};

const EMPTY_FAMILY = {
  marital_status: "SINGLE",

  father: {
    ...EMPTY_PERSON,
  },

  mother: {
    ...EMPTY_PERSON,
  },

  spouse: {
    ...EMPTY_PERSON,
  },
};

async function requestJson(
  path,
  options = {},
) {
  const response = await fetch(
    `/api${path}`,
    {
      ...options,

      headers: {
        Accept: "application/json",

        ...(options.body
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),

        ...(options.headers || {}),
      },

      cache: "no-store",
    },
  );

  const text =
    await response.text();

  let body = null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const contentType =
      response.headers.get(
        "content-type",
      ) || "";

    const message =
      typeof body === "object"
        ? body?.message ||
          body?.detail ||
          body?.error ||
          body?.title
        : contentType.includes(
              "application/json",
            )
          ? body
          : null;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

function normalizePerson(
  person,
) {
  return {
    full_name_km:
      person?.full_name_km ||
      person?.fullNameKm ||
      "",

    full_name_en:
      person?.full_name_en ||
      person?.fullNameEn ||
      "",

    date_of_birth:
      person?.date_of_birth ||
      person?.dateOfBirth ||
      "",

    occupation:
      person?.occupation ||
      "",

    life_status:
      person?.life_status ||
      person?.lifeStatus ||
      "",

    address:
      person?.address ||
      "",
  };
}

function normalizeFamily(
  data,
) {
  return {
    marital_status:
      data?.marital_status ||
      data?.maritalStatus ||
      "SINGLE",

    father:
      normalizePerson(
        data?.father,
      ),

    mother:
      normalizePerson(
        data?.mother,
      ),

    spouse:
      normalizePerson(
        data?.spouse,
      ),
  };
}

function personPayload(
  person,
) {
  const isEmpty =
    !person.full_name_km.trim() &&
    !person.full_name_en.trim() &&
    !person.date_of_birth &&
    !person.occupation.trim() &&
    !person.life_status &&
    !person.address.trim();

  if (isEmpty) {
    return null;
  }

  return {
    full_name_km:
      person.full_name_km.trim(),

    full_name_en:
      person.full_name_en.trim() ||
      null,

    date_of_birth:
      person.date_of_birth ||
      null,

    occupation:
      person.occupation.trim() ||
      null,

    life_status:
      person.life_status ||
      null,

    address:
      person.address.trim() ||
      null,
  };
}

export default function FamilyPage() {
  const { t } = useLanguage();
  const isReadOnly = false;
  const { member: currentMember } = useCurrentMember();
  const memberId = currentMember?.id ?? "self";

  const [
    family,
    setFamily,
  ] = useState(
    EMPTY_FAMILY,
  );

  /*
   * True from the moment the user edits any family field (father,
   * mother, spouse, marital status) until the next successful Save —
   * NOT derived from diffing `family`, since `family` is also
   * rewritten by the load effect. Fed to useUnsavedFormGuard below so
   * the tab-nav bar knows to confirm before navigating away mid-edit.
   */
  const [
    hasUnsavedChanges,
    setHasUnsavedChanges,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /*
   * =========================================
   * LOAD FAMILY
   * =========================================
   */

  useEffect(() => {
    if (!memberId) {
      setLoading(false);

      return;
    }

    let active = true;

    async function loadFamily() {
      try {
        setLoading(true);
        setError("");

        const data =
          await requestJson(
            `/backend/my-account/family`,
          );

        if (!active) {
          return;
        }

        setFamily(
          normalizeFamily(
            data,
          ),
        );
      } catch (loadError) {
        console.error(
          "Cannot load family:",
          loadError,
        );

        if (active) {
          setError(
            loadError.message ||
              t("memberPage.familyLoadFailed"),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFamily();

    return () => {
      active = false;
    };
  }, [memberId, t]);

  /*
   * =========================================
   * FAMILY PERSON CHANGE
   * =========================================
   */

  function handleFamilyChange(
    section,
    field,
    value,
  ) {
    setError("");
    setSuccess("");
    setHasUnsavedChanges(true);

    setFamily(
      (previous) => ({
        ...previous,

        [section]: {
          ...previous[
            section
          ],

          [field]:
            value,
        },
      }),
    );
  }

  /*
   * =========================================
   * MARITAL STATUS CHANGE
   * =========================================
   */

  function handleMaritalStatusChange(
    value,
  ) {
    setError("");
    setSuccess("");
    setHasUnsavedChanges(true);

    setFamily(
      (previous) => ({
        ...previous,

        marital_status:
          value,

        /*
         * Backend deletes spouse
         * automatically when SINGLE.
         *
         * Clear it visually too.
         */
        spouse:
          value === "SINGLE"
            ? {
                ...EMPTY_PERSON,
              }
            : previous.spouse,
      }),
    );
  }

  /*
   * =========================================
   * SAVE
   * =========================================
   */

  async function handleSave() {
    if (!memberId) {
      setError(
        t("memberPage.missingMemberId"),
      );

      return false;
    }

    if (
      !family.marital_status
    ) {
      setError(
        t("memberPage.familyStatusRequired"),
      );

      return false;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        marital_status:
          family.marital_status,

        father:
          personPayload(
            family.father,
          ),

        mother:
          personPayload(
            family.mother,
          ),

        spouse:
          family.marital_status ===
          "SINGLE"
            ? null
            : personPayload(
                family.spouse,
              ),
      };

      const updated =
        await requestJson(
          `/backend/my-account/family`,
          {
            method: "PUT",

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      setFamily(
        normalizeFamily(
          updated,
        ),
      );

      setSuccess(
        t("memberPage.familySaveSuccess"),
      );

      setHasUnsavedChanges(false);

      return true;
    } catch (saveError) {
      console.error(
        "Cannot update family:",
        saveError,
      );

      setError(
        saveError.message ||
          t("memberPage.familySaveFailed"),
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  /*
   * Thin wrapper for the form's onSubmit — swallows the submit
   * event (preventDefault) then delegates to handleSave(), which is
   * also what useUnsavedFormGuard below calls directly (no event)
   * when the user chooses "save and continue" from the unsaved-
   * changes popup.
   */
  async function handleSubmit(
    event,
  ) {
    event.preventDefault();

    await handleSave();
  }

  /*
   * Registers this page's dirty flag + save function with the
   * shared unsaved-changes guard (see myAcc/layout.js), so the
   * account tab-nav bar confirms before navigating away while
   * hasUnsavedChanges is true.
   */
  useUnsavedFormGuard(
    hasUnsavedChanges,
    handleSave,
  );

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-text-secondary">
          {t("memberPage.loadingFamily")}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-4"
    >
      <fieldset disabled={isReadOnly} className={isReadOnly ? "member-readonly contents" : "contents"}>
      <div
        className="
          rounded-xl
          border
          border-border
          bg-bg-page-white
          p-4
          sm:p-5
          lg:p-6
        "
      >
        <h2 className="text-lg font-bold text-primary">
          {t("memberPage.detailFamily")}
        </h2>

        {/* FAMILY STATUS */}

        <div className="mt-5">
          <RadioGroup
            label={t("memberPage.familyStatus")}
            name="familyStatus"
            value={
              family.marital_status
            }
            options={[
              {
                label:
                  t("memberPage.single"),
                value:
                  "SINGLE",
              },
              {
                label:
                  t("memberPage.married"),
                value:
                  "MARRIED",
              },
            ]}
            onChange={
              handleMaritalStatusChange
            }
          />
        </div>

        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-x-6
            gap-y-6
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {/* =================================
              SPOUSE
          ================================= */}

          {family.marital_status !==
            "SINGLE" && (
            <>
              <BoxFill
                label={t("memberPage.spouseNameKm")}
                placeholder={t("memberPage.spouseNameKmPlaceholder")}
                value={
                  family.spouse
                    .full_name_km
                }
                onChange={(
                  event,
                ) =>
                  handleFamilyChange(
                    "spouse",
                    "full_name_km",
                    event.target
                      .value,
                  )
                }
              />

              <BoxFill
                label={t("memberPage.spouseNameEn")}
                placeholder={t("memberPage.latinNamePlaceholder")}
                value={
                  family.spouse
                    .full_name_en
                }
                onChange={(
                  event,
                ) =>
                  handleFamilyChange(
                    "spouse",
                    "full_name_en",
                    event.target
                      .value,
                  )
                }
              />

              <BoxFill
                label={t("memberPage.spouseOccupation")}
                placeholder={t("memberPage.spouseOccupationPlaceholder")}
                value={
                  family.spouse
                    .occupation
                }
                onChange={(
                  event,
                ) =>
                  handleFamilyChange(
                    "spouse",
                    "occupation",
                    event.target
                      .value,
                  )
                }
              />

              <FormDate
                label={t("memberPage.dateOfBirth")}
                name="spouseDateOfBirth"
                value={
                  family.spouse
                    .date_of_birth
                }
                onChange={(
                  event,
                ) =>
                  handleFamilyChange(
                    "spouse",
                    "date_of_birth",
                    event.target
                      .value,
                  )
                }
              />

              <div className="xl:col-span-2">
                <BoxFill
                  label={t("memberPage.spouseAddress")}
                  placeholder={t("memberPage.spouseAddressPlaceholder")}
                  value={
                    family.spouse
                      .address
                  }
                  onChange={(
                    event,
                  ) =>
                    handleFamilyChange(
                      "spouse",
                      "address",
                      event
                        .target
                        .value,
                    )
                  }
                />
              </div>
            </>
          )}

          {/* =================================
              FATHER
          ================================= */}

          <BoxFill
            label={t("memberPage.fatherNameKm")}
            placeholder={t("memberPage.fatherNameKmPlaceholder")}
            value={
              family.father
                .full_name_km
            }
            onChange={(
              event,
            ) =>
              handleFamilyChange(
                "father",
                "full_name_km",
                event.target
                  .value,
              )
            }
          />

          <BoxFill
            label={t("memberPage.fatherNameEn")}
            placeholder={t("memberPage.fatherNameEnPlaceholder")}
            value={
              family.father
                .full_name_en
            }
            onChange={(
              event,
            ) =>
              handleFamilyChange(
                "father",
                "full_name_en",
                event.target
                  .value,
              )
            }
          />

          <RadioGroup
            label={t("memberPage.fatherStatus")}
            name="fatherStatus"
            value={
              family.father
                .life_status
            }
            onChange={(
              value,
            ) =>
              handleFamilyChange(
                "father",
                "life_status",
                value,
              )
            }
          />

          <BoxFill
            label={t("memberPage.fatherOccupation")}
            placeholder={t("memberPage.fatherOccupationPlaceholder")}
            value={
              family.father
                .occupation
            }
            onChange={(
              event,
            ) =>
              handleFamilyChange(
                "father",
                "occupation",
                event.target
                  .value,
              )
            }
          />

          <div className="xl:col-span-2">
            <BoxFill
              label={t("memberPage.fatherAddress")}
              placeholder={t("memberPage.fatherAddressPlaceholder")}
              value={
                family.father
                  .address
              }
              onChange={(
                event,
              ) =>
                handleFamilyChange(
                  "father",
                  "address",
                  event.target
                    .value,
                )
              }
            />
          </div>

          {/* =================================
              MOTHER
          ================================= */}

          <BoxFill
            label={t("memberPage.motherNameKm")}
            placeholder={t("memberPage.motherNameKmPlaceholder")}
            value={
              family.mother
                .full_name_km
            }
            onChange={(
              event,
            ) =>
              handleFamilyChange(
                "mother",
                "full_name_km",
                event.target
                  .value,
              )
            }
          />

          <BoxFill
            label={t("memberPage.motherNameEn")}
            placeholder={t("memberPage.motherNameEnPlaceholder")}
            value={
              family.mother
                .full_name_en
            }
            onChange={(
              event,
            ) =>
              handleFamilyChange(
                "mother",
                "full_name_en",
                event.target
                  .value,
              )
            }
          />

          <RadioGroup
            label={t("memberPage.motherStatus")}
            name="motherStatus"
            value={
              family.mother
                .life_status
            }
            onChange={(
              value,
            ) =>
              handleFamilyChange(
                "mother",
                "life_status",
                value,
              )
            }
          />

          <BoxFill
            label={t("memberPage.motherOccupation")}
            placeholder={t("memberPage.motherOccupationPlaceholder")}
            value={
              family.mother
                .occupation
            }
            onChange={(
              event,
            ) =>
              handleFamilyChange(
                "mother",
                "occupation",
                event.target
                  .value,
              )
            }
          />

          <div className="xl:col-span-2">
            <BoxFill
              label={t("memberPage.motherAddress")}
              placeholder={t("memberPage.motherAddressPlaceholder")}
              value={
                family.mother
                  .address
              }
              onChange={(
                event,
              ) =>
                handleFamilyChange(
                  "mother",
                  "address",
                  event.target
                    .value,
                )
              }
            />
          </div>
        </div>
      </div>

      </fieldset>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg bg-error-bg px-4 py-3">
          <p className="text-sm font-medium text-error">
            {error}
          </p>
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="rounded-lg bg-success-bg px-4 py-3">
          <p className="text-sm font-medium text-success">
            {success}
          </p>
        </div>
      )}

      {/* SAVE */}

      {!isReadOnly && <div className="flex justify-end">
        <SaveButton
          type="submit"
          disabled={
            saving
          }
        >
          {saving
            ? t("common.saving")
            : t("memberPage.save")}
        </SaveButton>
      </div>}
    </form>
  );
}

/* =========================================================
 * RADIO GROUP
 * ========================================================= */

function RadioGroup({
  label,
  name,
  value,
  onChange,
  options,
}) {
  const { t } = useLanguage();
  const resolvedOptions = options ?? [
    {
      label: t("memberPage.alive"),
      value: "ALIVE",
    },
    {
      label: t("memberPage.deceased"),
      value: "DECEASED",
    },
  ];

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-text-primary">
        {label}
      </p>

      <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
        {resolvedOptions.map(
          (option) => (
            <Radio
              key={`${name}-${option.value}`}
              name={
                name
              }
              label={
                option.label
              }
              value={
                option.value
              }
              checked={
                value ===
                option.value
              }
              onChange={
                onChange
              }
            />
          ),
        )}
      </div>
    </div>
  );
}

/* =========================================================
 * RADIO
 * ========================================================= */

function Radio({
  name,
  label,
  value,
  checked,
  onChange,
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
      <input
        type="radio"
        name={
          name
        }
        value={
          value
        }
        checked={
          checked
        }
        onChange={() =>
          onChange(
            value,
          )
        }
        className="h-5 w-5 accent-primary"
      />

      <span>
        {label}
      </span>
    </label>
  );
}
