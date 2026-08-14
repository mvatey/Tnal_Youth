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
import FormSelect from "@/components/forms/FormSelect";
import SaveButton from "@/components/forms/SaveButton";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const GENDER_OPTIONS = [
  { value: "MALE", label: "ប្រុស" },
  { value: "FEMALE", label: "ស្រី" },
];

const TSHIRT_SIZE_OPTIONS = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "2XL", label: "2XL" },
  { value: "3XL", label: "3XL" },
];

function normalizeLookupOptions(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.content)
        ? data.content
        : [];

  return list
    .map((item) => ({
      value:
        item?.value != null
          ? String(item.value)
          : item?.id != null
            ? String(item.id)
            : "",
      label:
        item?.labelKm ||
        item?.label_km ||
        item?.labelEn ||
        item?.label_en ||
        item?.code ||
        "",
    }))
    .filter((option) => option.value !== "" && option.label !== "");
}

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
    refetch,
  } = useCurrentMember();

  const [form, setForm] =
    useState(null);

  const [cvFile, setCvFile] =
    useState(null);

  const [fileError, setFileError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  /* Lookup options for the editable dropdown fields, matching the
   * same options the Member module's personal-info tab uses so the
   * two forms behave the same way. */
  const [nationalityOptions, setNationalityOptions] = useState([]);
  const [ethnicityOptions, setEthnicityOptions] = useState([]);
  const [religionOptions, setReligionOptions] = useState([]);
  const [memberLevelOptions, setMemberLevelOptions] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadLookups() {
      setLookupsLoading(true);
      const [nationalities, ethnicities, religions, memberLevels] = await Promise.all([
        fetch("/api/lookups/nationalities", { credentials: "include", cache: "no-store" })
          .then((response) => (response.ok ? response.json() : []))
          .catch(() => []),
        fetch("/api/lookups/ethnicities", { credentials: "include", cache: "no-store" })
          .then((response) => (response.ok ? response.json() : []))
          .catch(() => []),
        fetch("/api/lookups/religions", { credentials: "include", cache: "no-store" })
          .then((response) => (response.ok ? response.json() : []))
          .catch(() => []),
        fetch("/api/lookups/member-levels", { credentials: "include", cache: "no-store" })
          .then((response) => (response.ok ? response.json() : []))
          .catch(() => []),
      ]);

      if (!active) return;

      setNationalityOptions(normalizeLookupOptions(nationalities));
      setEthnicityOptions(normalizeLookupOptions(ethnicities));
      setReligionOptions(normalizeLookupOptions(religions));
      setMemberLevelOptions(normalizeLookupOptions(memberLevels));
      setLookupsLoading(false);
    }

    loadLookups();

    return () => {
      active = false;
    };
  }, []);

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

      nationalityId:
        member.nationalityId != null
          ? String(member.nationalityId)
          : "",

      ethnicityId:
        member.ethnicityId != null
          ? String(member.ethnicityId)
          : "",

      role: getRoleLabel(
        member.role,
      ),

      levelId:
        member.levelId != null
          ? String(member.levelId)
          : "",

      shirtSize:
        member.shirtSize && member.shirtSize !== "-"
          ? member.shirtSize
          : "",

      status:
        member.status || "",

      religionId:
        member.religionId != null
          ? String(member.religionId)
          : "",

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

  /* Object URLs must be created/revoked deliberately, otherwise every
   * render leaks a new blob URL. When no new file is picked yet, fall
   * back to the member's already-saved CV so it can still be viewed. */
  const [cvObjectUrl, setCvObjectUrl] = useState("");

  useEffect(() => {
    if (!cvFile) {
      setCvObjectUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(cvFile);
    setCvObjectUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [cvFile]);

  const cvViewUrl =
    cvObjectUrl ||
    (member?.cvFileId ? `/api/files/${member.cvFileId}/content` : "");

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
      /*
       * The dropdown fields below are now bound directly to lookup
       * IDs (like the Member module's personal-info tab), so there is
       * no more guessing a label back into an ID here — that guess
       * was the reason "save" used to fail whenever the typed text
       * did not exactly match a lookup label.
       */
      await readJson(await fetch("/api/backend/my-account/personal-info", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone === "-" ? null : form.phone,
          email: form.email === "-" ? null : form.email,
          full_name_km: form.name_kh,
          full_name_en: form.name_en === "-" ? null : form.name_en,
          gender: form.gender || null,
          nationality_id: form.nationalityId ? Number(form.nationalityId) : null,
          religion_id: form.religionId ? Number(form.religionId) : null,
          ethnicity_id: form.ethnicityId ? Number(form.ethnicityId) : null,
          date_of_birth: form.date_of_birth || null,
          current_address: form.currentAddress || member.currentAddress || null,
          permanent_address: form.permanentAddress || member.permanentAddress || null,
          tshirt_size: form.shirtSize || null,
          member_level_id: form.levelId ? Number(form.levelId) : null,
          joined_on: form.joinedAt === "-" ? null : form.joinedAt,
        }),
      }));

      if (cvFile) {
        const upload = new FormData();
        upload.append("file", cvFile);
        await readJson(await fetch("/api/backend/my-account/personal-info/cv", {
          method: "PUT",
          credentials: "include",
          body: upload,
        }));
      }

      setCvFile(null);
      if (fileRef.current) fileRef.current.value = "";

      /*
       * Without this, the form kept showing the pre-save values until
       * a manual page reload, because useCurrentMember() only fetches
       * once on mount and this component never told it about the new
       * data. Re-fetching here updates `member`, which the effect
       * above already re-derives `form` from.
       */
      await refetch();

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
    onChange={handleChange("name_kh")}
  />

  <BoxFill
    label="ឈ្មោះជាអក្សរឡាតាំង"
    name="name_en"
    value={form.name_en || "-"}
    onChange={handleChange("name_en")}
  />

  {/* Editable */}

  <FormSelect
    label="ភេទ"
    name="gender"
    value={form.gender || ""}
    placeholder="ជ្រើសរើសភេទ"
    onChange={handleChange("gender")}
    options={GENDER_OPTIONS}
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
    onChange={handleChange("email")}
  />

  <BoxFill
    label="លេខទូរស័ព្ទ"
    name="phone"
    type="tel"
    value={form.phone || "-"}
    onChange={handleChange("phone")}
  />

  {/* Editable */}

  <FormSelect
    label="ជនជាតិ"
    name="ethnicityId"
    value={form.ethnicityId || ""}
    placeholder="ជ្រើសរើសជនជាតិ"
    onChange={handleChange("ethnicityId")}
    options={ethnicityOptions}
    loading={lookupsLoading}
  />

  <FormSelect
    label="សញ្ជាតិ"
    name="nationalityId"
    value={form.nationalityId || ""}
    placeholder="ជ្រើសរើសសញ្ជាតិ"
    onChange={handleChange("nationalityId")}
    options={nationalityOptions}
    loading={lookupsLoading}
  />

  <FormSelect
    label="សាសនា"
    name="religionId"
    value={form.religionId || ""}
    placeholder="ជ្រើសរើសសាសនា"
    onChange={handleChange("religionId")}
    options={religionOptions}
    loading={lookupsLoading}
  />

  {/* Read only */}

  <BoxFill
    label="ថ្ងៃខែឆ្នាំចូលរួម"
    name="joinedAt"
    value={form.joinedAt || "-"}
    type="date"
    onChange={handleChange("joinedAt")}
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

  <FormSelect
    label="កម្រិតសមាជិក (កាំ)"
    name="levelId"
    value={form.levelId || ""}
    placeholder="ជ្រើសរើសកម្រិតសមាជិក"
    onChange={handleChange("levelId")}
    options={memberLevelOptions}
    loading={lookupsLoading}
  />

  {/* Editable */}

  <FormSelect
    label="ទំហំអាវ"
    name="shirtSize"
    value={form.shirtSize || ""}
    placeholder="ជ្រើសរើសទំហំអាវ"
    onChange={handleChange("shirtSize")}
    options={TSHIRT_SIZE_OPTIONS}
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

            {!cvFile && !member?.cvFileId ? (
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
                {cvFile && (
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
                )}

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
                  title={cvFile ? cvFile.name : "CV"}
                >
                  {cvFile ? cvFile.name : "CV"}
                </p>

                {cvFile && (
                  <p className="mt-1 text-xs text-gray-400">
                    {formatFileSize(
                      cvFile.size,
                    )}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-4">
                  {cvViewUrl && (
                    <a
                      href={cvViewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      មើលឯកសារ
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      fileRef.current?.click()
                    }
                    className="
                      text-xs
                      font-semibold
                      text-primary
                      hover:underline
                    "
                  >
                    ផ្លាស់ប្តូរឯកសារ
                  </button>
                </div>
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
