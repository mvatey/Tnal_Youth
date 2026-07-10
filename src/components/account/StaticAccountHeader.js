import Image from "next/image";
import {
  CalendarDays,
  Mail,
  MapPin,
  Mars,
  Phone,
} from "lucide-react";

export default function StaticAccountHeader() {
  return (
    <section className="overflow-hidden rounded-2xl bg-primary-sidebar px-8 py-7 text-white shadow-md">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr_1.2fr_1fr] xl:items-center">
        <div className="flex items-center gap-5 xl:border-r xl:border-white/25 xl:pr-8">
          <div className="relative h-[104px] w-[100px] shrink-0 overflow-hidden rounded-xl bg-white/10">
            <Image
              src="/secretary.jpg"
              alt="ផាន វិទ្ធី"
              fill
              sizes="100px"
              className="object-cover"
              priority
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold">
              ផាន វិទ្ធី
            </h1>

            <p className="mt-1 text-sm text-white/70">
              PHAN RITHY
            </p>

            <p className="mt-2 text-sm text-white/80">
              លេខាធិការ
            </p>

            <span className="mt-3 inline-flex rounded-full bg-success-bg px-4 py-1 text-xs font-semibold text-success">
              សកម្ម
            </span>
          </div>
        </div>

        <div className="space-y-5 xl:border-r xl:border-white/25 xl:px-8">
          <ProfileItem
            icon={Mars}
            label="ភេទ"
            value="ប្រុស"
          />

          <ProfileItem
            icon={MapPin}
            label="សាខា"
            value="សាខា ភ្នំពេញ"
          />
        </div>

        <div className="space-y-5 xl:border-r xl:border-white/25 xl:px-8">
          <ProfileItem
            icon={Phone}
            label="លេខទូរស័ព្ទ"
            value="012 666 766"
          />

          <ProfileItem
            icon={Mail}
            label="អ៊ីមែល"
            value="secretary@example.com"
          />
        </div>

        <div className="space-y-5 xl:pl-8">
          <ProfileItem
            icon={CalendarDays}
            label="ថ្ងៃខែឆ្នាំកំណើត"
            value="4 មករា 1995"
          />

          <ProfileItem
            icon={CalendarDays}
            label="ថ្ងៃចូលបម្រើការ"
            value="25 មករា 2026"
          />
        </div>
      </div>
    </section>
  );
}

function ProfileItem({ icon: Icon, label, value }) {
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
          {value}
        </span>
      </div>
    </div>
  );
}