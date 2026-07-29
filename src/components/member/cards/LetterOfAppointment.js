"use client";

import Image from "next/image";

const ROLE_LABELS = {
  admin: "អ្នកគ្រប់គ្រង",
  branch_leader: "ប្រធានសាខា",
  secretary: "លេខាធិការ",
  member: "សមាជិក",
};

export default function LetterOfAppointment({ user }) {
  if (!user) return null;

  const displayName = user.name_kh || user.name_en || "មិនមានឈ្មោះ";
  const roleLabel = ROLE_LABELS[user.role] || user.role || "សមាជិក";
  const certificateNumber = `NAS-AP-2026-${String(user.id).padStart(4, "0")}`;

  return (
    <div className="flex w-full justify-center overflow-x-auto py-6">
      <div className="relative h-[630px] w-[900px] shrink-0 overflow-hidden rounded-xl bg-[#fffefb] shadow-xl">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,190,95,0.08),transparent_60%)]" />
        <div className="absolute inset-0 border-[12px] border-[#072b5c]" />
        <div className="absolute inset-[12px] border-2 border-[#d7a62e]" />

        {/* Top-left decoration */}
        <div className="absolute left-3 top-3 h-[220px] w-[260px] overflow-hidden">
          <div className="absolute -left-28 -top-24 h-[290px] w-[390px] rotate-[-14deg] rounded-[50%] bg-[#062a58]" />
          <div className="absolute -left-16 -top-10 h-[235px] w-[340px] rotate-[-14deg] rounded-[50%] border-[22px] border-[#d29b24]" />
          <div className="absolute -left-5 top-1 h-[185px] w-[300px] rotate-[-14deg] rounded-[50%] border-[10px] border-[#f2cf72]" />
        </div>

        {/* Bottom-right decoration */}
        <div className="absolute bottom-3 right-3 h-[220px] w-[260px] overflow-hidden">
          <div className="absolute -bottom-24 -right-28 h-[290px] w-[390px] rotate-[-14deg] rounded-[50%] bg-[#062a58]" />
          <div className="absolute -bottom-10 -right-16 h-[235px] w-[340px] rotate-[-14deg] rounded-[50%] border-[22px] border-[#d29b24]" />
          <div className="absolute -right-5 bottom-1 h-[185px] w-[300px] rotate-[-14deg] rounded-[50%] border-[10px] border-[#f2cf72]" />
        </div>

        {/* Certificate number */}
        <div className="absolute right-16 top-12 text-right text-sm font-medium text-[#16345b]">
          <p>Certificate No.</p>
          <p>{certificateNumber}</p>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex h-full flex-col items-center px-20 pb-10 pt-8 text-[#0b2d59]">
          <Image src="/logo.png" alt="TNAL Youth logo" width={82} height={82} className="object-contain" priority />

          <h1 className="mt-2 text-4xl font-bold tracking-wide">លិខិតតែងតាំង</h1>

          <div className="mt-2 flex items-center gap-3">
            <span className="h-px w-24 bg-[#d6a42e]" />
            <span className="text-xl text-[#d6a42e]">❖</span>
            <span className="h-px w-24 bg-[#d6a42e]" />
          </div>

          <p className="mt-4 text-base font-medium">
            សមាគមថ្នាលយុវជនកម្ពុជា (TNAL Youth Association)
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="h-px w-20 bg-[#d6a42e]" />
            <span className="text-lg text-[#d6a42e]">❖</span>
            <span className="h-px w-20 bg-[#d6a42e]" />
          </div>

          <p className="mt-5 text-sm">សម្រេចតែងតាំង</p>

          <h2 className="mt-2 text-4xl font-bold">{displayName}</h2>

          <p className="mt-2 text-lg font-semibold">
            ជា {roleLabel}
          </p>

          <p className="mt-1 text-sm font-medium">{user.branch || "-"}</p>

          <div className="mt-4 flex items-center gap-3">
            <span className="h-px w-28 bg-[#d6a42e]" />
            <span className="text-lg text-[#d6a42e]">❖</span>
            <span className="h-px w-28 bg-[#d6a42e]" />
          </div>

          <p className="mt-5 max-w-[700px] text-center text-sm leading-7 text-[#244363]">
            សមាគមថ្នាលយុវជនកម្ពុជា សម្រេចតែងតាំងឈ្មោះខាងលើឱ្យបំពេញតួនាទីជា
            <span className="font-bold"> {roleLabel} </span>
            ប្រចាំ {user.branch || "សាខា"}។ សាមីខ្លួនត្រូវអនុវត្តតួនាទី ភារកិច្ច និងការទទួលខុសត្រូវ
            ប្រកបដោយស្មារតីស្ម័គ្រចិត្ត សាមគ្គីភាព តម្លាភាព និងគោរពតាមបទបញ្ជារបស់សមាគម។
          </p>

          <p className="mt-5 text-sm font-medium">
            ចេញនៅថ្ងៃទី {user.joinedAt || "មិនមានកាលបរិច្ឆេទ"}
          </p>

          <div className="mt-auto grid w-full grid-cols-3 items-end px-10">
            <div className="text-center">
              <div className="mx-auto mb-2 h-12 w-32 border-b border-[#d6a42e]" />
              <p className="text-sm font-bold">ប្រធានសមាគម</p>
              <p className="mt-1 text-xs">សមាគមថ្នាលយុវជនកម្ពុជា</p>
            </div>

            <div className="flex justify-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-red-600 bg-white shadow-sm">
                <div className="absolute inset-1 rounded-full border-2 border-red-600" />
                <Image src="/logo.png" alt="Official seal" width={62} height={62} className="object-contain" />
              </div>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-2 h-12 w-32 border-b border-[#d6a42e]" />
              <p className="text-sm font-bold">អគ្គលេខាធិការ</p>
              <p className="mt-1 text-xs">សមាគមថ្នាលយុវជនកម្ពុជា</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}