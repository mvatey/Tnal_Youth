"use client";

import { getCurrentMember } from "@/lib/currentMember";
import BoxFill from "@/components/forms/boxFill";

export default function MyAccountPersonalPage() {
  const member = getCurrentMember();

  if (!member) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">
          គណនីនេះមិនទាន់ភ្ជាប់ជាមួយព័ត៌មានសមាជិកទេ
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-bold text-primary">
        ព័ត៌មានផ្ទាល់ខ្លួន
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <BoxFill
          label="ឈ្មោះជាភាសាខ្មែរ"
          value={member.name_kh || ""}
          placeholder="-"
          readOnly
        />

        <BoxFill
          label="ឈ្មោះជាអក្សរឡាតាំង"
          value={member.name_en || ""}
          placeholder="-"
          readOnly
        />

        <BoxFill
          label="សាខា"
          value={member.branch || ""}
          placeholder="-"
          readOnly
        />

        <BoxFill
          label="ភេទ"
          value={member.gender || ""}
          placeholder="-"
          readOnly
        />

        <BoxFill
          label="អ៊ីមែល"
          type="email"
          value={member.email || ""}
          placeholder="-"
          readOnly
        />

        <BoxFill
          label="លេខទូរស័ព្ទ"
          type="tel"
          value={member.phone || ""}
          placeholder="-"
          readOnly
        />

        <BoxFill
          label="ថ្ងៃខែឆ្នាំកំណើត"
          value={member.date_of_birth || ""}
          placeholder="-"
          readOnly
        />

        <BoxFill
          label="សញ្ជាតិ"
          value={member.nationality || ""}
          placeholder="-"
          readOnly
        />

        <BoxFill
          label="ជនជាតិ"
          value={member.ethnicity || ""}
          placeholder="-"
          readOnly
        />

        <BoxFill
          label="សាសនា"
          value={member.religion || ""}
          placeholder="-"
          readOnly
        />

        <BoxFill
          label="តួនាទី"
          value={member.role || ""}
          placeholder="-"
          readOnly
        />

        <BoxFill
          label="ស្ថានភាព"
          value={member.status || ""}
          placeholder="-"
          readOnly
        />

        <BoxFill
          label="ថ្ងៃចូលរួម"
          value={member.joinedAt || ""}
          placeholder="-"
          readOnly
        />
      </div>
    </div>
  );
}