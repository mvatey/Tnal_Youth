"use client";

import { FolderPlus } from "lucide-react";
import IdCard from "@/components/card/idCard";

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
          <div>
            <label className="mb-2 block text-sm font-semibold">
              ឈ្មោះសមាជិក
            </label>
            <input
              value={form.member || ""}
              onChange={updateField("member")}
              placeholder="បញ្ចូលឈ្មោះសមាជិក"
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">ភេទ</label>
            <select
              value={form.gender || ""}
              onChange={updateField("gender")}
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none"
            >
              <option value="">ជ្រើសរើសភេទ</option>
              <option value="ប្រុស">ប្រុស</option>
              <option value="ស្រី">ស្រី</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">អ៊ីមែល</label>
            <input
              value={form.email || ""}
              onChange={updateField("email")}
              placeholder="បញ្ចូលអ៊ីមែល"
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              លេខទូរស័ព្ទ
            </label>
            <input
              value={form.phone || ""}
              onChange={updateField("phone")}
              placeholder="បញ្ចូលលេខទូរស័ព្ទ"
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-primary"
            />
          </div>
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
            <button
              type="button"
              onClick={onClose}
              className="h-10 w-[120px] rounded-lg border border-gray-200 text-sm"
            >
              ត្រឡប់
            </button>

            <button
              type="button"
              onClick={onSave}
              className="flex h-10 w-[180px] items-center justify-center gap-2 rounded-lg bg-primary text-sm text-white"
            >
              <FolderPlus size={18} />
              បង្កើតប័ណ្ណ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}