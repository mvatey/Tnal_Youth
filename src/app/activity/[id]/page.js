import activityData from "@/data/activity.json";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  History,
  MapPin,
  Pencil,
  Phone,
  Tag,
  UserCheck,
  UserX,
  Users,
  WalletCards,
} from "lucide-react";

export default async function ActivityDetailPage({ params }) {
  const { id } = await params;
  const activity = activityData.find((item) => String(item.id) === id);

  if (!activity) return <div className="text-text-secondary">រកមិនឃើញកម្មវិធី</div>;

  const statusLabel = activity.status === "completed" ? "បានបញ្ចប់" : "នាពេលខាងមុខ";
  const statusStyle = activity.status === "completed" ? "bg-success-bg text-success" : "bg-secondary-light text-secondary";
  const visibilityLabel = activity.visibility || "សាធារណៈ";

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-text-secondary">
            <Link href="/activity" className="flex items-center gap-1 hover:text-primary"><ArrowLeft size={15} />កម្មវិធី</Link>
            <span>/</span>
            <span>ព័ត៌មានលម្អិត</span>
          </div>
          <h1 className="text-xl font-bold text-secondary">ព័ត៌មានលម្អិតកម្មវិធី</h1>
        </div>

        <button className="flex h-9 items-center gap-2 rounded-lg bg-secondary px-4 text-sm font-medium text-white hover:bg-secondary-hover">
          <Pencil size={15} />
          កែប្រែ
        </button>
      </div>

      {/* SECTION 1: Hero + status summary */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-border bg-white p-5">
          <div className="flex gap-5">
            <Image src={activity.image} width={300} height={200} className="h-[200px] w-[300px] shrink-0 rounded-lg object-cover" alt={activity.name} />

            {/* no more justify-between — content hugs the top, icon row sits right under description */}
            <div className="flex flex-1 flex-col">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-text-primary">{activity.name}</h2>
                <span className={`rounded-full px-3 py-1 text-[11px] ${statusStyle}`}>{statusLabel}</span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{activity.descriptionBrief}</p>

              <div className="mt-5 grid grid-cols-4 gap-4 text-xs text-text-secondary">
                <InfoIcon icon={CalendarDays} label={activity.date} sub={`${activity.startTime || ""} - ${activity.endTime || ""}`} />
                <InfoIcon icon={MapPin} label={activity.branch} sub={activity.location} />
                <InfoIcon icon={Users} label={activity.participants} sub="បានចូលរួម" />
                <InfoIcon icon={Tag} label={activity.type} sub="ប្រភេទសិល្បៈ" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h3 className="mb-5 text-base font-bold text-secondary">សង្ខេបស្ថានភាព</h3>
          <StatusRow icon={CheckCircle2} label="ស្ថានភាព">
            <span className={`rounded-full px-3 py-1 text-[11px] ${statusStyle}`}>{statusLabel}</span>
          </StatusRow>
          <StatusRow icon={Eye} label="ការមើលឃើញ">
            <span className="text-sm font-semibold text-text-primary">{visibilityLabel}</span>
          </StatusRow>
          <StatusRow icon={CalendarDays} label="ថ្ងៃចាប់ផ្តើម">
            <span className="text-sm font-semibold text-text-primary">{activity.startDate || activity.date}</span>
          </StatusRow>
          <StatusRow icon={History} label="ថ្ងៃបញ្ចប់" last>
            <span className="text-sm font-semibold text-text-primary">{activity.endDate || activity.date}</span>
          </StatusRow>
        </div>
      </div>

      {/* SECTION 2: General info + Map */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-border bg-white p-5">
          <h3 className="mb-3 text-base font-bold text-secondary">ព័ត៌មានកម្មវិធី</h3>
          <p className="mb-5 text-sm leading-7 text-text-secondary">{activity.descriptionDetail}</p>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-border pt-5 text-sm">
            <InfoItem icon={FileText} label="ឈ្មោះកម្មវិធី" value={activity.name} />
            <InfoItem icon={CalendarDays} label="ថ្ងៃចាប់ផ្តើម" value={activity.startDate || activity.date} />
            <InfoItem icon={Tag} label="ប្រភេទកម្មវិធី" value={activity.type} />
            <InfoItem icon={Clock} label="រយៈពេល" value={activity.duration} />
            <InfoItem icon={MapPin} label="វិស័យ" value={activity.sector} />
            <InfoItem icon={Users} label="អ្នកទទួលខុសត្រូវ" value={activity.leader} />
            <InfoItem icon={Users} label="ចំនួនអ្នកចូលរួម" value={activity.participants} />
            <InfoItem icon={Phone} label="លេខទំនាក់ទំនង" value={activity.phone} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h3 className="mb-3 text-base font-bold text-secondary">ទីតាំង</h3>
          
            <a href={activity.mapLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-[190px] overflow-hidden rounded-lg bg-bg-page-gray">
            <Image
              src={activity.mapImage || "/map.jpg"}
              width={500}
              height={220}
              className="h-full w-full rounded-lg object-cover transition-opacity hover:opacity-90"
              alt="map"
            />
          </a>
          <p className="mt-3 flex items-start gap-2 text-sm text-text-secondary">
            <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
            {activity.address || activity.location}
          </p>
        </div>
      </div>

      {/* SECTION 3: Membership + Finance + Documents */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:col-span-2">
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="mb-4 text-base font-bold text-secondary">សមាជិកភាព</h3>
            <div className="grid grid-cols-2 gap-4">
              <SummaryCard
                icon={UserCheck}
                iconClassName="text-success"
                bgClassName="bg-success-bg"
                label="បានចូលរួម"
                value={activity.participants?.split("/")[0] || "0"}
              />
              <SummaryCard
                icon={UserX}
                iconClassName="text-error"
                bgClassName="bg-error-bg"
                label="មិនបានចូលរួម"
                value="0"
              />
            </div>
            <button className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white">
              <Users size={16} />
              សមាជិកចូលរួម
            </button>
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="mb-4 text-base font-bold text-secondary">ថវិកា</h3>
            <div className="grid grid-cols-2 gap-4">
              <SummaryCard
                icon={WalletCards}
                iconClassName="text-warning"
                bgClassName="bg-warning-bg"
                label="ចំណូល"
                value={activity.donation || "$ 0"}
              />
              <SummaryCard
                icon={WalletCards}
                iconClassName="text-error"
                bgClassName="bg-error-bg"
                label="ចំណាយ"
                value={activity.budget || "$ 0"}
              />
            </div>
            <button className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-warning text-sm font-semibold text-white">
              <WalletCards size={16} />
              វិភាគទាន
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h3 className="mb-4 text-base font-bold text-secondary">ឯកសារ</h3>
          <div className="space-y-3">
            {(activity.documents || []).map((doc) => (
              <div key={doc.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-bg text-error">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{doc.name}</p>
                    <p className="text-xs text-text-secondary">{doc.size}</p>
                  </div>
                </div>
                <Eye size={17} className="cursor-pointer text-primary" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoIcon({ icon: Icon, label, sub }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="mt-0.5 text-text-secondary" />
      <div>
        <p className="font-semibold text-text-primary">{label}</p>
        <p className="mt-1 text-text-secondary">{sub}</p>
      </div>
    </div>
  );
}

function StatusRow({ icon: Icon, label, last, children }) {
  return (
    <div className={`flex items-center justify-between text-sm ${last ? "" : "mb-4"}`}>
      <span className="flex items-center gap-2 text-text-secondary">
        {Icon && <Icon size={14} className="text-text-secondary" />}
        {label}
      </span>
      {children}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="grid grid-cols-2">
      <span className="flex items-center gap-2 font-semibold text-text-secondary">
        {Icon && <Icon size={14} className="text-text-secondary" />}
        {label}
      </span>
      <span className="text-text-primary">{value || "-"}</span>
    </div>
  );
}

function SummaryCard({ icon: Icon, iconClassName, bgClassName, label, value }) {
  return (
    <div className="rounded-lg border border-border p-4">
      {Icon && (
        <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${bgClassName || "bg-bg-page-gray"}`}>
          <Icon size={16} className={iconClassName} />
        </div>
      )}
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </div>
  );
}