import Image from "next/image";

const ROLE_LABELS = {
  admin: "អ្នកគ្រប់គ្រង",
  branch_leader: "ប្រធានសាខា",
  secretary: "លេខាធិការ",
  member: "សមាជិក",
};

export default function CertificateCard({ user }) {
  if (!user) return null;

  return (
    <div className="flex w-full justify-center py-6">

      <div className="
        relative
        h-[340px]
        w-[560px]
        overflow-hidden
        rounded-xl
        border-[10px]
        border-[#062f6b]
        bg-white
        shadow-xl
      ">

        {/* background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-[#eef4fb]" />


        {/* content */}
        <div className="relative z-10 flex h-full flex-col items-center p-10">


          {/* Logo */}
          <Image
            src="/logo.png"
            alt="logo"
            width={90}
            height={90}
            className="object-contain"
          />


          {/* Organization */}
          <h2 className="
            mt-3
            text-2xl
            font-bold
            text-[#062f6b]
          ">
            Cambodian Youth Nursery Association
          </h2>


          <p className="text-sm text-[#062f6b]">
            សមាគមថ្នាលយុវជនកម្ពុជា
          </p>



          {/* Title */}
          <h1 className="
            mt-8
            text-4xl
            font-bold
            tracking-wide
            text-[#062f6b]
          ">
            CERTIFICATE
          </h1>


          <p className="mt-2 text-gray-500">
            OF APPRECIATION
          </p>



          {/* Presented */}
          <p className="mt-8 text-gray-600">
            This certificate is proudly presented to
          </p>


          {/* Name */}
          <h1 className="
            mt-3
            border-b-2
            border-[#062f6b]
            px-20
            pb-2
            text-3xl
            font-bold
            text-[#062f6b]
          ">
            {user.name}
          </h1>



          {/* Description */}
          <p className="
            mt-6
            max-w-[560px]
            text-center
            text-sm
            leading-7
            text-gray-600
          ">
            For successfully participating and contributing as a 
            {" "}
            <span className="font-bold">
              {ROLE_LABELS[user.role] || user.role}
            </span>
            {" "}
            in Cambodian Youth Nursery Association.
          </p>



          {/* Footer */}
          <div className="
            mt-auto
            flex
            w-full
            justify-between
            px-10
            text-[#062f6b]
          ">

            <div className="text-center">

              <div className="mb-2 h-px w-32 bg-[#062f6b]" />

              <p className="text-xs">
                President
              </p>

            </div>


            <div className="text-center">

              <div className="mb-2 h-px w-32 bg-[#062f6b]" />

              <p className="text-xs">
                Date
              </p>

            </div>


          </div>


        </div>

      </div>

    </div>
  );
}