"use client";

import { useEffect, useState } from "react";

import useCurrentMember from "@/hooks/useCurrentMember";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill";
import FormDate from "@/components/forms/FormDate";
import {
  fetchMyAccountCollection,
  saveMyAccountCollection,
} from "@/lib/myAccountCollections";

const EMPTY_FAMILY = {
  spouse: {
    name_kh: "",
    name_en: "",
    occupation: "",
    date_of_birth: "",
    address: "",
  },

  father: {
    name_kh: "",
    name_en: "",
    occupation: "",
    status: "",
    address: "",
  },

  mother: {
    name_kh: "",
    name_en: "",
    occupation: "",
    status: "",
    address: "",
  },
};

export default function FamilyPage() {
  const {
    member,
    loading,
    error,
  } = useCurrentMember();

  const [family, setFamily] = useState(EMPTY_FAMILY);
  const [originalFamily, setOriginalFamily] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    if (!member) {
      setFamily(EMPTY_FAMILY);
      setOriginalFamily([]);
      return;
    }

    let active = true;
    fetchMyAccountCollection("family")
      .then((items) => {
        if (!active) return;
        const next = structuredClone(EMPTY_FAMILY);
        for (const item of items) {
          const section = String(item.relationship || "").toLowerCase();
          if (!next[section]) continue;
          next[section] = {
            id: item.id,
            name_kh: item.fullNameKm || "",
            name_en: item.fullNameEn || "",
            occupation: item.occupation || "",
            date_of_birth: item.dateOfBirth || "",
            status:
              item.lifeStatus === "DECEASED" ? "ស្លាប់" :
              item.lifeStatus === "ALIVE" ? "នៅរស់" : "",
            address: item.address || "",
          };
        }
        setOriginalFamily(items);
        setFamily(next);
      })
      .catch((requestError) => setSaveError(requestError.message));

    return () => { active = false; };
  }, [member]);

  function handleFamilyChange(section, field, value) {
    setFamily((previous) => ({
      ...previous,

      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const current = Object.entries(family)
        .filter(([section, item]) =>
          ["spouse", "father", "mother"].includes(section) &&
          String(item.name_kh || "").trim(),
        )
        .map(([section, item]) => ({ ...item, relationship: section.toUpperCase() }));

      const saved = await saveMyAccountCollection(
        "family",
        originalFamily,
        current,
        (item) => ({
          relationship: item.relationship,
          fullNameKm: item.name_kh.trim(),
          fullNameEn: item.name_en?.trim() || null,
          dateOfBirth: item.date_of_birth || null,
          occupation: item.occupation?.trim() || null,
          lifeStatus:
            item.status === "ស្លាប់" || item.status === "DECEASED"
              ? "DECEASED"
              : item.status ? "ALIVE" : null,
          address: item.address?.trim() || null,
        }),
      );
      setOriginalFamily(saved);
      setSaveSuccess("រក្សាទុកព័ត៌មានបានជោគជ័យ");
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        កំពុងទាញយកព័ត៌មានសមាជិក...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">
          {error}
        </p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">
          រកមិនឃើញព័ត៌មានសមាជិក
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-primary">
          ព័ត៌មានគ្រួសារ
        </h2>
        <div className="mt-6">
  <RadioGroup
    label="ស្ថានភាពគ្រួសារ"
    name="familyStatus"
    value={family.status || ""}
    options={[
      {
        label: "នៅលីវ",
        value: "នៅលីវ",
      },
      {
        label: "មានគ្រួសារ",
        value: "មានគ្រួសារ",
      },
    ]}
    onChange={(value) =>
      setFamily((previous) => ({
        ...previous,
        status: value,
      }))
    }
  />
</div>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
          {/* SPOUSE */}

          <BoxFill
            label="ឈ្មោះ ប្ដី/ប្រពន្ធ (ខ្មែរ)"
            placeholder="បញ្ចូលឈ្មោះ"
            value={family.spouse.name_kh}
            onChange={(event) =>
              handleFamilyChange(
                "spouse",
                "name_kh",
                event.target.value,
              )
            }
          />

          <BoxFill
            label="ឈ្មោះ ប្ដី/ប្រពន្ធ (ឡាតាំង)"
            placeholder="បញ្ចូលឈ្មោះ"
            value={family.spouse.name_en}
            onChange={(event) =>
              handleFamilyChange(
                "spouse",
                "name_en",
                event.target.value,
              )
            }
          />

          <BoxFill
            label="មុខរបរ ប្ដី/ប្រពន្ធ"
            placeholder="បញ្ចូលមុខរបរ"
            value={family.spouse.occupation}
            onChange={(event) =>
              handleFamilyChange(
                "spouse",
                "occupation",
                event.target.value,
              )
            }
          />

          <FormDate
            label="ថ្ងៃខែឆ្នាំកំណើត"
            value={family.spouse.date_of_birth}
            onChange={(event) =>
              handleFamilyChange(
                "spouse",
                "date_of_birth",
                event.target.value,
              )
            }
          />

          <div className="xl:col-span-2">
            <BoxFill
              label="ទីលំនៅប្ដី/ប្រពន្ធ"
              placeholder="បញ្ចូលទីលំនៅ"
              value={family.spouse.address}
              onChange={(event) =>
                handleFamilyChange(
                  "spouse",
                  "address",
                  event.target.value,
                )
              }
            />
          </div>

          {/* FATHER */}

          <BoxFill
            label="ឈ្មោះឪពុក (ខ្មែរ)"
            placeholder="បញ្ចូលឈ្មោះ"
            value={family.father.name_kh}
            onChange={(event) =>
              handleFamilyChange(
                "father",
                "name_kh",
                event.target.value,
              )
            }
          />

          <BoxFill
            label="ឈ្មោះឪពុក (ឡាតាំង)"
            placeholder="បញ្ចូលឈ្មោះ"
            value={family.father.name_en}
            onChange={(event) =>
              handleFamilyChange(
                "father",
                "name_en",
                event.target.value,
              )
            }
          />

          

          <RadioGroup
            label="ស្ថានភាពឪពុក"
            name="father"
            value={family.father.status}
            onChange={(value) =>
              handleFamilyChange(
                "father",
                "status",
                value,
              )
            }
          />
          <BoxFill
            label="មុខរបរឪពុក"
            placeholder="បញ្ចូលមុខរបរ"
            value={family.father.occupation}
            onChange={(event) =>
              handleFamilyChange(
                "father",
                "occupation",
                event.target.value,
              )
            }
          />

          <div className="xl:col-span-2">
            <BoxFill
              label="ទីលំនៅឪពុក"
              placeholder="បញ្ចូលទីលំនៅ"
              value={family.father.address}
              onChange={(event) =>
                handleFamilyChange(
                  "father",
                  "address",
                  event.target.value,
                )
              }
            />
          </div>

          {/* MOTHER */}

          <BoxFill
            label="ឈ្មោះម្តាយ (ខ្មែរ)"
            placeholder="បញ្ចូលឈ្មោះ"
            value={family.mother.name_kh}
            onChange={(event) =>
              handleFamilyChange(
                "mother",
                "name_kh",
                event.target.value,
              )
            }
          />

          <BoxFill
            label="ឈ្មោះម្តាយ (ឡាតាំង)"
            placeholder="បញ្ចូលឈ្មោះ"
            value={family.mother.name_en}
            onChange={(event) =>
              handleFamilyChange(
                "mother",
                "name_en",
                event.target.value,
              )
            }
          />

          

          <RadioGroup
            label="ស្ថានភាពម្តាយ"
            name="mother"
            value={family.mother.status}
            onChange={(value) =>
              handleFamilyChange(
                "mother",
                "status",
                value,
              )
            }
          />
          <BoxFill
            label="មុខរបរម្តាយ"
            placeholder="បញ្ចូលមុខរបរ"
            value={family.mother.occupation}
            onChange={(event) =>
              handleFamilyChange(
                "mother",
                "occupation",
                event.target.value,
              )
            }
          />

          <div className="xl:col-span-2">
            <BoxFill
              label="ទីលំនៅម្តាយ"
              placeholder="បញ្ចូលទីលំនៅ"
              value={family.mother.address}
              onChange={(event) =>
                handleFamilyChange(
                  "mother",
                  "address",
                  event.target.value,
                )
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="flex flex-col items-end gap-2">
          {saveError && <p className="text-sm text-red-500">{saveError}</p>}
          {saveSuccess && <p className="text-sm text-green-600">{saveSuccess}</p>}
          <SaveButton type="submit" disabled={saving} />
        </div>
      </div>
    </form>
  );
}

function RadioGroup({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>

      <div className="flex gap-8 pt-2">
        <Radio
          name={name}
          label="នៅរស់"
          value="នៅរស់"
          checked={value === "នៅរស់"}
          onChange={onChange}
        />

        <Radio
          name={name}
          label="ស្លាប់"
          value="ស្លាប់"
          checked={value === "ស្លាប់"}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function Radio({
  name,
  label,
  value,
  checked,
  onChange,
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-text-primary">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-5 w-5 accent-primary"
      />

      {label}
    </label>
  );
}
