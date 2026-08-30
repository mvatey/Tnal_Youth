"use client";

import { useEffect, useState } from "react";
import useCurrentMember from "@/hooks/useCurrentMember";
import { Trash2 } from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";
import FormSelect from "@/components/forms/FormSelect";

import SaveButton from "@/components/forms/SaveButton.js";
import BoxFill from "@/components/forms/boxFill.js";
import FormDate from "@/components/forms/FormDate.js";
import SelectArrow from "@/components/forms/SelectArrow";
import DeleteButton from "@/components/forms/DeleteButton";
import MemberAttachmentField from "@/components/forms/MemberAttachmentField";
import useUnsavedFormGuard from "@/hooks/useUnsavedFormGuard";
import { useLanguage } from "@/context/LanguageContext";

import locationData from "@/data/location.json";
import educationData from "@/data/education.json";
import { deleteMemberRecord, loadMemberRecords, saveMemberRecords, uploadMemberRecordCertificate } from "@/lib/myAccountRecords";

function createEmptyEducation() {
  return {
    id: `edu-${Date.now()}`,
    ...educationData.emptyEducation,
  };
}

export default function EducationPage() {
  const { t, label } = useLanguage();
  const isReadOnly = false;
  const { member: currentMember } = useCurrentMember();
  const memberId = String(currentMember?.id ?? "self");

  const [member, setMember] = useState(null);
  const [educations, setEducations] = useState([]);
  const [degreeOptions, setDegreeOptions] = useState([]);

  /*
   * True from the moment the user edits any education row (field
   * edit, add row) until the next successful Save — same pattern as
   * the Member module's education tab. Fed to useUnsavedFormGuard
   * below so the account tab-nav bar confirms before navigating away
   * mid-edit.
   */
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    loadMemberRecords(memberId, "education", controller.signal)
      .then((rows) => {
        setMember({ id: memberId });
        setEducations(rows.length ? rows.map((row) => ({ id: row.id, school: row.school_name || "", province: row.province_name || "", country: row.country_name || "", degree: row.education_level_id || "", startDate: row.start_date || "", endDate: row.end_date || "", attachment: row.certificate_file || null })) : [createEmptyEducation()]);
      })
      .catch((error) => { if (error.name !== "AbortError") setMember(null); });
    return () => controller.abort();
  }, [memberId]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/lookups/education-levels", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : [])
      .then((items) => setDegreeOptions((Array.isArray(items) ? items : []).map((item) => ({
        value: String(item.value ?? item.id ?? ""),
        label: label(item, item.code || ""),
      }))))
      .catch((error) => {
        if (error.name !== "AbortError") setDegreeOptions([]);
      });
    return () => controller.abort();
  }, [label]);

  function handleEducationChange(id, field, value) {
    setHasUnsavedChanges(true);

    setEducations((previous) =>
      previous.map((education) =>
        education.id === id
          ? {
              ...education,
              [field]: value,
            }
          : education,
      ),
    );
  }

  function addEducation() {
    setHasUnsavedChanges(true);

    setEducations((previous) => [
      ...previous,
      createEmptyEducation(),
    ]);
  }

  async function removeEducation(id) {
    // Fires an immediate DELETE against the server for persisted rows
    // (deleteMemberRecord no-ops for local-only draft rows) — there's
    // nothing left "unsaved" afterward, so this intentionally does
    // not set hasUnsavedChanges.
    await deleteMemberRecord(memberId, "education", id);
    setEducations((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter(
        (education) => education.id !== id,
      );
    });
  }

  async function handleSubmit(event) {
    event?.preventDefault();

    if (!member) return false;

    try {
      const current = educations.filter((item) => String(item.school || "").trim());
      const rows = await saveMemberRecords(memberId, "education", current, (item) => ({
        school_name: item.school.trim(),
        education_level_id: Number(item.degree),
        field_of_study: item.fieldOfStudy || null,
        country_name: item.country || null,
        province_name: item.province || null,
        start_date: item.startDate || null,
        end_date: item.endDate || null,
      }));
      const completedRows = await Promise.all(rows.map(async (row, index) => {
        const file = current[index]?.attachment?.pendingFile;
        return file ? uploadMemberRecordCertificate(memberId, "education", row.id, file) : row;
      }));
      setEducations(completedRows.map((row) => ({ id: row.id, school: row.school_name || "", province: row.province_name || "", country: row.country_name || "", degree: row.education_level_id || "", fieldOfStudy: row.field_of_study || "", startDate: row.start_date || "", endDate: row.end_date || "", attachment: row.certificate_file || null })));

      setHasUnsavedChanges(false);

      return true;
    } catch (saveError) {
      console.error("Cannot save education records:", saveError);

      return false;
    }
  }

  /*
   * Registers this page's dirty flag + save function with the shared
   * unsaved-changes guard (see myAcc/layout.js), so the account
   * tab-nav bar confirms before navigating away while
   * hasUnsavedChanges is true.
   */
  useUnsavedFormGuard(hasUnsavedChanges, handleSubmit);

  if (!member) {
    return (
      <div className="rounded-xl border border-error/30 bg-bg-page-white p-6">
        <p className="text-sm text-error">
          {t("memberPage.memberNotFound")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset disabled={isReadOnly} className={isReadOnly ? "member-readonly contents [&_button]:hidden" : "contents"}>
      <div className="rounded-xl border border-border bg-bg-page-white p-5">
        <div>
          <h2 className="text-lg font-bold text-primary">
            {t("memberPage.trainingLevel")}
          </h2>
        </div>

        <div className="mt-5 space-y-5">
          {educations.map((education, index) => (
            <EducationGroup
              key={education.id}
              index={index}
              education={education}
              degrees={degreeOptions}
              canDelete={educations.length > 1}
              onChange={(field, value) =>
                handleEducationChange(
                  education.id,
                  field,
                  value,
                )
              }
              onDelete={() =>
                removeEducation(education.id)
              }
              readOnly={isReadOnly}
              t={t}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <RiAddCircleLine size={17} />
            {t("memberPage.add")}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton type="submit" />
      </div>
      </fieldset>
    </form>
  );
}

function EducationGroup({
  index,
  education,
  degrees,
  canDelete,
  onDelete,
  onChange,
  readOnly,
  t,
}) {
  const provinces = Array.isArray(locationData.provinces)
    ? locationData.provinces
    : [];

  const countries = Array.isArray(locationData.countries)
    ? locationData.countries
    : [];

  return (
    <div className="rounded-xl border border-border p-6">
      <h3 className="mb-5 text-sm font-semibold text-text-primary">
        {t("memberPage.educationItemTitle").replace("{index}", index + 1)}
      </h3>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        <BoxFill
          label={t("memberPage.institution")}
          placeholder={t("memberPage.organizationPlaceholder")}
          value={education.school ?? ""}
          onChange={(event) =>
            onChange("school", event.target.value)
          }
        />

        <FormSelect
          label={t("memberPage.provinceState")}
          placeholder={t("memberPage.selectProvinceState")}
          value={education.province ?? ""}
          onChange={(event) =>
            onChange("province", event.target.value)
          }
          options={provinces}
        />

        <BoxFill
            label={t("memberPage.country")}
            placeholder={t("memberPage.countryFillPlaceholder")}
            value={education.country || ""}
            onChange={(event) =>
              onChange("country", event.target.value)
            }
          />

        <FormSelect
          label={t("memberPage.degreeLevel")}
          placeholder={t("memberPage.selectDegreeLevel")}
          value={education.degree ?? ""}
          onChange={(event) =>
            onChange("degree", event.target.value)
          }
          options={degrees}
        />

        <FormDate
          label={t("memberPage.startDate")}
          name={`startDate-${education.id}`}
          value={education.startDate ?? ""}
          onChange={(event) =>
            onChange("startDate", event.target.value)
          }
        />

        <FormDate
          label={t("memberPage.endDate")}
          name={`endDate-${education.id}`}
          value={education.endDate ?? ""}
          onChange={(event) =>
            onChange("endDate", event.target.value)
          }
        />
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <label className="mb-2 block text-sm font-semibold text-text-primary">
          {t("memberPage.attachDocument")}
        </label>
        <MemberAttachmentField
          value={education.attachment}
          onChange={(value) => onChange("attachment", value)}
          readOnly={readOnly}
        />
      </div>

      <div className="mt-6 flex justify-end">
  <DeleteButton
    canDelete={canDelete}
    onClick={onDelete}
  />
</div>
    </div>
  );
}
