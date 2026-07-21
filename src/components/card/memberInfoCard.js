"use client";

import Image from "next/image";
import {
  Phone,
  Mail,
  Calendar,
  CalendarCheck,
  Globe,
  Users,
  Building2,
} from "lucide-react";

const ROLE_LABELS = {
  admin: "អ្នកគ្រប់គ្រង",
  branch_leader: "ប្រធានសាខា",
  secretary: "លេខាធិការ",
  member: "សមាជិក",
};

const STATUS_BADGE_STYLES = {
  សកម្ម: "bg-success-bg text-success",
  អសកម្ម: "bg-error-bg text-error",
};

export default function MemberInfoCard({ member }) {
  if (!member) return null;

  const getGenderDisplay = (gender) => {
    if (gender === "ស្រី") return "ភេទ ស្រី";
    return "ភេទ ប្រុស";
  };

  const displayName = member.name_kh || member.name_en || member.name || "-";

  return (
    <div className="app-card bg-gradient-to-r from-primary to-primary-sidebar rounded-2xl shadow-lg overflow-hidden p-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
        {/* Left Section - Profile */}
        <div className="flex items-start gap-5 flex-shrink-0">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden  border-white/20 shadow-xl">
            <Image
              src={member.profile_photo || "/member.png"}
              alt={displayName}
              fill
              className="object-cover"
            />
          </div>

          <div className="text-white pt-0.5 pr-20">
            <h2 className="text-2xl font-bold mb-1">{displayName}</h2>

            <p className="text-sm text-gray-200">{member.name_en || "-"}</p>

            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm text-gray-200">
                {ROLE_LABELS[member.role] || member.role}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-sm ${
                  STATUS_BADGE_STYLES[member.status] ||
                  "bg-gray-100 text-text-secondary"
                }`}
              >
                {member.status}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-24 bg-white/40" />

        {/* Gender & Branch */}
        <div className="text-white flex-1 min-w-0">
          <div className="mb-3.5">
            <p className="text-xs text-gray-200 uppercase tracking-wider mb-0.5">
              ភេទ
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm">♂</span>
              <p className="font-semibold text-sm">
                {getGenderDisplay(member.gender)}
              </p>
            </div>
          </div>

          <div className="mb-3.5">
            <p className="text-xs text-gray-200 uppercase tracking-wider mb-0.5">
              សាខា
            </p>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 flex-shrink-0 text-white" />
              <p className="font-semibold text-sm">{member.branch || "-"}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-24 bg-white/40" />

        {/* Phone & Email */}
        <div className="text-white flex-1 min-w-0">
          <div className="mb-3.5">
            <p className="text-xs text-gray-200 uppercase tracking-wider mb-0.5">
              លេខទូរស័ព្ទ
            </p>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 flex-shrink-0 text-white" />
              <p className="font-semibold text-sm">{member.phone || "-"}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-200 uppercase tracking-wider mb-0.5">
              អ៊ីមែល
            </p>

            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 flex-shrink-0 text-white" />
              <p className="font-semibold text-sm truncate">
                {member.email || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-24 bg-white/40" />

        {/* Dates */}
        <div className="text-white flex-1 min-w-0">
          <div className="mb-3.5">
            <p className="text-xs text-gray-200 uppercase tracking-wider mb-0.5">
              ថ្ងៃកំណើត
            </p>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0 text-white" />
              <p className="font-semibold text-sm">
                {member.date_of_birth || "-"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-200 uppercase tracking-wider mb-0.5">
              ថ្ងៃចូលរួម
            </p>

            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 flex-shrink-0 text-white" />
              <p className="font-semibold text-sm">{member.joinedAt || "-"}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-24 bg-white/40" />

        {/* New Section */}
        <div className="text-white flex-1 min-w-0">
          <div className="mb-3.5">
            <p className="text-xs text-gray-200 uppercase tracking-wider mb-0.5">
              សញ្ជាតិ
            </p>

            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 flex-shrink-0 text-white" />
              <p className="font-semibold text-sm">
                {member.nationality || "-"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-200 uppercase tracking-wider mb-0.5">
              ជនជាតិ
            </p>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 flex-shrink-0 text-white" />
              <p className="font-semibold text-sm">{member.ethnicity || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
