import activityData from "@/data/activityRecords.json";
import participantData from "@/data/participantRecords.json";
import {
  InfoIcon,
  InfoItem,
  StatusRow,
  SummaryCard,
} from "@/components/activity/ActivityDetailItems";
import Image from "next/image";
import Link from "next/link";
import { FaUsers } from "react-icons/fa";
import { notFound } from "next/navigation";
import {
  Banknote,
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
  CircleDollarSign,
  Sprout,
  UserCheck,
  UserX,
  Users,
  ChevronRight
} from "lucide-react";

export default async function ActivityDetailPage({ params }) {
  const { id } = await params;
  const activity = activityData.find((item) => String(item.id) === id);

  if (!activity) {
  notFound();
  }
  const activityParticipants = participantData.filter(
  (participant) =>
    String(participant.activityId) === String(activity.id)
);

const attendedCount = activityParticipants.filter(
  (participant) =>
    participant.status === "បានចូលរួម"
).length;

const absentCount = activityParticipants.filter(
  (participant) =>
    participant.status === "មិនបានចូលរួម"
).length;

const totalParticipantCount = activityParticipants.length;

  const statusLabel = activity.status === "completed" ? "បានបញ្ចប់" : "នាពេលខាងមុខ";
  const statusStyle = activity.status === "completed" ? "bg-success-bg text-success" : "bg-secondary-light text-secondary";
  const visibilityLabel = activity.visibility || "សាធារណៈ";

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-text-secondary">
            <div className="flex items-center gap-1 text-sm">
              <Link
                href="/activity"
                className="text-text-secondary transition hover:text-primary"
              >
                កម្មវិធី
              </Link>

              <ChevronRight size={14} className="text-text-secondary" />

              <span className="font-semibold text-primary">
                ព័ត៌មានលម្អិត
              </span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-secondary">ព័ត៌មានកម្មវិធី</h1>
        </div>

        <Link href={`/activity/create?edit=${activity.id}`} className="flex h-[34px] items-center gap-2 rounded-lg bg-secondary px-4 text-sm font-medium text-white hover:bg-secondary-hover">
          <Pencil size={15} />
          កែព័ត៌មាន
        </Link>
      </div>

      {/* SECTION 1: Hero + status summary */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-border bg-white p-5">
          <div className="flex flex-col gap-5 md:flex-row">
            <Image src={activity.image} width={300} height={200} className="h-[200px] w-full shrink-0 rounded-lg object-cover md:w-[300px]" alt={activity.name} />

            {/* no more justify-between — content hugs the top, icon row sits right under description */}
            <div className="flex flex-1 flex-col">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-text-primary">{activity.name}</h2>
                  <span className={`rounded-full px-3 py-1 text-[11px] ${statusStyle}`}>{statusLabel}</span>
                </div>

                <p className="mt-2 text-sm text-text-secondary">{activity.descriptionBrief}</p>
              </div>
              <div className="mt-12 grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-5 text-xs text-text-secondary">
                <div className="flex items-start gap-2">
                  <CalendarDays size={15} className="mt-0.5 shrink-0 text-text-secondary" />

                  <div>
                    <p className="font-semibold text-text-primary">
                      {activity.date}
                    </p>

                    <p className="mt-1 whitespace-nowrap text-text-secondary">
                      {activity.startTime} - {activity.endTime}
                    </p>
                  </div>
                </div>
                <InfoIcon icon={MapPin} label={activity.branch} sub={activity.location} />
                <InfoIcon icon={Users}  label={activity.participants} sub="បានចូលរួម"/>
                <InfoIcon icon={Sprout} label="បរិស្ថាន" sub="ប្រភេទវិស័យ" />
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
        <div className="flex flex-col xl:col-span-2">
          <h3 className="mb-2 text-base font-bold text-secondary">ទិដ្ឋភាពទូទៅ</h3>
          <div className="flex-1 rounded-xl border border-border bg-white p-5">
            <p className="mb-5 text-sm leading-7 text-text-secondary">{activity.descriptionDetail}</p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-border pt-5 text-sm">
              <InfoItem icon={FileText} label="ឈ្មោះកម្មវិធី" value={activity.name} />
              <InfoItem icon={CalendarDays} label="ថ្ងៃចាប់ផ្តើម" value={activity.startDate || activity.date} />
              <InfoItem icon={Tag} label="ប្រភេទកម្មវិធី" value={activity.type} />
              <InfoItem icon={Clock} label="រយៈពេលចូលរួម" value={activity.duration} />
              <InfoItem icon={MapPin} label="វិស័យ" value={activity.sector} />
              <InfoItem icon={Users} label="អ្នកគ្រប់គ្រង" value={activity.leader} />
              <InfoItem icon={Users} label="ចំនួនអ្នកចូលរួម" value={`${attendedCount}/${totalParticipantCount} នាក់`}/>
              <InfoItem icon={Phone} label="លេខទំនាក់ទំនង" value={activity.phone} />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <h3 className="mb-2 text-base font-bold text-secondary">ទីតាំង</h3>
          <div className="flex-1 rounded-xl border border-border bg-white p-5">
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
      </div>

      {/* SECTION 3: Membership + Finance + Documents */}
<div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
  {/* Member */}
  <div className="rounded-xl border border-border bg-white p-5">
    <h3 className="mb-4 text-base font-bold text-secondary">សមាសភាព</h3>

    <div className="grid grid-cols-2 gap-4">
      <SummaryCard
        icon={UserCheck}
        iconClass="bg-success-bg text-success"
        label="បានចូលរួម"
        value={attendedCount}
        unit="នាក់"
      />

      <SummaryCard
        icon={UserX}
        iconClass="bg-error-bg text-error"
        label="មិនបានចូលរួម"
        value={absentCount}
        unit="នាក់"
      /><InfoIcon
  icon={Users}
  label={`${attendedCount}/${totalParticipantCount}`}
  sub="បានចូលរួម"
/>
    </div>

      <Link
        href={`/activity/${activity.id}/participants`}
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-hover"
      >
        <FaUsers size={15} />
        សមាសភាពចូលរួម
      </Link>
  </div>

{/* Budget */}
<div className="rounded-xl border border-border bg-white p-5">
  <h3 className="mb-4 text-base font-bold text-secondary">
    ថវិកា
  </h3>

  <div className="grid grid-cols-2 gap-4">
    <SummaryCard
      icon={CircleDollarSign}
      iconClass="bg-warning-bg text-warning"
      label="ចំណូល"
      value={activity.donation || "$ 0"}
    />

    <SummaryCard
      icon={Banknote}
      iconClass="bg-error-bg text-error"
      label="ចំណាយ"
      value={activity.budget || "$ 0"}
    />
  </div>

  <div className="mt-5 grid grid-cols-2 gap-3">
    <Link
      href={`/activity/create/income?activityId=${activity.id}`}
      className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#D3AF3C] text-sm font-semibold text-white transition-colors hover:bg-[#BF9C2D]"
    >
      <CircleDollarSign size={16} />
      ចំណូល
    </Link>

    <Link
      href={`/activity/create/expense?activityId=${activity.id}`}
      className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#D9534F] text-sm font-semibold text-white transition-colors hover:bg-[#C4413E]"
    >
      <Banknote size={16} />
      ចំណាយ
    </Link>
  </div>
</div>

  {/* Documents */}
  <div className="rounded-xl border border-border bg-white p-5">
    <h3 className="mb-4 text-base font-bold text-secondary">ឯកសារ</h3>

    <div className="space-y-3">
      {(activity.documents || []).map((doc) => {
        const fileStyle =
          doc.type === "pdf"
            ? "bg-error-bg text-error"
            : "bg-blue-100 text-blue-600";

        return (
          <div
            key={doc.name}
            className="flex items-center justify-between rounded-lg border border-border p-3"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${fileStyle}`}
              >
                <FileText size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {doc.name}
                </p>

                <p className="text-xs text-text-secondary">
                  {doc.size}
                </p>
              </div>
            </div>

            <Eye
              size={17}
              className="cursor-pointer text-primary transition hover:text-primary-hover"
            />
          </div>
        );
      })}
    </div>
  </div>
</div>
</div>
);
}
