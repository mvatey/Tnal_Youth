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

async function readJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || body.error || "Something went wrong");
  return body.data || body;
}

async function resolveLookupId(type, label, existingId) {
  const value = String(label || "").trim();
  if (!value || value === "-") return null;
  const options = await readJson(await fetch(`/api/lookups/${type}`, {
    credentials: "include",
    cache: "no-store",
  }));
  const match = (Array.isArray(options) ? options : []).find((option) =>
    [option.labelKm, option.label_km, option.labelEn, option.label_en, option.label, option.code]
      .filter(Boolean)
      .some((candidate) => String(candidate).trim().toLowerCase() === value.toLowerCase()),
  );
  if (match) return Number(match.value ?? match.id);
  if (existingId) throw new Error(`Please choose a valid ${type.replaceAll("-", " ")} value`);
  throw new Error(`The ${type.replaceAll("-", " ")} value does not exist`);
}

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

  const handleChange = (field) => (event) => {
  setForm((previousForm) => ({
    ...previousForm,
    [field]: event.target.value,
  }));
};

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
  setSaving(true);

  try {
    const formData = new FormData();

    formData.append(
      "memberId",
      String(member.id),
    );

    if (cvFile) {
      formData.append("cv", cvFile);
    }

    // TODO:
    // Replace this with your backend API later.

    alert("រក្សាទុកព័ត៌មានបានជោគជ័យ");
  } catch (error) {
    console.error(error);

    alert("រក្សាទុកព័ត៌មានមិនបានជោគជ័យ");
  } finally {
    setSaving(false);
  }
};

  const handleRealSave = async () => {
    setSaving(true);
    try {
      let cvFileId = member.cvFileId || null;
      if (cvFile) {
        const upload = new FormData();
        upload.append("file", cvFile);
        const uploaded = await readJson(await fetch("/api/backend/files/attachments", {
          method: "POST",
          credentials: "include",
          body: upload,
        }));
        cvFileId = uploaded.id;
      }

      const [nationalityId, ethnicityId, religionId] = await Promise.all([
        resolveLookupId("nationalities", form.nationality, member.nationalityId),
        resolveLookupId("ethnicities", form.ethnicity, member.ethnicityId),
        resolveLookupId("religions", form.religion, member.religionId),
      ]);

      await readJson(await fetch("/api/backend/my-account", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: member.phone,
          email: member.email === "-" ? null : member.email,
          fullNameKm: member.name_kh,
          fullNameEn: member.name_en === "-" ? null : member.name_en,
          gender: form.gender === "-" ? null : form.gender,
          nationalityId,
          religionId,
          ethnicityId,
          dateOfBirth: form.date_of_birth || null,
          placeOfBirth: member.placeOfBirth || null,
          currentAddress: member.currentAddress || null,
          permanentAddress: member.permanentAddress || null,
          bio: member.bio || null,
          tshirtSize: form.shirtSize === "-" ? null : form.shirtSize,
          branchId: member.branchId,
          memberStatusId: member.statusId,
          memberLevelId: member.levelId,
          joinedOn: member.joinedAt === "-" ? null : member.joinedAt,
          profilePhotoId: null,
          cvFileId,
        }),
      }));

      setCvFile(null);
      if (fileRef.current) fileRef.current.value = "";
      alert("Saved successfully");
    } catch (saveError) {
      console.error(saveError);
      alert(saveError.message || "Unable to save My Account information");
    } finally {
      setSaving(false);
    }
  };

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
  {/* Read only */}

  <BoxFill
    label="ឈ្មោះជាភាសាខ្មែរ"
    name="name_kh"
    value={form.name_kh || "-"}
    readOnly
  />

  <BoxFill
    label="ឈ្មោះជាអក្សរឡាតាំង"
    name="name_en"
    value={form.name_en || "-"}
    readOnly
  />

  {/* Editable */}

  <BoxFill
    label="ភេទ"
    name="gender"
    value={form.gender || ""}
    placeholder="បញ្ចូលភេទ"
    onChange={handleChange("gender")}
  />

  <BoxFill
    label="ថ្ងៃខែឆ្នាំកំណើត"
    name="date_of_birth"
    type="date"
    value={form.date_of_birth || ""}
    onChange={handleChange("date_of_birth")}
  />

  {/* Read only */}

  <BoxFill
    label="អ៊ីមែល"
    name="email"
    type="email"
    value={form.email || "-"}
    readOnly
  />

  <BoxFill
    label="លេខទូរស័ព្ទ"
    name="phone"
    type="tel"
    value={form.phone || "-"}
    readOnly
  />

  {/* Editable */}

  <BoxFill
    label="ជនជាតិ"
    name="ethnicity"
    value={form.ethnicity || ""}
    placeholder="បញ្ចូលជនជាតិ"
    onChange={handleChange("ethnicity")}
  />

  <BoxFill
    label="សញ្ជាតិ"
    name="nationality"
    value={form.nationality || ""}
    placeholder="បញ្ចូលសញ្ជាតិ"
    onChange={handleChange("nationality")}
  />

  <BoxFill
    label="សាសនា"
    name="religion"
    value={form.religion || ""}
    placeholder="បញ្ចូលសាសនា"
    onChange={handleChange("religion")}
  />

  {/* Read only */}

  <BoxFill
    label="ថ្ងៃខែឆ្នាំចូលរួម"
    name="joinedAt"
    value={form.joinedAt || "-"}
    readOnly
  />

  <BoxFill
    label="សាខា"
    name="branch"
    value={form.branch || "-"}
    readOnly
  />

  <BoxFill
    label="តួនាទី"
    name="role"
    value={form.role || "-"}
    readOnly
  />

  <BoxFill
    label="កម្រិតសមាជិក (កាំ)"
    name="level"
    value={form.level || "-"}
    readOnly
  />

  {/* Editable */}

  <BoxFill
    label="ទំហំអាវ"
    name="shirtSize"
    value={form.shirtSize || ""}
    placeholder="បញ្ចូលទំហំអាវ"
    onChange={handleChange("shirtSize")}
  />

  {/* Read only */}

  <BoxFill
    label="ស្ថានភាព"
    name="status"
    value={form.status || "-"}
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
                    className="text-secondary"
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
          onClick={handleRealSave}
          disabled={
            saving || !member.isLinkedMember
          }
        />
      </div>
    </div>
  );
}
