"use client";

import { FolderPlus } from "lucide-react";
import IdCard from "@/components/member/cards/idCard";
import FormControl from "@/components/forms/FormControl";
import Button from "@/components/ui/Button";

export default function IdCardForm({ form, setForm, onSave, onClose }) {
  const updateField = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="grid grid-cols-[280px_1fr] gap-8">
        <div className="space-y-4">
          <FormControl
            label="ឈ្មោះសមាជិក"
            value={form.member || ""}
            onChange={updateField("member")}
            placeholder="បញ្ចូលឈ្មោះសមាជិក"
          />
          <FormControl
            label="ភេទ"
            type="select"
            value={form.gender || ""}
            onChange={updateField("gender")}
            placeholder="ជ្រើសរើសភេទ"
            options={["ប្រុស", "ស្រី"]}
          />
          <FormControl
            label="អ៊ីមែល"
            type="email"
            value={form.email || ""}
            onChange={updateField("email")}
            placeholder="បញ្ចូលអ៊ីមែល"
          />
          <FormControl
            label="លេខទូរស័ព្ទ"
            type="tel"
            value={form.phone || ""}
            onChange={updateField("phone")}
            placeholder="បញ្ចូលលេខទូរស័ព្ទ"
          />
        </div>
        <div>
          <IdCard
            user={{
              id: 1,
              name_kh: form.member || "ឈ្មោះសមាជិក",
              gender: form.gender || "-",
              email: form.email || "-",
              phone: form.phone || "-",
              date_of_birth: form.dateOfBirth || "-",
              branch: form.branch || "-",
              role: "member",
              profile_photo: form.profilePhoto || "/member.png",
            }}
          />
          <div className="mt-5 flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="h-10 w-[120px]"
            >
              ត្រឡប់
            </Button>
            <Button
              type="button"
              onClick={onSave}
              icon={<FolderPlus size={18} />}
              className="h-10 w-[180px]"
            >
              បង្កើតប័ណ្ណ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
