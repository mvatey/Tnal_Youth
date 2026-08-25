// app/auth/layout.jsx
"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import useOrganizationProfile from "@/hooks/useOrganizationProfile";

export default function AuthLayout({ children }) {
  const { t } = useLanguage();
  const { localized } = useOrganizationProfile();

  return (
    <div className="min-h-screen flex">
      {/* Left panel — shared across all auth pages */}
      <div className="hidden md:flex w-1/2 relative">
        <Image src="/hallway.png" alt="" fill sizes="50vw" priority className="object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(45,53,91,0.95) 0%, rgba(45,53,91,0.60) 100%)",
          }}
          
        />
        <div className="relative z-10 flex flex-col justify-center px-20 text-white">
          <div className="w-10 h-px bg-white mb-8" />
          <h1 className="text-4xl font-bold text-yellow-400 leading-snug mb-2">
            {localized.name || t("auth.heroTitle", "ប្រព័ន្ធគ្រប់គ្រង")}
          </h1>
          <h2 className="text-4xl font-bold leading-snug mb-6">
            {localized.tagline || t("auth.heroSubtitle", "សមាជិក · សកម្មភាព · វិភាគទាន")}
          </h2>
            <p className="text-slate-300 text-base leading-relaxed mb-6">
            {localized.about || t("auth.heroDescription", "គ្រប់គ្រងទិន្នន័យសមាជិក ការបង់វិភាគទាន និងសកម្មភាពទាំងនៅទីនេះដោយពួកគេ")}
          </p>
          <div className="w-16 h-px bg-white/60" />
        </div>
      </div>

        {/* Right panel */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-md mx-auto"> {/* add mx-auto explicitly */}
            <img src={localized.logoUrl || "/logo.png"} alt={localized.name || "Logo"} className="w-24 h-24 mb-6 mx-auto object-contain" />
            {children}
        </div>
        </div>
    </div>
  );
}
