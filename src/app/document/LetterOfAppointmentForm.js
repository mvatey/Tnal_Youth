"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

import FormSelect from "@/components/forms/FormSelect";
import DocumentActionButton from "@/components/forms/documentActionbutton";
import FileTooLargeModal from "@/components/popup/FileTooLargeModal";
import { useLanguage } from "@/context/LanguageContext";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

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
  const { t, label, isEnglish } = useLanguage();
  const fileInputRef = useRef(null);

  const [showValidationError, setShowValidationError] = useState(false);

  const [fileError, setFileError] = useState("");
  const [fileTooLargeMessage, setFileTooLargeMessage] = useState("");
  const [branches, setBranches] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [dataError, setDataError] = useState("");

  const branchOptions = useMemo(() => branches.map((branch) => ({
    label: label(branch, getBranchName(branch)),
    labelKm: branch.labelKm || branch.label_km || branch.nameKm || branch.name_km || branch.name_kh,
    labelEn: branch.labelEn || branch.label_en || branch.nameEn || branch.name_en,
    value: String(branch.value ?? branch.id ?? branch.branchId ?? branch.branch_id ?? ""),
  })).filter((option) => option.label && option.value), [branches, label]);

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
        if (!response.ok) throw new Error(body?.message || t("documentPage.loadBranchesFailed"));
        if (active) setBranches(Array.isArray(body) ? body : (body?.data ?? []));
      })
      .catch((error) => active && setDataError(error.message || t("documentPage.loadBranchesFailed")));
    return () => { active = false; };
  }, [t]);

  useEffect(() => {
    if (!form.branchId) {
      setMembers([]);
      return undefined;
    }

    const controller = new AbortController();
    setLoadingMembers(true);
    setDataError("");
    (async () => {
      const rows = [];
      let page = 0;
      let totalPages = 1;
      do {
        const response = await fetch(
          `/api/members?branchId=${encodeURIComponent(form.branchId)}&page=${page}&size=100`,
          { cache: "no-store", signal: controller.signal },
        );
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message || t("documentPage.loadMembersFailed"));
        const pageRows = body?.content ?? body?.data?.content ?? body?.data ?? body;
        rows.push(...(Array.isArray(pageRows) ? pageRows : []));
        totalPages = Math.max(1, Number(body?.totalPages ?? body?.data?.totalPages) || 1);
        page += 1;
      } while (page < totalPages);
      setMembers(rows);
    })()
      .catch((error) => {
        if (error.name !== "AbortError") setDataError(error.message || t("documentPage.loadMembersFailed"));
      })
      .finally(() => setLoadingMembers(false));

    return () => controller.abort();
  }, [form.branchId, t]);

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
      branch: label(branch, getBranchName(branch)),
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
      member: isEnglish ? getMemberNameEn(member) || getMemberNameKh(member) : getMemberNameKh(member) || getMemberNameEn(member),
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
      setFileError(t("documentPage.selectAppointmentFileType"));

      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileTooLargeMessage(t("documentPage.fileMaxSize"));

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

        title: form.title?.trim() || t("documentPage.appointmentLetter"),

        type: t("documentPage.appointmentLetter"),

        documentType: t("documentPage.appointmentLetter"),

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
        bg-bg-page-white
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
            label={t("documentPage.branch")}
            name="branchId"
            value={form.branchId || ""}
            onChange={handleBranchChange}
            placeholder={t("documentPage.selectBranch")}
            options={branchOptions}
          />

          <div>
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-text-primary">
              <span>{t("documentPage.selectBranchMember")}</span>
              <span>{selectedMemberIds.length > 0 ? t("documentPage.onePerson") : t("documentPage.zeroPeople")}</span>
            </div>
            <div className="h-[255px] overflow-y-auto rounded-xl border border-border bg-bg-page-white p-3">
              {!form.branchId ? (
                <p className="py-20 text-center text-sm text-text-mute">{t("documentPage.selectBranchFirst")}</p>
              ) : loadingMembers ? (
                <p className="py-20 text-center text-sm text-text-mute">{t("documentPage.loadingMembers")}</p>
              ) : members.length === 0 ? (
                <p className="py-20 text-center text-sm text-text-mute">{t("documentPage.noMembersInBranch")}</p>
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
                          {(isEnglish ? getMemberNameEn(member) || getMemberNameKh(member) : getMemberNameKh(member) || getMemberNameEn(member)) || `#${memberId}`}
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
            {t("documentPage.uploadAppointmentLetter")}
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
                bg-bg-page-gray
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
                  text-text-secondary
                "
              />

              <p
                className="
                  text-lg
                  text-text-mute
                "
              >
                {t("documentPage.appointmentFileHint")}
              </p>

              <p
                className="
                  mt-2
                  text-lg
                  text-text-mute
                "
              >
                {t("documentPage.templateRatio")}
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
                bg-bg-page-gray
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
                      text-text-mute
                    "
                  >
                    {form.fileType} · {form.fileSize}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={removeFile}
                aria-label={t("documentPage.removeDocument")}
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
                  bg-bg-page-white
                  text-error
                  shadow-sm
                  transition
                  hover:bg-error-bg
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
                text-error
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
                  text-error
                "
            >
              {t("documentPage.appointmentRequiredInfo")}
            </p>
          )}
          <div className="mt-12">
            <DocumentActionButton
              onCancel={onClose}
              onCreate={handleSave}
              isValid={isFormValid}
              saving={saving}
              cancelText={t("documentPage.cancel")}
              createText={t("documentPage.save")}
              savingText={t("documentPage.saving")}
            />
          </div>
        </div>
      </div>

      <FileTooLargeModal
        open={Boolean(fileTooLargeMessage)}
        message={fileTooLargeMessage}
        onClose={() => setFileTooLargeMessage("")}
      />
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
