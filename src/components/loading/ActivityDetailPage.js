import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Facebook,
  Mail,
  MapPin,
  Phone,
  Share2,
  Users,
} from "lucide-react";

import Header from "./Header";
import Footer from "./Footer";
import { activities, gallery } from "./data";

function DetailHero({ activity }) {
  return (
    <section className="relative">
      <div className="relative h-[360px] overflow-hidden">
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <Link
        href="/loading"
        aria-label="Back"
        className="absolute left-10 top-8 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#17194d] shadow-lg transition hover:bg-gray-100"
      >
        <ArrowLeft size={26} />
      </Link>

      <div className="mx-auto -mt-24 max-w-6xl px-10">
        <div className="relative rounded-xl border border-white/70 bg-white/85 p-7 shadow-lg backdrop-blur">
          <span className="inline-flex rounded-md bg-green-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Completed Workshop
          </span>

          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-[#17194d]">
            {activity.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <Calendar size={16} className="text-[#4b3192]" />
              {activity.date}
            </span>

            <span className="inline-flex items-center gap-2">
              <Clock size={16} className="text-[#4b3192]" />
              {activity.time}
            </span>

            <span className="inline-flex items-center gap-2">
              <MapPin size={16} className="text-[#4b3192]" />
              {activity.location}
            </span>

            <span className="inline-flex items-center gap-2">
              <Users size={16} className="text-[#4b3192]" />
              អ្នកចូលរួម: 60/90
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailContent({ activity }) {
  return (
    <section className="mx-auto max-w-6xl px-10 pt-14">
      <div className="space-y-5 text-[15px] leading-8 text-gray-600">
        <p>{activity.description}</p>
        <p>
          កម្មវិធីនេះត្រូវបានរៀបចំឡើងដើម្បីលើកកម្ពស់ការចូលរួមរបស់យុវជន
          និងពង្រឹងទំនាក់ទំនងជាមួយសហគមន៍មូលដ្ឋាន។ ក្រុមការងារបានចូលរួម
          ចែករំលែកបទពិសោធន៍ ផ្តល់ការគាំទ្រ និងរៀបចំសកម្មភាពដែលមានប្រយោជន៍
          សម្រាប់ប្រជាពលរដ្ឋនៅតំបន់ {activity.location}។
        </p>
        <p>
          សមាគមនឹងបន្តរៀបចំកម្មវិធីស្រដៀងគ្នានេះ ដើម្បីបង្កើនឱកាសសម្រាប់
          សមាជិក និងយុវជនក្នុងការចូលរួមអភិវឌ្ឍសង្គមប្រកបដោយទំនួលខុសត្រូវ។
        </p>
      </div>

      <div className="mt-8 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5">
        <Image
          src="/admin.jpg"
          width={64}
          height={64}
          alt="organizer"
          className="h-16 w-16 rounded-full object-cover"
        />
        <div>
          <h3 className="text-base font-bold text-[#17194d]">លោក សុខ សុភា</h3>
          <p className="mt-1 text-sm font-medium text-[#4b3192]">អ្នករៀបចំកម្មវិធី</p>
          <p className="mt-1 text-xs text-gray-500">លេខទូរស័ព្ទទំនាក់ទំនង: 012 345 678</p>
        </div>
      </div>
    </section>
  );
}

function DetailGallery({ activity }) {
  const images = [
    activity.image,
    ...gallery.map((item) => item.image),
    ...activities
      .filter((item) => item.id !== activity.id)
      .slice(0, 3)
      .map((item) => item.image),
  ].slice(0, 3);

  return (
    <section className="mx-auto max-w-6xl px-10 pt-12">
      <h2 className="text-3xl font-extrabold text-[#17194d]">វិចិត្រសាលរូបភាព</h2>
      <p className="mt-2 text-sm text-gray-500">រូបភាពពីកម្មវិធីនេះ</p>

      <div className="mt-6 grid grid-cols-3 gap-7">
        {images.map((image, index) => (
          <div key={`${image}-${index}`} className="h-[320px] overflow-hidden rounded-xl shadow-md">
            <Image
              src={image}
              width={420}
              height={320}
              alt={`${activity.title}-${index + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function EventMap({ activity }) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${activity.location} Cambodia`
  )}`;

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-[1fr_320px] gap-4 px-10 pt-12">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-2xl font-extrabold text-[#17194d]">ទីតាំងកម្មវិធី</h2>
        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 block overflow-hidden rounded-lg border border-gray-200 bg-[#eef3ec]"
        >
          <div className="relative h-[230px]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,255,255,.65) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.65) 1px, transparent 1px)",
                backgroundSize: "58px 58px",
              }}
            />
            <div className="absolute left-0 right-0 top-16 h-8 bg-yellow-200/80" />
            <div className="absolute bottom-12 left-0 right-0 h-8 rotate-[-8deg] bg-green-200/80" />
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <MapPin size={42} className="fill-red-500 text-red-600" />
              <span className="mt-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#17194d] shadow">
                {activity.location}
              </span>
            </div>
          </div>
        </a>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-2xl font-extrabold text-[#17194d]">ទំនាក់ទំនង</h2>
        <div className="mt-6 space-y-5 text-sm text-gray-600">
          <div className="flex gap-3">
            <MapPin className="mt-1 text-[#4b3192]" size={18} />
            <div>
              <p className="font-bold text-[#17194d]">អាសយដ្ឋាន</p>
              <p>{activity.location}, កម្ពុជា</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="mt-1 text-[#4b3192]" size={18} />
            <div>
              <p className="font-bold text-[#17194d]">លេខទូរស័ព្ទ</p>
              <p>+855 12 345 678</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Mail className="mt-1 text-[#4b3192]" size={18} />
            <div>
              <p className="font-bold text-[#17194d]">អ៊ីមែល</p>
              <p>info@cny.org.kh</p>
            </div>
          </div>
        </div>

        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#17194d] py-3 text-sm font-bold text-white"
        >
          <MapPin size={16} />
          បើកផែនទី
        </a>
      </div>
    </section>
  );
}

function ShareEvent() {
  return (
    <section className="mx-auto max-w-6xl px-10 pt-7">
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4b3192]/10 text-[#4b3192]">
            <Share2 size={22} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#17194d]">ចែករំលែកកម្មវិធីនេះ</h2>
            <p className="mt-1 text-sm text-gray-500">ចែករំលែកព័ត៌មានកម្មវិធីទៅកាន់មិត្តភក្តិរបស់អ្នក។</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#17194d] px-6 py-3 text-sm font-bold text-white">
            <Facebook size={16} />
            ចែករំលែក Facebook
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-3 text-sm font-bold text-[#17194d]">
            <Copy size={16} />
            ចម្លងតំណ
          </button>
        </div>
      </div>
    </section>
  );
}

function RelatedEvents({ activity }) {
  const related = activities.filter((item) => item.id !== activity.id).slice(0, 4);

  return (
    <section className="mx-auto max-w-6xl px-10 py-12">
      <h2 className="text-3xl font-extrabold text-[#17194d]">កម្មវិធីផ្សេងៗ</h2>
      <p className="mt-2 text-sm text-gray-500">សកម្មភាពដែលអ្នកអាចចាប់អារម្មណ៍</p>

      <div className="mt-6 grid grid-cols-4 gap-5">
        {related.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <Image
              src={item.image}
              width={280}
              height={170}
              alt={item.title}
              className="h-[170px] w-full object-cover"
            />
            <div className="p-4">
              <h3 className="line-clamp-2 text-sm font-extrabold leading-6 text-[#17194d]">
                {item.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                {item.description}
              </p>
              <Link
                href={`/loading/detail?id=${item.id}`}
                className="mt-4 inline-flex text-sm font-bold text-[#4b3192]"
              >
                មើលបន្ថែម →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ActivityDetailPage({ activity }) {
  return (
    <div className="min-h-screen bg-white text-[#17194d]">
      <Header />
      <main>
        <DetailHero activity={activity} />
        <DetailContent activity={activity} />
        <DetailGallery activity={activity} />
        <EventMap activity={activity} />
        <ShareEvent />
        <RelatedEvents activity={activity} />
      </main>
      <Footer />
    </div>
  );
}
