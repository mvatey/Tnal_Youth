"use client";

export default function PersonalInformation({
  member,
  readOnly = false,
}) {
  if (!member) return null;

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <InfoField
        label="ឈ្មោះជាភាសាខ្មែរ"
        value={member.name}
        readOnly={readOnly}
      />

      <InfoField
        label="ឈ្មោះជាអក្សរឡាតាំង"
        value={member.nameEnglish}
        readOnly={readOnly}
      />

      <InfoField
        label="ភេទ"
        value={member.gender}
        readOnly={readOnly}
      />

      <InfoField
        label="ថ្ងៃខែឆ្នាំកំណើត"
        value={member.dateOfBirth}
        readOnly={readOnly}
      />

      <InfoField
        label="លេខទូរស័ព្ទ"
        value={member.phone}
        readOnly={readOnly}
      />

      <InfoField
        label="អ៊ីមែល"
        value={member.email}
        readOnly={readOnly}
      />

      <InfoField
        label="តួនាទី"
        value={member.role}
        readOnly
      />

      <InfoField
        label="សាខា"
        value={member.branch}
        readOnly
      />

      <div className="md:col-span-2 xl:col-span-3">
        <InfoField
          label="អាសយដ្ឋាន"
          value={member.address}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  readOnly,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text-secondary">
        {label}
      </span>

      <input
        type="text"
        value={value || ""}
        readOnly={readOnly}
        className={`h-11 w-full rounded-lg border border-border px-4 text-sm outline-none ${
          readOnly
            ? "cursor-default bg-bg-page-gray text-text-secondary"
            : "bg-white text-text-primary focus:border-secondary"
        }`}
      />
    </label>
  );
}