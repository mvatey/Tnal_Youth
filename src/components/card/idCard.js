import Image from "next/image";

const ROLE_LABELS = {
  admin: "អ្នកគ្រប់គ្រង",
  branch_leader: "ប្រធានសាខា",
  secretary: "លេខាធិការ",
  member: "សមាជិក",
};

export default function IdCard({ user }) {
  if (!user) return null;

  const memberId = String(user.id ?? "").padStart(4, "0");

  return (
    <div className="flex w-full justify-center py-4">
      <div
        className="
          relative
          h-[340px]
          w-[560px]
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-lg
        "
      >
        {/* background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-[#eef4fb]" />

        {/* FOOTER */}
<div className="absolute bottom-0 left-0 flex h-[42px] w-full items-center justify-center bg-[#062f6b] text-xs font-semibold text-white">
  Member ID : NAS-{memberId}
</div>

        {/* content */}
        <div className="relative z-10 p-6">
          {/* HEADER */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="logo"
              width={55}
              height={55}
              className="object-contain"
            />

            <div>
              <h1
                className="
                  text-lg
                  font-bold
                  leading-tight
                  text-[#062f6b]
                "
              >
                Cambodian Youth Nursery Association
              </h1>

              <p className="text-xs text-[#062f6b]">សមាគមថ្នាលយុវជនកម្ពុជា</p>
            </div>
          </div>

          {/* BODY */}
          <div className="mt-6 flex gap-7">
            {/* PHOTO */}
            <div
              className="
                relative
                h-[160px]
                w-[125px]
                overflow-hidden
                rounded-xl
                bg-gray-200
              "
            >
              <Image
                src={user.profile_photo || "/member.png"}
                alt={user.name}
                fill
                className="object-cover"
              />
            </div>

            {/* INFO */}
            <div className="flex-1">
              <h2
                className="
                  mb-4
                  text-xl
                  font-medium
                  text-[#062f6b]
                "
              >
                {ROLE_LABELS[user.role] || user.role}
              </h2>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <Info label="ឈ្មោះ" value={user.name} />

                <Info label="ភេទ" value={user.gender} />

                <Info label="អ៊ីមែល" value={user.email} />

                <Info label="លេខទូរសព្ទ" value={user.phone} />

                <Info label="ថ្ងៃកំណើត" value={user.date_of_birth} />

                <Info label="សាខា" value={user.branch} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-gray-500">{label}</p>

      <p
        className="
          max-w-[150px]
          truncate
          text-xs
          font-bold
          text-[#062f6b]
        "
      >
        {value || "-"}
      </p>
    </div>
  );
}
