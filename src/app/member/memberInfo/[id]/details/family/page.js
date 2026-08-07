"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill";
import FormDate from "@/components/forms/FormDate";

const EMPTY_PERSON = {
  id: null,
  name_kh: "",
  name_en: "",
  occupation: "",
  date_of_birth: "",
  status: "ALIVE",
  address: "",
};

function emptyFamily() {
  return {
    spouse: { ...EMPTY_PERSON },
    father: { ...EMPTY_PERSON },
    mother: { ...EMPTY_PERSON },
  };
}

export default function FamilyPage() {
  const params = useParams();
  const memberId = String(params.id);

  const [family, setFamily] = useState(emptyFamily);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFamily() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/backend/members/${encodeURIComponent(memberId)}/family`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          const problem = await response.json().catch(() => ({}));
          throw new Error(problem.message || "Unable to load family information.");
        }

        const records = await response.json();
        const nextFamily = emptyFamily();

        records.forEach((record) => {
          const section = String(record.relationship || "").toLowerCase();
          if (!nextFamily[section]) return;
          nextFamily[section] = {
            id: record.id,
            name_kh: record.full_name_km || "",
            name_en: record.full_name_en || "",
            occupation: record.occupation || "",
            date_of_birth: record.date_of_birth || "",
            status: record.life_status || "ALIVE",
            address: record.address || "",
          };
        });

        if (!cancelled) setFamily(nextFamily);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load family information.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadFamily();
    return () => {
      cancelled = true;
    };
  }, [memberId]);

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
    setIsSaving(true);
    setError("");

    try {
      const savedSections = await Promise.all(
        Object.entries(family).map(async ([section, person]) => {
          const relationship = section.toUpperCase();
          const baseUrl = `/api/backend/members/${encodeURIComponent(memberId)}/family`;

          if (!person.name_kh.trim()) {
            if (person.id) {
              const deleteResponse = await fetch(`${baseUrl}/${person.id}`, { method: "DELETE" });
              if (!deleteResponse.ok) throw new Error(`Unable to remove ${section} information.`);
            }
            return [section, { ...EMPTY_PERSON }];
          }

          const response = await fetch(person.id ? `${baseUrl}/${person.id}` : baseUrl, {
            method: person.id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              relationship,
              full_name_km: person.name_kh.trim(),
              full_name_en: person.name_en.trim() || null,
              date_of_birth: person.date_of_birth || null,
              occupation: person.occupation.trim() || null,
              life_status:
                person.status === "ស្លាប់" || person.status === "DECEASED"
                  ? "DECEASED"
                  : "ALIVE",
              address: person.address.trim() || null,
            }),
          });

          if (!response.ok) {
            const problem = await response.json().catch(() => ({}));
            throw new Error(problem.message || `Unable to save ${section} information.`);
          }

          const saved = await response.json();
          return [section, {
            id: saved.id,
            name_kh: saved.full_name_km || "",
            name_en: saved.full_name_en || "",
            occupation: saved.occupation || "",
            date_of_birth: saved.date_of_birth || "",
            status: saved.life_status || "ALIVE",
            address: saved.address || "",
          }];
        }),
      );

      setFamily(Object.fromEntries(savedSections));
      alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
    } catch (saveError) {
      setError(saveError.message || "Unable to save family information.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading family information...</div>;
  }

  if (!family) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-red-500">
          រកមិនឃើញព័ត៌មានសមាជិក
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-primary">
          ព័ត៌មានគ្រួសារ
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
          <BoxFill
            label="ឈ្មោះ ប្ដី/ប្រពន្ធ (ខ្មែរ)"
            placeholder="បញ្ចូលឈ្មោះប្ដីប្រពន្ធជាភាសាខ្មែរ"
            value={family.spouse.name_kh}
            onChange={(event) =>
              handleFamilyChange(
                "spouse",
                "name_kh",
                event.target.value
              )
            }
          />

          <BoxFill
            label="ឈ្មោះ ប្ដី/ប្រពន្ធ (ឡាតាំង)"
            placeholder="បញ្ចូលឈ្មោះជាភាសាឡាតាំង"
            value={family.spouse.name_en}
            onChange={(event) =>
              handleFamilyChange(
                "spouse",
                "name_en",
                event.target.value
              )
            }
          />

          <BoxFill
            label="មុខរបរ ប្ដី/ប្រពន្ធ"
            placeholder="បញ្ចូលមុខរបរ ប្ដី/ប្រពន្ធ"
            value={family.spouse.occupation}
            onChange={(event) =>
              handleFamilyChange(
                "spouse",
                "occupation",
                event.target.value
              )
            }
          />

          <FormDate
            label="ថ្ងៃខែឆ្នាំ កំណើត"
            value={family.spouse.date_of_birth}
            onChange={(event) =>
              handleFamilyChange(
                "spouse",
                "date_of_birth",
                event.target.value
              )
            }
          />

          <div className="xl:col-span-2">
            <BoxFill
              label="ទីលំនៅប្ដី/ប្រពន្ធ"
              placeholder="បញ្ចូលទីលំនៅប្ដី/ប្រពន្ធ"
              value={family.spouse.address}
              onChange={(event) =>
                handleFamilyChange(
                  "spouse",
                  "address",
                  event.target.value
                )
              }
            />
          </div>

          <BoxFill
            label="ឈ្មោះ ឪពុក (ខ្មែរ)"
            placeholder="បញ្ចូលឈ្មោះឪពុកជាភាសាខ្មែរ"
            value={family.father.name_kh}
            onChange={(event) =>
              handleFamilyChange(
                "father",
                "name_kh",
                event.target.value
              )
            }
          />

          <BoxFill
            label="ឈ្មោះ ឪពុក (ឡាតាំង)"
            placeholder="បញ្ចូលឈ្មោះឪពុកជាភាសាឡាតាំង"
            value={family.father.name_en}
            onChange={(event) =>
              handleFamilyChange(
                "father",
                "name_en",
                event.target.value
              )
            }
          />

          <BoxFill
            label="មុខរបរឪពុក"
            placeholder="បញ្ចូលមុខរបរឪពុក"
            value={family.father.occupation}
            onChange={(event) =>
              handleFamilyChange(
                "father",
                "occupation",
                event.target.value
              )
            }
          />

          <RadioGroup
            label="ស្ថានភាពឪពុក"
            name="fatherStatus"
            value={family.father.status}
            onChange={(value) =>
              handleFamilyChange("father", "status", value)
            }
          />

          <div className="xl:col-span-2">
            <BoxFill
              label="ទីលំនៅឪពុក"
              placeholder="បញ្ចូលទីលំនៅឪពុក"
              value={family.father.address}
              onChange={(event) =>
                handleFamilyChange(
                  "father",
                  "address",
                  event.target.value
                )
              }
            />
          </div>

          <BoxFill
            label="ឈ្មោះ ម្តាយ (ខ្មែរ)"
            placeholder="បញ្ចូលឈ្មោះម្តាយ"
            value={family.mother.name_kh}
            onChange={(event) =>
              handleFamilyChange(
                "mother",
                "name_kh",
                event.target.value
              )
            }
          />

          <BoxFill
            label="ឈ្មោះ ម្តាយ (ឡាតាំង)"
            placeholder="បញ្ចូលឈ្មោះម្តាយ"
            value={family.mother.name_en}
            onChange={(event) =>
              handleFamilyChange(
                "mother",
                "name_en",
                event.target.value
              )
            }
          />

          <BoxFill
            label="មុខរបរម្តាយ"
            placeholder="បញ្ចូលមុខរបរម្តាយ"
            value={family.mother.occupation}
            onChange={(event) =>
              handleFamilyChange(
                "mother",
                "occupation",
                event.target.value
              )
            }
          />

          <RadioGroup
            label="ស្ថានភាពម្តាយ"
            name="motherStatus"
            value={family.mother.status}
            onChange={(value) =>
              handleFamilyChange("mother", "status", value)
            }
          />

          <div className="xl:col-span-2">
            <BoxFill
              label="ទីលំនៅម្តាយ"
              placeholder="បញ្ចូលទីលំនៅម្តាយ"
              value={family.mother.address}
              onChange={(event) =>
                handleFamilyChange(
                  "mother",
                  "address",
                  event.target.value
                )
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        {error && <p className="mr-4 self-center text-sm text-red-600">{error}</p>}
        <SaveButton type="submit" disabled={isSaving} />
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
          value="ALIVE"
          checked={value === "នៅរស់" || value === "ALIVE"}
          onChange={onChange}
        />

        <Radio
          name={name}
          label="ស្លាប់"
          value="DECEASED"
          checked={value === "ស្លាប់" || value === "DECEASED"}
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
