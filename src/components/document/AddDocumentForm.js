"use client";

import { useRef, useState } from "react";
import {
  FileText,
  UploadCloud,
  X,
} from "lucide-react";

import PopupCard from "@/components/popup/PopupCard";
import BoxFill from "@/components/forms/boxFill";
import FormSelect from "@/components/forms/FormSelect";
import FormActionButtons from "@/components/forms/FormActionButton";
import { useLanguage } from "@/context/LanguageContext";

const FALLBACK_BRANCH_OPTIONS = [
  {
    label: "សាខាភ្នំពេញ",
    value: "សាខាភ្នំពេញ",
  },
  {
    label: "សាខាសៀមរាប",
    value: "សាខាសៀមរាប",
  },
  {
    label: "សាខាបាត់ដំបង",
    value: "សាខាបាត់ដំបង",
  },
  {
    label: "សាខាកំពង់ចាម",
    value: "សាខាកំពង់ចាម",
  },
  {
    label: "សាខាកណ្ដាល",
    value: "សាខាកណ្ដាល",
  },
];

const FALLBACK_DOCUMENT_TYPE_OPTIONS = [
  {
    label: "វិញ្ញាបនបត្រ",
    value: "វិញ្ញាបនបត្រ",
  },
  {
    label: "លិខិតតែងតាំង",
    value: "លិខិតតែងតាំង",
  },
];

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

