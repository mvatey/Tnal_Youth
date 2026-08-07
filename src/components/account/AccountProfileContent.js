"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";



const tabs = [
  {
    label: "ប័ណ្ណសម្គាល់ខ្លួន និង លិខិត",
    href: "/myAcc/documents",
  },
  {
    label: "ផ្លាស់ប្ដូរពាក្យសម្ងាត់",
    href: "/myAcc/password",
  },
];

function getValue(user, keys, fallback = "-") {
  for (const key of keys) {
    if (user?.[key]) {
      return user[key];
    }
  }

  return fallback;
}

export default function AccountProfileContent({
  children,
}) {
  const pathname = usePathname();

const secretary = {
  name: "ផាន វិទ្ធី",
  nameEnglish: "PHAN VITHEY",
  role: "លេខាធិការ",
  status: "សកម្ម",
  gender: "ប្រុស",
  branch: "សាខា ភ្នំពេញ",
  phone: "0126667666",
  email: "admin@example.com",
  birthDate: "4 មករា 1995",
  joinedDate: "25 មករា 2026",
  avatar: "/secretary.jpg",
};

  if (!secretary) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="rounded-xl border border-border bg-white px-8 py-10 text-center">
          <p className="font-semibold text-text-primary">
            មិនរកឃើញព័ត៌មានលេខាធិការ
          </p>
        </div>
      </div>
    );
  }

  const name = getValue(secretary, [
    "name",
    "fullName",
    "khmerName",
  ]);

  const latinName = getValue(secretary, [
    "nameEnglish",
    "englishName",
    "latinName",
  ]);

  const avatar = getValue(
    secretary,
    ["avatar", "profileImage", "image"],
    "/secretary.jpg"
  );

  const gender = getValue(secretary, [
    "gender",
  ]);

  const branch = getValue(secretary, [
    "branch",
    "branchName",
  ]);

  const phone = getValue(secretary, [
    "phone",
    "phoneNumber",
    "telephone",
  ]);

  const email = getValue(secretary, [
    "email",
  ]);

  const birthDate = getValue(secretary, [
    "birthDate",
    "dateOfBirth",
    "dob",
  ]);

  const joinedDate = getValue(secretary, [
    "joinedDate",
    "joinedAt",
    "createdAt",
  ]);

  const status = getValue(
    secretary,
    ["status"],
    "សកម្ម"
  );

  return (
    <div className="space-y-5">
      {/* Profile header */}
      <section className="rounded-2xl bg-primary-sidebar px-8 py-7 text-white shadow-md">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_1fr_1.2fr_1fr] xl:items-center">
          {/* Identity */}
          <div className="flex items-center gap-5 xl:border-r xl:border-white/25 xl:pr-8">
            <div className="relative h-[104px] w-[100px] shrink-0 overflow-hidden rounded-xl bg-white/10">
              <Image
                src={avatar}
                alt={name}
                fill
                sizes="100px"
                className="object-cover"
                priority
              />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold">
                {name}
              </h1>

              <p className="mt-1 truncate text-sm text-white/70">
                {latinName}
              </p>

              <p className="mt-2 text-sm text-white/80">
                លេខាធិការ
              </p>

              <span className="mt-3 inline-flex rounded-full bg-success-bg px-4 py-1 text-xs font-semibold text-success">
                {status}
              </span>
            </div>
          </div>

          {/* Gender and branch */}
          <div className="space-y-5 xl:border-r xl:border-white/25 xl:px-8">
            <ProfileItem
              icon={UserRound}
              label="ភេទ"
              value={gender}
            />

            <ProfileItem
              icon={MapPin}
              label="សាខា"
              value={branch}
            />
          </div>

          {/* Contact */}
          <div className="space-y-5 xl:border-r xl:border-white/25 xl:px-8">
            <ProfileItem
              icon={Phone}
              label="លេខទូរស័ព្ទ"
              value={phone}
            />

            <ProfileItem
              icon={Mail}
              label="អ៊ីមែល"
              value={email}
            />
          </div>

          {/* Dates */}
          <div className="space-y-5 xl:pl-8">
            <ProfileItem
              icon={CalendarDays}
              label="ថ្ងៃខែឆ្នាំកំណើត"
              value={birthDate}
            />

            <ProfileItem
              icon={CalendarDays}
              label="ថ្ងៃចូលជាសមាជិក"
              value={joinedDate}
            />
          </div>
        </div>
      </section>

      {/* Two tabs */}
      <nav className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="grid grid-cols-2">
          {tabs.map((tab) => {
            const active =
              pathname === tab.href ||
              pathname.startsWith(`${tab.href}/`);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  flex
                  h-12
                  items-center
                  justify-center
                  border-t-2
                  px-4
                  text-center
                  text-sm
                  font-semibold
                  transition
                  ${
                    active
                      ? "border-secondary bg-secondary-light text-secondary"
                      : "border-transparent text-text-secondary hover:bg-gray-50 hover:text-secondary"
                  }
                `}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Current tab */}
      <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
        {children}
      </section>
    </div>
  );
}

function ProfileItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs text-white/60">
        {label}
      </p>

      <div className="mt-1 flex items-center gap-2">
        <Icon
          size={18}
          className="shrink-0 text-white/90"
        />

        <span className="truncate text-sm font-semibold">
          {value || "-"}
        </span>
      </div>
    </div>
  );
}