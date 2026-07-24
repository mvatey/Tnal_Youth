import Image from "next/image";
import Link from "next/link";
import {
  FaCalendarDays,
  FaFacebookF,
  FaLocationDot,
  FaUserGroup,
} from "react-icons/fa6";

import {
  ArrowLeft,
  Link2,
  Mail,
  Map,
  MapPin,
  Phone,
  Share2,
} from "lucide-react";

import Header from "./Header";
import Footer from "./Footer";
import { activities, gallery } from "./data";

function DetailHero({ activity }) {
  return (
    <section className="relative">
      <div className="relative h-[360px] overflow-hidden">
        <Image
          key={activity.id}
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
        className="absolute left-10 top-8 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#17194d] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4b3192] hover:text-white hover:shadow-xl"
      >
        <ArrowLeft size={26} />
      </Link>

      <div className="relative mx-auto -mt-[145px] max-w-5xl px-20">
        <div className="relative min-h-[123px] overflow-hidden rounded-xl border border-white/70 bg-white/80 px-5 py-4 shadow-[0_14px_35px_rgba(23,25,77,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#4b3192]/25 hover:shadow-[0_20px_45px_rgba(75,49,146,0.22)]">
          <span className="inline-flex rounded-full bg-green-700 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
            Completed Workshop
          </span>

          <h1 className="mt-3 text-[22px] font-extrabold leading-tight text-[#17194d]">
            {activity.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-2">
              <FaCalendarDays size={18} className="shrink-0 text-[#7047B8]" />
              {activity.date} {activity.time}
            </span>
            <span className="inline-flex items-center gap-2">
              <FaLocationDot size={18} className="shrink-0 text-[#7047B8]" />
              {activity.location}
            </span>

            <span className="inline-flex items-center gap-2">
              <FaUserGroup size={18} className="shrink-0 text-[#7047B8]" />
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
    <section className="mx-auto max-w-6xl px-10 pt-8">
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

      <div className="mt-8 flex items-center gap-4 rounded-xl border border-[#D9DDE5] bg-[#F8F9FB] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#4b3192]/25 hover:shadow-xl hover:shadow-[#4b3192]/10">
        <Image
          src="/ch.jpg"
          width={64}
          height={64}
          alt="organizer"
          className="h-16 w-16 rounded-full object-cover"
        />
        <div>
          <h3 className="text-base font-bold text-[#17194d]">លោក ស្រ៊ុន សុចិត្រា</h3>
          <p className="mt-1 text-xs font-medium text-[#4b3192]">អ្នករៀបចំកម្មវិធី</p>
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
  ];

  return (
    <section className="mx-auto max-w-6xl px-10 pt-12">
      <h2 className="text-2xl font-extrabold text-[#17194d]">វិចិត្រសាលរូបភាព</h2>
      <p className="mt-1 text-xs text-gray-500">រូបភាពពីកម្មវិធីនេះ</p>

      <div
        dir="ltr"
        className="mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            dir="ltr"
            className="group h-[255px] w-[360px] min-w-[360px] snap-start flex-none overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#4b3192]/15"
          >
            <Image
              src={image}
              width={420}
              height={320}
              alt={`${activity.title}-${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function EventMap({ activity }) {
  const locationQuery = `${activity.location}, Cambodia`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`;

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_290px] gap-3 px-10 pt-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#4b3192]/25 hover:shadow-xl hover:shadow-[#4b3192]/10">
        <h2 className="text-xl font-extrabold text-[#17194d]">ទីតាំងកម្មវិធី</h2>
        <div className="mt-5 h-[235px] overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
          <iframe
            src={mapEmbedUrl}
            title={`Google Map of ${activity.location}`}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#4b3192]/25 hover:shadow-xl hover:shadow-[#4b3192]/10">
        <h2 className="text-xl font-extrabold text-[#17194d]">ទំនាក់ទំនង</h2>
        <div className="mt-6 space-y-5 text-xs text-gray-500">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8F9FB] text-[#17194d]">
              <MapPin size={18} />
            </span>
            <div>
              <p className="font-bold text-[#17194d]">អាសយដ្ឋាន</p>
              <p className="mt-1 leading-5">{locationQuery}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8F9FB] text-[#17194d]">
              <Phone size={18} />
            </span>
            <div>
              <p className="font-bold text-[#17194d]">លេខទូរស័ព្ទ</p>
              <p className="mt-1">+855 12 345 678</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8F9FB] text-[#17194d]">
              <Mail size={18} />
            </span>
            <div>
              <p className="font-bold text-[#17194d]">អ៊ីមែល</p>
              <p className="mt-1">info@cny.org.kh</p>
            </div>
          </div>
        </div>

        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#17194d] py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#292f69] hover:shadow-lg hover:shadow-[#17194d]/25"
        >
          <Map size={18} strokeWidth={2.2} />
          បង្ហាញផ្លូវ
        </a>
      </div>
    </section>
  );
}

function ShareEvent() {
  return (
    <section className="mx-auto max-w-6xl px-10 pt-7">
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-[#F8F9FB] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#4b3192]/25 hover:shadow-xl hover:shadow-[#4b3192]/10">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-100 bg-white text-[#4b3192] shadow-sm">
            <Share2 size={18} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#17194d]">ចែករំលែកកម្មវិធីនេះ</h2>
            <p className="mt-1 text-sm text-gray-500">ជួយផ្សព្វផ្សាយភាពជោគជ័យនៃកម្មវិធីនេះទៅកាន់សហគមន៍របស់អ្នក។</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#17194d] px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#292f69] hover:shadow-lg hover:shadow-[#17194d]/25">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#17194d]">
              <FaFacebookF size={10} />
            </span>
            ចែករំលែក Facebook
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-[#17194d] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4b3192] hover:bg-[#4b3192]/5 hover:shadow-md">
            <Link2 size={17} strokeWidth={2.2} />
            ចម្លងតំណ (Copy Link)
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
      <p className="mt-2 text-sm text-gray-500">សកម្មភាពពាក់ព័ន្ធផ្សេងៗទៀត</p>

      <div className="mt-6 grid grid-cols-4 gap-5">
        {related.map((item) => (
          <div key={item.id} className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#4b3192]/25 hover:shadow-xl hover:shadow-[#4b3192]/10">
            <Image
              src={item.image}
              width={280}
              height={170}
              alt={item.title}
              className="h-[170px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                className="mt-4 inline-flex rounded-md text-sm font-bold text-[#4b3192] transition-all duration-300 hover:translate-x-1 hover:text-[#392477]"
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
