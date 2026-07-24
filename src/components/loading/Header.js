import Image from "next/image";
import { CircleHelp } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-[82px] items-center justify-between border-b border-gray-100 bg-white/90 px-12 backdrop-blur">
      <div
        className="flex items-center gap-4">
        <Image src="/logo.png" width={55} height={55} alt="logo" className="rounded-full"/>

        <div>
          <h2 className=" text-base font-bold text-[#17194d]" >
            សមាគមថ្នាលយុវជនកម្ពុជា
          </h2>
          <p className=" text-xs text-gray-400">
            ដើម្បីសង្គមកម្ពុជា
          </p>
        </div>
      </div>

      <nav className=" hidden items-center gap-10 md:flex">
        <a className=" text-sm font-medium text-[#4b3192]" >
          ទំព័រដើម
        </a>
        <a className=" text-sm font-medium text-gray-600 hover:text-[#4b3192]">
          សកម្មភាពសប្បុរសធម៍
        </a>
        <a className=" text-sm font-medium text-gray-600 hover:text-[#4b3192]" >
          កម្មវិធី
        </a>
      </nav>
      <div className="flex items-center gap-8">
        <button
          type="button"
          aria-label="Help"
          className="flex h-8 w-8 items-center justify-center text-black transition hover:text-[#4b3192]"
        >
          <CircleHelp size={29} strokeWidth={2.2} />
        </button>

        <Link
          href="/auth/login"
          className="group flex items-center gap-2 rounded-lg bg-[#4b3192] px-7 py-3 text-sm font-medium text-white shadow-lg shadow-purple-200 transition-all duration-300 hover:bg-[#392477] hover:-translate-y-0.5"
        >
          ចូលប្រើប្រាស់
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </header>
  );
}
