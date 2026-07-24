import Image from "next/image";

const ROLE_LABELS = {
  admin: "អ្នកគ្រប់គ្រង",
  branch_leader: "ប្រធានសាខា",
  secretary: "លេខាធិការ",
  member: "សមាជិក",
};

const DEFAULT_USER = {
  id: "",
  role: "member",
  name_kh: "",
  name_en: "",
  gender: "",
  email: "",
  phone: "",
  date_of_birth: "",
  branch: "",
  profile_photo: "/profile.png",
};

export default function IdCard({ user }) {
  const displayUser = user || DEFAULT_USER;

  const hasSelectedUser = Boolean(displayUser.id);

  const memberId = hasSelectedUser
    ? String(displayUser.id).padStart(4, "0")
    : "0000";

  const roleLabel =
    ROLE_LABELS[displayUser.role] ||
    displayUser.role ||
    ROLE_LABELS.member;

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
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-[#eef4fb]" />

        {/* Footer */}
        <div
          className="
            absolute
            bottom-0
            left-0
            flex
            h-[42px]
            w-full
            items-center
            justify-center
            bg-[#062f6b]
            text-xs
            font-semibold
            text-white
          "
        >
          Member ID : NAS-{memberId}
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="logo"
              width={55}
              height={55}
              className="object-contain"
              priority
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

              <p className="text-xs text-[#062f6b]">
                សមាគមថ្នាលយុវជនកម្ពុជា
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="mt-6 flex gap-7">
            {/* Profile photo */}
            <div
              className="
                relative
                h-[160px]
                w-[125px]
                shrink-0
                overflow-hidden
                rounded-xl
                bg-gray-200
              "
            >
              <Image
                src={
                  hasSelectedUser
                    ? displayUser.profile_photo || "/profile.png"
                    : "/profile.png"
                }
                alt={
                  hasSelectedUser
                    ? displayUser.name_kh ||
                      displayUser.name_en ||
                      "រូបថតសមាជិក"
                    : "រូបថតសមាជិក"
                }
                fill
                className="object-cover"
                sizes="125px"
              />
            </div>

            {/* Information */}
            <div className="min-w-0 flex-1">
              <h2
                className="
                  mb-4
                  text-xl
                  font-medium
                  text-[#062f6b]
                "
              >
                {roleLabel}
              </h2>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <Info
                  label="ឈ្មោះ"
                  value={hasSelectedUser ? displayUser.name_kh : ""}
                />

                <Info
                  label="ភេទ"
                  value={hasSelectedUser ? displayUser.gender : ""}
                />

                <Info
                  label="អ៊ីមែល"
                  value={hasSelectedUser ? displayUser.email : ""}
                />

                <Info
                  label="លេខទូរសព្ទ"
                  value={hasSelectedUser ? displayUser.phone : ""}
                />

                <Info
                  label="ថ្ងៃកំណើត"
                  value={
                    hasSelectedUser ? displayUser.date_of_birth : ""
                  }
                />

                <Info
                  label="សាខា"
                  value={hasSelectedUser ? displayUser.branch : ""}
                />
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
    <div className="min-w-0">
      <p className="text-[10px] text-gray-500">{label}</p>

      <p
        className="
          min-h-[18px]
          max-w-[150px]
          truncate
          text-xs
          font-bold
          text-[#062f6b]
        "
      >
        {value || ""}
      </p>
    </div>
  );
}