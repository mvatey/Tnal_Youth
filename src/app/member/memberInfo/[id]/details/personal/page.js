"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useParams } from "next/navigation";
import { UploadCloud } from "lucide-react";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill.js";
import SelectArrow from "@/components/forms/SelectArrow";
import FormDate from "@/components/forms/FormDate.js";

import members from "@/data/members.json";

const ROLE_OPTIONS = [
  {
    label: "ប្រធានសាខា",
    value: "branch_leader",
  },
  {
    label: "លេខាធិការ",
    value: "secretary",
  },
  {
    label: "សមាជិក",
    value: "member",
  },
];

const LEVEL_OPTIONS = [
  {
    label: "កាំ ក",
    value: "ក",
  },
  {
    label: "កាំ ខ",
    value: "ខ",
  },
  {
    label: "កាំ គ",
    value: "គ",
  },
  {
    label: "កាំ ឃ",
    value: "ឃ",
  },
  {
    label: "កាំ ង",
    value: "ង",
  },
];

const SHIRT_SIZE_OPTIONS = [
  {
    label: "XS",
    value: "XS",
  },
  {
    label: "S",
    value: "S",
  },
  {
    label: "M",
    value: "M",
  },
  {
    label: "L",
    value: "L",
  },
  {
    label: "XL",
    value: "XL",
  },
  {
    label: "2XL",
    value: "2XL",
  },
  {
    label: "3XL",
    value: "3XL",
  },
];

const STATUS_OPTIONS = [
  {
    label: "សកម្ម",
    value: "សកម្ម",
  },
  {
    label: "អសកម្ម",
    value: "អសកម្ម",
  },
];

const RELIGION_OPTIONS = [
  {
    label: "ព្រះពុទ្ធ",
    value: "ព្រះពុទ្ធ",
  },
  {
    label: "អ៊ីស្លាម",
    value: "អ៊ីស្លាម",
  },
  {
    label: "គ្រីស្ទ",
    value: "គ្រីស្ទ",
  },
  {
    label: "មិនមានសាសនា",
    value: "មិនមានសាសនា",
  },
  {
    label: "ផ្សេងៗ",
    value: "ផ្សេងៗ",
  },
];

const GENDER_OPTIONS = [
  {
    label: "ប្រុស",
    value: "ប្រុស",
  },
  {
    label: "ស្រី",
    value: "ស្រី",
  },
  {
    label: "ព្រះសង្ឃ",
    value: "ព្រះសង្ឃ",
  },
];

function normalizeRole(role) {
  const value = String(role || "").trim();

  const roleMap = {
    admin: "admin",
    អ្នកគ្រប់គ្រង: "admin",

    branch_leader: "branch_leader",
    ប្រធានសាខា: "branch_leader",

    secretary: "secretary",
    លេខាធិការ: "secretary",

    member: "member",
    សមាជិក: "member",
  };

  return roleMap[value] || value;
}

