"use client";

import {
  useEffect,
  useState,
} from "react";

import useCurrentMember from "@/hooks/useCurrentMember";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill";
import FormDate from "@/components/forms/FormDate";

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
  const isReadOnly = false;
  const { member: currentMember } = useCurrentMember();
  const memberId = currentMember?.id ?? "self";

  const [
    family,
    setFamily,
  ] = useState(
    EMPTY_FAMILY,
  );

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
              "មិនអាចទាញយកព័ត៌មានគ្រួសារបានទេ។",
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
  }, [memberId]);

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

  async function handleSubmit(
    event,
  ) {
    event.preventDefault();

    if (!memberId) {
      setError(
        "រកមិនឃើញលេខសម្គាល់សមាជិក។",
      );

      return;
    }

    if (
      !family.marital_status
    ) {
      setError(
        "សូមជ្រើសរើសស្ថានភាពគ្រួសារ។",
      );

      return;
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
        "រក្សាទុកព័ត៌មានគ្រួសារបានជោគជ័យ។",
      );
    } catch (saveError) {
      console.error(
        "Cannot update family:",
        saveError,
      );

      setError(
        saveError.message ||
          "មិនអាចរក្សាទុកព័ត៌មានគ្រួសារបានទេ។",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-text-secondary">
          កំពុងទាញយកព័ត៌មានគ្រួសារ...
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
          ព័ត៌មានគ្រួសារ
        </h2>

        {/* FAMILY STATUS */}

        <div className="mt-5">
          <RadioGroup
            label="ស្ថានភាពគ្រួសារ"
            name="familyStatus"
            value={
              family.marital_status
            }
            options={[
              {
                label:
                  "នៅលីវ",
                value:
                  "SINGLE",
              },
              {
                label:
                  "មានគ្រួសារ",
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
                label="ឈ្មោះ ប្ដី/ប្រពន្ធ (ខ្មែរ)"
                placeholder="បញ្ចូលឈ្មោះប្ដីប្រពន្ធជាភាសាខ្មែរ"
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
                label="ឈ្មោះ ប្ដី/ប្រពន្ធ (ឡាតាំង)"
                placeholder="បញ្ចូលឈ្មោះជាភាសាឡាតាំង"
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
                label="មុខរបរ ប្ដី/ប្រពន្ធ"
                placeholder="បញ្ចូលមុខរបរ ប្ដី/ប្រពន្ធ"
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
                label="ថ្ងៃខែឆ្នាំ កំណើត"
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
                  label="ទីលំនៅប្ដី/ប្រពន្ធ"
                  placeholder="បញ្ចូលទីលំនៅប្ដី/ប្រពន្ធ"
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
            label="ឈ្មោះ ឪពុក (ខ្មែរ)"
            placeholder="បញ្ចូលឈ្មោះឪពុកជាភាសាខ្មែរ"
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
            label="ឈ្មោះ ឪពុក (ឡាតាំង)"
            placeholder="បញ្ចូលឈ្មោះឪពុកជាភាសាឡាតាំង"
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
            label="ស្ថានភាពឪពុក"
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
            label="មុខរបរឪពុក"
            placeholder="បញ្ចូលមុខរបរឪពុក"
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
              label="ទីលំនៅឪពុក"
              placeholder="បញ្ចូលទីលំនៅឪពុក"
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
            label="ឈ្មោះ ម្តាយ (ខ្មែរ)"
            placeholder="បញ្ចូលឈ្មោះម្តាយជាភាសាខ្មែរ"
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
            label="ឈ្មោះ ម្តាយ (ឡាតាំង)"
            placeholder="បញ្ចូលឈ្មោះម្តាយជាភាសាឡាតាំង"
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
            label="ស្ថានភាពម្តាយ"
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
            label="មុខរបរម្តាយ"
            placeholder="បញ្ចូលមុខរបរម្តាយ"
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
              label="ទីលំនៅម្តាយ"
              placeholder="បញ្ចូលទីលំនៅម្តាយ"
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
            ? "កំពុងរក្សាទុក..."
            : "រក្សាទុក"}
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
  options = [
    {
      label: "នៅរស់",
      value: "ALIVE",
    },
    {
      label: "ស្លាប់",
      value: "DECEASED",
    },
  ],
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-text-primary">
        {label}
      </p>

      <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
        {options.map(
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
