"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill";
import FormDate from "@/components/forms/FormDate";
import membersData from "@/data/members.json";

export default function FamilyPage() {
  const params = useParams();
  const memberId = String(params.id);

  const selectedMember = membersData.find(
    (member) => String(member.id) === memberId
  );

  const [family, setFamily] = useState(
    selectedMember?.family
  );

  function handleFamilyChange(section, field, value) {
    setFamily((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const updatedMember = {
      ...selectedMember,
      family,
    };

    console.log("Updated member:", updatedMember);
  }

  if (!selectedMember || !family) {
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
        <SaveButton type="submit" />
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