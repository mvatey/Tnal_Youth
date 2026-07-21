"use client";

import useCurrentMember from "@/hooks/useCurrentMember";

export default function MyAccountPage() {
  const { member, loading, error } = useCurrentMember();

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        កំពុងទាញយកព័ត៌មានសមាជិក...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-error">
        {error}
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        រកមិនឃើញព័ត៌មានសមាជិក
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-primary">
        ព័ត៌មានផ្ទាល់ខ្លួន
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs text-text-secondary">ឈ្មោះខ្មែរ</p>
          <p className="font-medium text-text-primary">
            {member.name_kh || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">ឈ្មោះអង់គ្លេស</p>
          <p className="font-medium text-text-primary">
            {member.name_en || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">លេខទូរស័ព្ទ</p>
          <p className="font-medium text-text-primary">
            {member.phone || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">អ៊ីមែល</p>
          <p className="font-medium text-text-primary">
            {member.email || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">សាខា</p>
          <p className="font-medium text-text-primary">
            {member.branch || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">ភេទ</p>
          <p className="font-medium text-text-primary">
            {member.gender || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">សញ្ជាតិ</p>
          <p className="font-medium text-text-primary">
            {member.nationality || "-"}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">ជនជាតិ</p>
          <p className="font-medium text-text-primary">
            {member.ethnicity || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}