export default function PersonalPage() {
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const fileRef = useRef(null);

  const [member, setMember] =
    useState(null);

  const [fileName, setFileName] =
    useState("");

  const branchOptions = useMemo(() => {
    return [
      ...new Set(
        members
          .map((item) => item.branch)
          .filter(Boolean),
      ),
    ].map((branch) => ({
      label: branch,
      value: branch,
    }));
  }, []);

  useEffect(() => {
    const selectedMember =
      members.find(
        (item) =>
          String(item.id) ===
          String(id),
      );

    if (!selectedMember) {
      setMember(null);
      return;
    }

    setMember({
      ...selectedMember,

      role: normalizeRole(
        selectedMember.role,
      ),

      level:
        selectedMember.level ||
        selectedMember.memberLevel ||
        selectedMember.rank ||
        "",

      shirtSize:
        selectedMember.shirtSize ||
        selectedMember.shirt_size ||
        selectedMember.tshirtSize ||
        "",
    });
  }, [id]);

  const handleChange =
    (field) => (event) => {
      const value =
        event.target.value;

      setMember(
        (previousMember) => ({
          ...previousMember,
          [field]: value,
        }),
      );
    };

  const handleFileChange = (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "ទំហំឯកសារមិនត្រូវលើស 5MB",
      );

      event.target.value = "";
      return;
    }

    setFileName(file.name);
  };

  const handleSave = () => {
    const cvFile =
      fileRef.current
        ?.files?.[0] || null;

    console.log(
      "Member ID:",
      id,
    );

    console.log(
      "Updated member:",
      member,
    );

    console.log(
      "CV:",
      cvFile,
    );

    alert(
      "រក្សាទុកព័ត៌មានបានជោគជ័យ",
    );
  };

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
    <div className="space-y-4">
      <div
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-4
          sm:p-5
          lg:p-6
        "
      >
        <h2 className="text-lg font-bold text-primary">
          ព័ត៌មានផ្ទាល់ខ្លួន
        </h2>

        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-6
            xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]
          "
        >
          {/* Form fields */}

          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
            "
          >
            <BoxFill
              label="ឈ្មោះជាភាសាខ្មែរ"
              value={
                member.name_kh || ""
              }
              onChange={handleChange(
                "name_kh",
              )}
              placeholder="បញ្ចូលឈ្មោះជាភាសាខ្មែរ"
            />

            <BoxFill
              label="ឈ្មោះជាអក្សរឡាតាំង"
              value={
                member.name_en || ""
              }
              onChange={handleChange(
                "name_en",
              )}
              placeholder="បញ្ចូលឈ្មោះជាអក្សរឡាតាំង"
            />

            <FormSelect
              label="សាខា"
              value={
                member.branch || ""
              }
              onChange={handleChange(
                "branch",
              )}
              placeholder="ជ្រើសរើសសាខា"
              options={branchOptions}
            />

            <FormSelect
              label="ភេទ"
              value={
                member.gender || ""
              }
              onChange={handleChange(
                "gender",
              )}
              placeholder="ជ្រើសរើសភេទ"
              options={GENDER_OPTIONS}
            />

            <BoxFill
              label="អ៊ីមែល"
              type="email"
              value={
                member.email || ""
              }
              onChange={handleChange(
                "email",
              )}
              placeholder="បញ្ចូលអ៊ីមែល"
            />

            <BoxFill
              label="លេខទូរស័ព្ទ"
              type="tel"
              value={
                member.phone || ""
              }
              onChange={handleChange(
                "phone",
              )}
              placeholder="បញ្ចូលលេខទូរស័ព្ទ"
            />

            <FormDate
              label="ថ្ងៃខែឆ្នាំកំណើត"
              name="date_of_birth"
              value={
                member.date_of_birth ||
                ""
              }
              onChange={handleChange(
                "date_of_birth",
              )}
            />

            <BoxFill
              label="សញ្ជាតិ"
              value={
                member.nationality ||
                ""
              }
              onChange={handleChange(
                "nationality",
              )}
              placeholder="បញ្ចូលសញ្ជាតិ"
            />

            <BoxFill
              label="ជនជាតិ"
              value={
                member.ethnicity || ""
              }
              onChange={handleChange(
                "ethnicity",
              )}
              placeholder="បញ្ចូលជនជាតិ"
            />

            <FormSelect
              label="តួនាទី"
              value={
                member.role || ""
              }
              onChange={handleChange(
                "role",
              )}
              placeholder="ជ្រើសរើសតួនាទី"
              options={ROLE_OPTIONS}
            />

            <FormSelect
              label="កាំ"
              value={
                member.level || ""
              }
              onChange={handleChange(
                "level",
              )}
              placeholder="ជ្រើសរើសកាំ"
              options={LEVEL_OPTIONS}
            />

            <FormSelect
              label="ទំហំអាវ"
              value={
                member.shirtSize ||
                ""
              }
              onChange={handleChange(
                "shirtSize",
              )}
              placeholder="ជ្រើសរើសទំហំអាវ"
              options={
                SHIRT_SIZE_OPTIONS
              }
            />

            <FormSelect
              label="ស្ថានភាព"
              value={
                member.status || ""
              }
              onChange={handleChange(
                "status",
              )}
              placeholder="ជ្រើសរើសស្ថានភាព"
              options={STATUS_OPTIONS}
            />

            <FormSelect
              label="សាសនា"
              value={
                member.religion || ""
              }
              onChange={handleChange(
                "religion",
              )}
              placeholder="ជ្រើសរើសសាសនា"
              options={
                RELIGION_OPTIONS
              }
            />
          </div>

          {/* CV upload */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              បញ្ចូល CV
            </label>

            <div
              className="
                flex
                min-h-[190px]
                w-full
                flex-col
                items-center
                justify-center
                rounded-xl
                border-2
                border-dashed
                border-gray-200
                bg-gray-50
                px-4
                text-center
              "
            >
              <div
                className="
                  mb-3
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                "
              >
                <UploadCloud
                  size={22}
                  className="text-gray-400"
                />
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                className="hidden"
                onChange={
                  handleFileChange
                }
              />

              <button
                type="button"
                onClick={() =>
                  fileRef.current?.click()
                }
                className="
                  text-sm
                  font-semibold
                  text-primary
                  hover:underline
                "
              >
                បញ្ចូលឯកសារ
              </button>

              <p className="mt-2 text-xs text-gray-400">
                JPG, DOCX, PDF, PNG
                (មិនលើស 5MB)
              </p>

              {fileName && (
                <p
                  className="
                    mt-2
                    max-w-[240px]
                    truncate
                    text-xs
                    font-medium
                    text-primary
                  "
                  title={fileName}
                >
                  {fileName}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton
          onClick={handleSave}
        />
      </div>
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  placeholder,
  options = [],
  disabled = false,
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="
            h-11
            w-full
            appearance-none
            rounded-lg
            border
            border-gray-200
            bg-white
            px-4
            pr-10
            text-sm
            text-gray-600
            outline-none
            transition
            focus:border-primary
            disabled:cursor-not-allowed
            disabled:bg-gray-100
            disabled:opacity-60
          "
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map(
            (option) => {
              const optionLabel =
                typeof option ===
                "object"
                  ? option.label
                  : option;

              const optionValue =
                typeof option ===
                "object"
                  ? option.value
                  : option;

              return (
                <option
                  key={
                    optionValue
                  }
                  value={
                    optionValue
                  }
                >
                  {optionLabel}
                </option>
              );
            },
          )}
        </select>

        <SelectArrow />
      </div>
    </div>
  );
}