"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FileText,
  UploadCloud,
  X,
} from "lucide-react";

import useCurrentMember from "@/hooks/useCurrentMember";

import BoxFill from "@/components/forms/boxFill";
import SaveButton from "@/components/forms/SaveButton";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ROLE_LABELS = {
  admin: "អ្នកគ្រប់គ្រង",
  branch_leader: "ប្រធានសាខា",
  secretary: "លេខាធិការ",
  member: "សមាជិក",

  អ្នកគ្រប់គ្រង: "អ្នកគ្រប់គ្រង",
  ប្រធានសាខា: "ប្រធានសាខា",
  លេខាធិការ: "លេខាធិការ",
  សមាជិក: "សមាជិក",
};

function getRoleLabel(role) {
  const normalizedRole =
    String(role || "").trim();

  return (
    ROLE_LABELS[normalizedRole] ||
    normalizedRole ||
    "-"
  );
}

function getLevelValue(member) {
  const level =
    member?.level ||
    member?.memberLevel ||
    member?.rank ||
    "";

  if (!level) {
    return "-";
  }

  const stringLevel =
    String(level).trim();

  if (
    stringLevel.startsWith("កាំ")
  ) {
    return stringLevel;
  }

  return `កាំ ${stringLevel}`;
}

function getShirtSize(member) {
  return (
    member?.shirtSize ||
    member?.shirt_size ||
    member?.tshirtSize ||
    "-"
  );
}

function formatFileSize(size) {
  if (!size) {
    return "0 KB";
  }

  const sizeInMb =
    size / 1024 / 1024;

  if (sizeInMb >= 1) {
    return `${sizeInMb.toFixed(
      2,
    )} MB`;
  }

  return `${(
    size / 1024
  ).toFixed(1)} KB`;
}