export default function AddDocumentForm({
  form,
  setForm,
  onSave,
  onClose,
  branchOptions = FALLBACK_BRANCH_OPTIONS,
  documentTypeOptions = FALLBACK_DOCUMENT_TYPE_OPTIONS,
  saving = false,
}) {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [
    showValidationError,
    setShowValidationError,
  ] = useState(false);

  const [fileError, setFileError] =
    useState("");

  const files = Array.isArray(
    form.files,
  )
    ? form.files
    : [];

  const updateField =
    (field) => (event) => {
      const value =
        event.target.value;

      setForm((previousForm) => ({
        ...previousForm,
        [field]: value,
      }));

      setShowValidationError(false);
    };

  const handleFileChange = (
    event,
  ) => {
    const selectedFiles =
      Array.from(
        event.target.files || [],
      );

    setFileError("");
    setShowValidationError(false);

    if (
      selectedFiles.length === 0
    ) {
      return;
    }

    const oversizedFiles =
      selectedFiles.filter(
        (file) =>
          file.size >
          MAX_FILE_SIZE,
      );

    if (
      oversizedFiles.length > 0
    ) {
      setFileError(
        t("documentPage.fileTooLarge"),
      );

      event.target.value = "";
      return;
    }

    const newFiles =
      selectedFiles.map(
        (file) => ({
          id: createFileId(file),
          file,
          name: file.name,
          fileFormat: getFileType(file.name),
          mimeType:
            file.type,
          size: formatFileSize(
            file.size,
          ),
          rawSize:
            file.size,
          previewUrl:
            URL.createObjectURL(
              file,
            ),
        }),
      );

    setForm(
      (previousForm) => ({
        ...previousForm,
        files: [
          ...(
            previousForm.files ||
            []
          ),
          ...newFiles,
        ],
      }),
    );

    event.target.value = "";
  };

  const removeFile = (
    fileId,
  ) => {
    setForm(
      (previousForm) => {
        const selectedFile = (
          previousForm.files ||
          []
        ).find(
          (item) =>
            item.id === fileId,
        );

        if (
          selectedFile?.previewUrl
        ) {
          URL.revokeObjectURL(
            selectedFile.previewUrl,
          );
        }

        return {
          ...previousForm,
          files: (
            previousForm.files ||
            []
          ).filter(
            (item) =>
              item.id !== fileId,
          ),
        };
      },
    );

    setFileError("");
    setShowValidationError(false);
  };

  const isFormValid =
    Boolean(
      form.title?.trim(),
    ) &&
    Boolean(form.branch) &&
    Boolean(form.type) &&
    Boolean(
      form.description?.trim(),
    ) &&
    files.length > 0;

  const handleSave = (event) => {
  event.preventDefault();

  if (!isFormValid) {
    setShowValidationError(true);
    return;
  }

  setShowValidationError(false);

  const totalSize = files.reduce(
    (total, currentFile) =>
      total +
      (
        currentFile.rawSize ||
        currentFile.file?.size ||
        0
      ),
    0,
  );

  const selectedDocumentType =
    String(form.type || "").trim();

  const newDocument = {
    ...form,

    title: form.title.trim(),

    description:
      form.description.trim(),

    // This comes only from the user dropdown.
    type: selectedDocumentType,

    documentType:
      selectedDocumentType,

    // PDF/JPG is stored separately.
    fileFormat:
      files[0]?.fileFormat || "",

    date:
      form.date ||
      getTodayLocalDate(),

    files,

    fileCount: files.length,

    size:
      formatFileSize(totalSize),

    image:
      getFirstImagePreview(files) ||
      "/document.jpg",
  };

  onSave?.(newDocument);
};

  return (
    <PopupCard
      size="md"
      onClose={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("documentPage.close")}
        className="
          absolute
          right-4
          top-4
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          bg-transparent
          transition-colors
          hover:bg-bg-page-gray
        "
      >
        <X
          size={18}
          className="text-text-secondary"
        />
      </button>

      <h2
        className="
          mb-6
          text-lg
          font-bold
          text-primary
        "
      >
        {t("documentPage.addDocument")}
      </h2>

      <form
        onSubmit={handleSave}
      >
        <div className="space-y-4">
          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
            "
          >
            <BoxFill
  label={t("documentPage.documentName")}
  name="title"
  placeholder={t("documentPage.enterDocumentName")}
  value={form.title || ""}
  onChange={updateField("title")}
/>

            <FormSelect
              label={t("documentPage.branch")}
              placeholder={t("documentPage.selectBranch")}
              value={
                form.branch ||
                ""
              }
              onChange={
                updateField(
                  "branch",
                )
              }
              options={
                branchOptions
              }
            />
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-1
            "
          >
            <FormSelect
              label={t("documentPage.documentType")}
              placeholder={t("documentPage.selectDocumentType")}
              value={
                form.type || ""
              }
              onChange={
                updateField(
                  "type",
                )
              }
              options={
                documentTypeOptions
              }
            />
          </div>

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
              "
            >
              {t("documentPage.identifier")}
            </label>

            <textarea
              rows={3}
              value={
                form.description ||
                ""
              }
              onChange={
                updateField(
                  "description",
                )
              }
              placeholder={t("documentPage.enterIdentifier")}
              className="
                w-full
                resize-none
                rounded-lg
                border
                border-border
                p-3
                text-sm
                outline-none
                placeholder:text-text-mute
                focus:border-primary
              "
            />
          </div>

          <div>
            <input
              ref={
                fileInputRef
              }
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={
                handleFileChange
              }
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                flex
                h-[120px]
                w-full
                cursor-pointer
                flex-col
                items-center
                justify-center
                rounded-xl
                border-2
                border-dashed
                border-border
                transition
                hover:border-primary
                hover:bg-bg-page-gray
              "
            >
              <UploadCloud
                size={30}
                className="
                  mb-2
                  text-text-mute
                "
              />

              <p
                className="
                  text-sm
                  font-semibold
                  text-primary
                "
              >
                {t("documentPage.uploadDocument")}
              </p>

              <p
                className="
                  text-xs
                  text-text-mute
                "
              >
                {t("documentPage.fileHint")}
              </p>
            </button>

            {files.length > 0 && (
              <div
                className="
                  mt-3
                  space-y-2
                "
              >
                {files.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-lg
                        border
                        border-border
                        px-3
                        py-2
                      "
                    >
                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-3
                        "
                      >
                        <FileText
                          size={20}
                          className="
                            shrink-0
                            text-primary
                          "
                        />

                        <div className="min-w-0">
                          <p
                            className="
                              truncate
                              text-sm
                              font-medium
                              text-text-secondary
                            "
                          >
                            {
                              item.name
                            }
                          </p>

                          <p className="text-xs text-text-mute">
  {form.type || t("documentPage.noTypeSelected")} · {item.size}
</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFile(
                            item.id,
                          )
                        }
                        aria-label={t("documentPage.removeDocument")}
                        className="
                          ml-3
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          text-text-mute
                          transition-colors
                          hover:bg-bg-page-gray
                          hover:text-red-500
                        "
                      >
                        <X
                          size={17}
                        />
                      </button>
                    </div>
                  ),
                )}
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
          </div>
        </div>

        {showValidationError &&
          !isFormValid && (
            <p
              className="
                mt-4
                text-xs
                font-medium
                text-error
              "
            >
              {t("documentPage.allFieldsRequired")}
            </p>
          )}

        <FormActionButtons
          onCancel={onClose}
          isValid={
            isFormValid
          }
          saveText={t("documentPage.save")}
          cancelText={t("documentPage.cancel")}
        />
      </form>
    </PopupCard>
  );
}

function createFileId(file) {
  const randomId =
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  return [
    file.name,
    file.size,
    file.lastModified,
    randomId,
  ].join("-");
}

function getFirstImagePreview(
  files,
) {
  const imageFile =
    files.find((item) =>
      item.mimeType?.startsWith(
        "image/",
      ),
    );

  return (
    imageFile?.previewUrl ||
    null
  );
}

function getFileType(
  fileName,
) {
  const extension =
    fileName
      ?.split(".")
      .pop()
      ?.toLowerCase() ||
    "";

  const typeMap = {
    pdf: "PDF",
    doc: "Word",
    docx: "Word",
    xls: "Excel",
    xlsx: "Excel",
    jpg: "JPG",
    jpeg: "JPEG",
    png: "PNG",
  };

  return (
    typeMap[extension] ||
    "ឯកសារ"
  );
}

function formatFileSize(
  bytes,
) {
  if (!bytes) {
    return "0KB";
  }

  const megabytes =
    bytes /
    (1024 * 1024);

  if (megabytes < 1) {
    return `${(
      bytes / 1024
    ).toFixed(1)}KB`;
  }

  return `${megabytes.toFixed(
    1,
  )}MB`;
}

function getTodayLocalDate() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1,
    ).padStart(2, "0");

  const day =
    String(
      now.getDate(),
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
