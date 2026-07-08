"use client";

import Image from "next/image";
import { Phone, Mail, Calendar, User, Building2, Calendar1Icon, CalendarCheck } from "lucide-react";

const ROLE_LABELS = {
  admin: "អ្នកគ្រប់គ្រង",
  branch_leader: "ប្រធានសាខា",
  secretary: "លេខាធិការ",
  member: "សមាជិក",
};

const ROLE_BADGE_STYLES = {
  admin: "bg-primary-light text-primary",
  branch_leader: "bg-warning-bg text-warning",
  secretary: "bg-success-bg text-success",
  member: "bg-gray-100 text-text-secondary",
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

  return (
    <div className="bg-gradient-to-r from-primary to-primary-sidebar rounded-2xl shadow-lg overflow-hidden p-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
        {/* Left Section - profile_photo & Basic Info */}
        <div className="flex items-start gap-5 flex-shrink-0">
          {/* profile_photo */}
          <div className="relative w-20 h-20 rounded-lg  overflow-hidden bg-gray-200 shadow-md">
            <Image
              src={member.profile_photo || "/member.png"}
              alt={member.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Name & Role & Status */}
          <div className="text-white pt-0.5">
            <h2 className="text-lg font-bold mb-1">{member.name}</h2>
            <p className="text-gray-200 text-sm mb-2.5">
              {ROLE_LABELS[member.role] || member.role}
            </p>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                STATUS_BADGE_STYLES[member.status] ||
                "bg-gray-100 text-text-secondary"
              }`}
            >
              {member.status}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-20 bg-white/40" />

        {/* Section 1 - Gender & Branch */}
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

          <div>
            <p className="text-xs text-gray-200 uppercase tracking-wider mb-0.5">
              សាខា
            </p>
            <p className="font-semibold text-sm line-clamp-2">
              {member.branch || "-"}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-20 bg-white/40" />

        {/* Section 2 - Phone & Email */}
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
        <div className="hidden lg:block w-px h-20 bg-white/40" />

        {/* Section 3 - Dates */}
        <div className="text-white flex-1 min-w-0">
          <div className="mb-3.5">
            <p className="text-xs text-gray-200 uppercase tracking-wider mb-0.5">
              ថ្ងៃកំណើត
            </p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0 text-white" />
              <p className="font-semibold text-sm">{member.date_of_birth || "-"}</p>
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
      </div>
    </div>
  );
}