export default function MyAccountPersonalPage() {
  const fileRef = useRef(null);

  const {
    member,
    loading,
    error,
  } = useCurrentMember();

  const [form, setForm] =
    useState(null);

  const [cvFile, setCvFile] =
    useState(null);

  const [fileError, setFileError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!member) {
      setForm(null);
      return;
    }

    setForm({
      name_kh:
        member.name_kh || "",

      name_en:
        member.name_en || "",

      branch:
        member.branch || "",

      gender:
        member.gender || "",

      email:
        member.email || "",

      phone:
        member.phone || "",

      date_of_birth:
        member.date_of_birth || "",

      nationality:
        member.nationality || "",

      ethnicity:
        member.ethnicity || "",

      role: getRoleLabel(
        member.role,
      ),

      level:
        getLevelValue(member),

      shirtSize:
        getShirtSize(member),

      status:
        member.status || "",

      religion:
        member.religion || "",

      joinedAt:
        member.joinedAt ||
        member.joined_at ||
        "",
    });

    setCvFile(null);
    setFileError("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }, [member]);

  const handleFileChange = (
    event,
  ) => {
    const selectedFile =
      event.target.files?.[0];

    setFileError("");

    if (!selectedFile) {
      return;
    }

    if (
      !ALLOWED_FILE_TYPES.includes(
        selectedFile.type,
      )
    ) {
      setFileError(
        "សូមជ្រើសរើសឯកសារ JPG, PNG, PDF, DOC ឬ DOCX។",
      );

      event.target.value = "";
      setCvFile(null);

      return;
    }

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      setFileError(
        "ទំហំឯកសារមិនត្រូវលើស 5MB។",
      );

      event.target.value = "";
      setCvFile(null);

      return;
    }

    setCvFile(selectedFile);
  };

  const removeFile = () => {
    setCvFile(null);
    setFileError("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!cvFile) {
      setFileError(
        "សូមជ្រើសរើសឯកសារ CV ជាមុនសិន។",
      );

      return;
    }

    setSaving(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "memberId",
        String(member.id),
      );

      formData.append(
        "cv",
        cvFile,
      );

      /*
       * Replace this console section with
       * your backend API when it is ready.
       *
       * Example:
       *
       * await fetch(
       *   `/api/members/${member.id}/cv`,
       *   {
       *     method: "POST",
       *     body: formData,
       *   },
       * );
       */

      console.log(
        "Current member:",
        member,
      );

      console.log(
        "Uploaded CV:",
        cvFile,
      );

      console.log(
        "FormData:",
        formData,
      );

      alert(
        "បញ្ចូលឯកសារ CV បានជោគជ័យ",
      );
    } catch (saveError) {
      console.error(
        "Cannot upload CV:",
        saveError,
      );

      alert(
        "មានបញ្ហាក្នុងការបញ្ចូលឯកសារ CV",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-6
          text-sm
          text-gray-500
        "
      >
        កំពុងទាញយកព័ត៌មានសមាជិក...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
          rounded-xl
          border
          border-red-200
          bg-white
          p-6
        "
      >
        <p className="text-sm text-red-500">
          {error}
        </p>
      </div>
    );
  }

  if (!member || !form) {
    return (
      <div
        className="
          rounded-xl
          border
          border-red-200
          bg-white
          p-6
        "
      >
        <p className="text-sm text-red-500">
          គណនីនេះមិនទាន់ភ្ជាប់ជាមួយព័ត៌មានសមាជិកទេ
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
          {/* Read-only member information */}

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
                form.name_kh || "-"
              }
              readOnly
            />

            <BoxFill
              label="ឈ្មោះជាអក្សរឡាតាំង"
              value={
                form.name_en || "-"
              }
              readOnly
            />

            <BoxFill
              label="សាខា"
              value={
                form.branch || "-"
              }
              readOnly
            />

            <BoxFill
              label="ភេទ"
              value={
                form.gender || "-"
              }
              readOnly
            />

            <BoxFill
              label="អ៊ីមែល"
              type="email"
              value={
                form.email || "-"
              }
              readOnly
            />

            <BoxFill
              label="លេខទូរស័ព្ទ"
              type="tel"
              value={
                form.phone || "-"
              }
              readOnly
            />

            <BoxFill
              label="ថ្ងៃខែឆ្នាំកំណើត"
              value={
                form.date_of_birth ||
                "-"
              }
              readOnly
            />

            <BoxFill
              label="ថ្ងៃខែឆ្នាំចូលរួម"
              value={
                form.joinedAt || "-"
              }
              readOnly
            />

            <BoxFill
              label="សញ្ជាតិ"
              value={
                form.nationality ||
                "-"
              }
              readOnly
            />

            <BoxFill
              label="ជនជាតិ"
              value={
                form.ethnicity || "-"
              }
              readOnly
            />

            <BoxFill
              label="តួនាទី"
              value={
                form.role || "-"
              }
              readOnly
            />

            <BoxFill
              label="កាំ"
              value={
                form.level || "-"
              }
              readOnly
            />

            <BoxFill
              label="ទំហំអាវ"
              value={
                form.shirtSize || "-"
              }
              readOnly
            />

            <BoxFill
              label="ស្ថានភាព"
              value={
                form.status || "-"
              }
              readOnly
            />

            <BoxFill
              label="សាសនា"
              value={
                form.religion || "-"
              }
              readOnly
            />
          </div>

          {/* CV upload remains editable */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-text-primary
              "
            >
              បញ្ចូល CV
            </label>

            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              className="hidden"
              onChange={
                handleFileChange
              }
            />

            {!cvFile ? (
              <button
                type="button"
                onClick={() =>
                  fileRef.current?.click()
                }
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
                  transition
                  hover:border-primary/40
                  hover:bg-gray-100
                "
              >
                <div
                  className="
                    mb-3
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-100
                  "
                >
                  <UploadCloud
                    size={23}
                    className="text-gray-400"
                  />
                </div>

                <p className="text-sm font-semibold text-primary">
                  បញ្ចូលឯកសារ
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  JPG, DOCX, PDF, PNG
                  (មិនលើស 5MB)
                </p>
              </button>
            ) : (
              <div
                className="
                  relative
                  flex
                  min-h-[190px]
                  w-full
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  px-6
                  text-center
                "
              >
                <button
                  type="button"
                  onClick={removeFile}
                  aria-label="លុបឯកសារ"
                  className="
                    absolute
                    right-3
                    top-3
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    text-red-500
                    shadow-sm
                    transition
                    hover:bg-red-50
                  "
                >
                  <X size={17} />
                </button>

                <div
                  className="
                    mb-3
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-secondary-light
                  "
                >
                  <FileText
                    size={24}
                    className="text-primary"
                  />
                </div>

                <p
                  className="
                    max-w-[240px]
                    truncate
                    text-sm
                    font-semibold
                    text-text-primary
                  "
                  title={cvFile.name}
                >
                  {cvFile.name}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {formatFileSize(
                    cvFile.size,
                  )}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    fileRef.current?.click()
                  }
                  className="
                    mt-3
                    text-xs
                    font-semibold
                    text-primary
                    hover:underline
                  "
                >
                  ផ្លាស់ប្តូរឯកសារ
                </button>
              </div>
            )}

            {fileError && (
              <p className="mt-2 text-xs font-medium text-red-500">
                {fileError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Only the CV can be saved */}

      <div className="flex justify-end">
        <SaveButton
          onClick={handleSave}
          disabled={
            !cvFile || saving
          }
        />
      </div>
    </div>
  );
}