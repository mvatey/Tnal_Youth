"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

import FormSelect from "@/components/forms/FormSelect";
import DocumentActionButton from "@/components/forms/documentActionbutton";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_EXTENSIONS = ["jpg", "jpeg", "png", "pdf", "doc", "docx"];

function getBranchName(branch) {
  if (!branch) return "";

  if (typeof branch === "string") {
    return branch;
  }

  return branch.labelKm || branch.label_km || branch.nameKm || branch.name_km || branch.labelEn || branch.label_en || branch.nameEn || branch.name_en || branch.name_kh || branch.name_en || branch.name || "";
}

function getMemberNameKh(member) {
  return member?.name_kh || member?.fullNameKm || member?.full_name_km || "";
}

function getMemberNameEn(member) {
  return member?.name_en || member?.fullNameEn || member?.full_name_en || "";
}

function getMemberJoinedDate(member) {
  return (
    member?.joinedAt ||
    member?.joined_at ||
    member?.joinDate ||
    member?.joinedDate ||
    ""
  );
}

export default function LetterOfAppointmentForm({
  form,
  setForm,
  onSave,
  onClose,
  saving = false,
}) {
  const fileInputRef = useRef(null);

  const [showValidationError, setShowValidationError] = useState(false);

  const [fileError, setFileError] = useState("");
  const [branches, setBranches] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [dataError, setDataError] = useState("");

  const branchOptions = useMemo(() => branches.map((branch) => ({
    label: getBranchName(branch),
    value: String(branch.value ?? branch.id ?? branch.branchId ?? branch.branch_id ?? ""),
  })).filter((option) => option.label && option.value), [branches]);

  const selectedMemberIds = useMemo(
    () => (Array.isArray(form.memberIds) ? form.memberIds.map(String) : form.memberId ? [String(form.memberId)] : []),
    [form.memberId, form.memberIds],
  );

  const selectedMembers = useMemo(
    () => members.filter((member) => selectedMemberIds.includes(String(member.id))),
    [members, selectedMemberIds],
  );

  useEffect(() => {
    let active = true;
    fetch("/api/lookups/branches", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || "Unable to load branches.");
        if (active) setBranches(Array.isArray(body) ? body : (body?.data ?? []));
      })
      .catch((error) => active && setDataError(error.message || "Unable to load branches."));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!form.branchId) {
      setMembers([]);
      return undefined;
    }

    const controller = new AbortController();
    setLoadingMembers(true);
    setDataError("");
    fetch(`/api/members?branchId=${encodeURIComponent(form.branchId)}&page=0&size=100`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || "Unable to load members.");
        const rows = body?.content ?? body?.data?.content ?? body?.data ?? body;
        setMembers(Array.isArray(rows) ? rows : []);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setDataError(error.message || "Unable to load members.");
      })
      .finally(() => setLoadingMembers(false));

    return () => controller.abort();
  }, [form.branchId]);

  useEffect(() => {
    return () => {
      if (form.templatePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(form.templatePreview);
      }
    };
  }, [form.templatePreview]);

  const updateField = (field) => (event) => {
    const value = event.target.value;

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setShowValidationError(false);
  };

  const handleBranchChange = (event) => {
    const branchId = event.target.value;
    const branch = branches.find((item) => String(item.value ?? item.id ?? item.branchId ?? item.branch_id) === String(branchId));
    setForm((previous) => ({
      ...previous,
      branchId,
      branch: getBranchName(branch),
      memberId: "",
      memberIds: [],
      selectedMembers: [],
    }));
    setShowValidationError(false);
  };

  const selectMember = (member) => {
    const memberId = String(member.id);
    setForm((previous) => ({
      ...previous,
      memberId,
      memberIds: [memberId],
      selectedMembers: [member],
      member: getMemberNameKh(member),
      memberNameEn: getMemberNameEn(member),
    }));
    setShowValidationError(false);
  };

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files?.[0];

    setFileError("");
    setShowValidationError(false);

    if (!selectedFile) {
      return;
    }

    const extension = selectedFile.name.split(".").pop()?.toLowerCase() || "";

    if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
      setFileError("សូមជ្រើសរើសឯកសារ JPG, PNG, PDF ឬ DOCX។");

      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError("ទំហំឯកសារមិនអាចលើសពី 5MB បានទេ។");

      event.target.value = "";
      return;
    }

    if (form.templatePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(form.templatePreview);
    }

    const previewUrl = URL.createObjectURL(selectedFile);

    setForm((previous) => ({
      ...previous,

      templateFile: selectedFile,

      templatePreview: previewUrl,

      fileName: selectedFile.name,

      fileType: extension.toUpperCase(),

      fileSize: formatFileSize(selectedFile.size),
    }));

    event.target.value = "";
  };

  const removeFile = () => {
    if (form.templatePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(form.templatePreview);
    }

    setForm((previous) => ({
      ...previous,

      templateFile: null,
      templatePreview: "",
      fileName: "",
      fileType: "",
      fileSize: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setFileError("");
    setShowValidationError(false);
  };

  const isFormValid =
    Boolean(form.branchId) &&
    selectedMemberIds.length > 0 &&
    Boolean(form.templateFile);

  const handleSave = async () => {
    if (!isFormValid) {
      setShowValidationError(true);
      return;
    }

    setShowValidationError(false);

    try {
      await onSave?.({
        ...form,

        title: form.title?.trim() || "លិខិតតែងតាំង",

        type: "លិខិតតែងតាំង",

        documentType: "លិខិតតែងតាំង",

        fileType: form.fileType || "",

        selectedMembers,
      });
    } catch (error) {
      console.error("Cannot create appointment letter:", error);

      throw error;
    }
  };

  return (
    <div
      className="
        w-full
        rounded-xl
        border
        border-[#e4e7ec]
        bg-white
        px-8
        py-8
      "
    >
      <div
        className="
          grid
          grid-cols-1
          gap-12
          xl:grid-cols-[425px_minmax(0,1fr)]
        "
      >
        {/* Left side */}
        <div className="space-y-5">
          <FormSelect
            label="សាខា"
            name="branchId"
            value={form.branchId || ""}
            onChange={handleBranchChange}
            placeholder="ជ្រើសរើសសាខា"
            options={branchOptions}
          />

          <div>
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-text-primary">
              <span>ជ្រើសរើសសមាជិកក្នុងសាខា</span>
              <span>{selectedMemberIds.length > 0 ? "1 នាក់" : "0 នាក់"}</span>
            </div>
            <div className="h-[255px] overflow-y-auto rounded-xl border border-gray-300 bg-white p-3">
              {!form.branchId ? (
                <p className="py-20 text-center text-sm text-gray-400">សូមជ្រើសរើសសាខាជាមុន</p>
              ) : loadingMembers ? (
                <p className="py-20 text-center text-sm text-gray-400">កំពុងទាញយកសមាជិក...</p>
              ) : members.length === 0 ? (
                <p className="py-20 text-center text-sm text-gray-400">មិនមានសមាជិកក្នុងសាខានេះ</p>
              ) : (
                <div className="space-y-1">
                  {members.map((member) => {
                    const memberId = String(member.id);
                    const checked = selectedMemberIds.includes(memberId);
                    return (
                      <label key={memberId} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-primary/5">
                        <input
                          type="radio"
                          name="appointmentMemberId"
                          checked={checked}
                          onChange={() => selectMember(member)}
                          className="h-4 w-4 accent-primary"
                        />
                        <span className="min-w-0 truncate text-sm text-text-primary">
                          {getMemberNameKh(member) || getMemberNameEn(member) || `#${memberId}`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            {dataError ? <p className="mt-2 text-sm text-error">{dataError}</p> : null}
          </div>
        </div>

        {/* Right side */}
        <div className="min-w-0">
          <label
            className="
              mb-3
              block
              text-sm
              font-semibold
              text-text-primary
            "
          >
            បញ្ចូលលិខិតតែងតាំង
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!form.templateFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="
                flex
                h-[266px]
                w-full
                flex-col
                items-center
                justify-center
                rounded-2xl
                border-2
                border-dashed
                border-primary
                bg-[#f8f8ff]
                px-8
                text-center
                transition
                hover:bg-primary/5
              "
            >
              <UploadCloud
                size={58}
                strokeWidth={1.8}
                className="
                  mb-6
                  text-[#52617b]
                "
              />

              <p
                className="
                  text-lg
                  text-gray-400
                "
              >
                បញ្ចូលជាប្រភេទ JPG, Docx, PDF, PNG (អតិបរមា 5MB),
              </p>

              <p
                className="
                  mt-2
                  text-lg
                  text-gray-400
                "
              >
                ទំហំគំរូ៖ 16:9
              </p>
            </button>
          ) : (
            <div
              className="
                relative
                flex
                h-[300px]
                w-full
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                border-2
                border-dashed
                border-primary
                bg-[#f8f8ff]
                p-6
              "
            >
              {form.templateFile.type?.startsWith("image/") ? (
                <img
                  src={form.templatePreview}
                  alt="appointment letter"
                  className="
                    h-full
                    w-full
                    rounded-xl
                    object-contain
                  "
                />
              ) : (
                <div className="text-center">
                  <FileText
                    size={55}
                    className="
                      mx-auto
                      mb-4
                      text-primary
                    "
                  />

                  <p
                    className="
                      max-w-[520px]
                      truncate
                      text-base
                      font-semibold
                      text-text-primary
                    "
                  >
                    {form.fileName}
                  </p>

                  <p
                    className="
                      mt-2
                      text-sm
                      text-gray-400
                    "
                  >
                    {form.fileType} · {form.fileSize}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={removeFile}
                aria-label="លុបឯកសារ"
                className="
                  absolute
                  right-4
                  top-4
                  flex
                  h-9
                  w-9
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
                <X size={19} />
              </button>
            </div>
          )}

          {fileError && (
            <p
              className="
                mt-2
                text-xs
                font-medium
                text-red-500
              "
            >
              {fileError}
            </p>
          )}

          {showValidationError && !isFormValid && (
            <p
              className="
                  mt-4
                  text-xs
                  font-medium
                  text-red-500
                "
            >
              សូមជ្រើសរើសសាខា សមាជិក បំពេញពិពណ៌នា និងបញ្ចូលឯកសារ។
            </p>
          )}
          <div className="mt-12">
            <DocumentActionButton
              onCancel={onClose}
              onCreate={handleSave}
              isValid={isFormValid}
              saving={saving}
              cancelText="បោះបង់"
              createText="រក្សាទុក"
              savingText="កំពុងរក្សាទុក..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return "0KB";

  const megabytes = bytes / (1024 * 1024);

  if (megabytes < 1) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  }

  return `${megabytes.toFixed(1)}MB`;
}
