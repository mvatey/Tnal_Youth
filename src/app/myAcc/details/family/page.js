"use client";

import { useEffect, useState } from "react";

import useCurrentMember from "@/hooks/useCurrentMember";

import SaveButton from "@/components/ui/actions/SaveButton";
import FormControl from "@/components/forms/FormControl";
import KhmerDateField from "@/components/forms/KhmerDateField";
import RadioGroup from "@/components/forms/RadioGroup";

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

  useEffect(() => {
    if (!member) {
      setFamily(EMPTY_FAMILY);
      return;
    }

    setFamily({
      spouse: {
        ...EMPTY_FAMILY.spouse,
        ...(member.family?.spouse || {}),
      },

      father: {
        ...EMPTY_FAMILY.father,
        ...(member.family?.father || {}),
      },

      mother: {
        ...EMPTY_FAMILY.mother,
        ...(member.family?.mother || {}),
      },
    });
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

  function handleSubmit(event) {
    event.preventDefault();

    const updatedMember = {
      ...member,
      family,
    };

    console.log("Updated member:", updatedMember);
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

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
          {/* SPOUSE */}

          <FormControl
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

          <FormControl
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

          <FormControl
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

          <KhmerDateField
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
            <FormControl
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

          <FormControl
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

          <FormControl
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

          <FormControl
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

          <div className="xl:col-span-2">
            <FormControl
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

          <FormControl
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

          <FormControl
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

          <FormControl
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

          <div className="xl:col-span-2">
            <FormControl
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
        <SaveButton type="submit" />
      </div>
    </form>
  );
}
