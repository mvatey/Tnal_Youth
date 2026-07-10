// app/landing/page.js
import Link from "next/link";
import Image from "next/image";
import activityData from "@/data/activity.json";
import {
  CalendarDays,
  MapPin,
  Facebook,
  Youtube,
  Instagram,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";

const NAV_LINKS = [
  { label: "ទំព័រដើម", href: "/" },
  { label: "កម្មវិធីរបស់យើង", href: "/activity" },
  { label: "អំពីយើង", href: "/about" },
];

export default function LandingPage() {
  const featured = activityData.slice(0, 10);

  return (
    <div className="min-h-screen bg-white">
      {/* ───────────── Header ───────────── */}
      <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              កយ
            </div>
            <span className="text-sm font-bold text-secondary">សមាគមយុវជនកម្ពុជា</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-text-secondary md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
        <Link href="/auth/login" className="flex h-9 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-secondary-hover">
            ចូលប្រើប្រាស់
          </Link>
        </div>
      </header>

      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-secondary md:text-4xl">
              កសាងអនាគតយុវជនកម្ពុជា
              <br />
              ដើម្បីសង្គមកាន់តែប្រសើរ
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-text-secondary">
              សមាគមរបស់យើងបង្កើតកម្មវិធីស្ម័គ្រចិត្តជាច្រើន ដើម្បីផ្តល់ឱកាសដល់យុវជនចូលរួម
              អភិវឌ្ឍសហគមន៍ និងបំពាក់ជំនាញសម្រាប់អនាគត។
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/activity"
                className="flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-secondary-hover"
              >
                មើលកម្មវិធីទាំងអស់
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/about"
                className="flex h-11 items-center rounded-full border border-border px-6 text-sm font-semibold text-secondary hover:bg-bg-page-gray"
              >
                ស្វែងយល់បន្ថែម
              </Link>
            </div>
          </div>

          {/* photo collage */}
          <div className="relative mx-auto h-[280px] w-full max-w-md">
            <div className="absolute left-0 top-6 h-44 w-56 -rotate-6 overflow-hidden rounded-xl border-4 border-white shadow-lg">
              <Image src="/hero/photo-1.jpg" alt="" fill className="object-cover" />
            </div>
            <div className="absolute right-0 top-0 h-40 w-52 rotate-3 overflow-hidden rounded-xl border-4 border-white shadow-lg">
              <Image src="/hero/photo-2.jpg" alt="" fill className="object-cover" />
            </div>
            <div className="absolute bottom-0 right-10 h-36 w-48 -rotate-2 overflow-hidden rounded-xl border-4 border-white shadow-lg">
              <Image src="/hero/photo-3.jpg" alt="" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Gallery strip ───────────── */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-lg font-bold text-secondary">សកម្មភាពសមាជិកសរបស់យើង</h2>
        <p className="mt-1 text-sm text-text-secondary">រូបភាពខ្លះៗពីកម្មវិធីកន្លងមក</p>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {["photo-4", "photo-5", "photo-6", "photo-7"].map((img) => (
            <div key={img} className="relative h-40 overflow-hidden rounded-xl">
              <Image src={`/hero/${img}.jpg`} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── Featured activities ───────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-lg font-bold text-secondary">ព័ត៌មានកម្មវិធីសាធារណៈ</h2>
        <p className="mt-1 text-sm text-text-secondary">កម្មវិធីទាំងអស់ដែលបានធ្វើ និងនឹងធ្វើឡើង</p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {featured.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </section>

      {/* ───────────── Footer ───────────── */}
      <footer className="bg-secondary text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-secondary">
                កយ
              </div>
              <span className="text-sm font-bold">សមាគមយុវជនកម្ពុជា</span>
            </div>
            <p className="mt-4 text-xs leading-6 text-white/70">
              អង្គការមិនរកប្រាក់ចំណេញ ដែលធ្វើការជាមួយសហគមន៍ក្នុងវិស័យបរិស្ថាន និងអប់រំ។
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Facebook size={16} />
              <Youtube size={16} />
              <Instagram size={16} />
            </div>
          </div>

          <FooterCol title="ទំព័រ" links={NAV_LINKS} />
          <FooterCol title="ជំនួយ" links={[{ label: "សំណួរញឹកញាប់", href: "/faq" }, { label: "គោលការណ៍ភាពឯកជន", href: "/privacy" }]} />

          <div>
            <p className="text-sm font-bold">ទំនាក់ទំនង</p>
            <div className="mt-4 space-y-2 text-xs text-white/70">
              <p className="flex items-center gap-2"><Phone size={14} />(023) 456 789</p>
              <p className="flex items-center gap-2"><Mail size={14} />info@example.org</p>
              <p className="flex items-center gap-2"><MapPin size={14} />ភ្នំពេញ, កម្ពុជា</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
          © {new Date().getFullYear()} សមាគមយុវជនកម្ពុជា។ រក្សាសិទ្ធិគ្រប់យ៉ាង។
        </div>
      </footer>
    </div>
  );
}

function ActivityCard({ activity }) {
  const statusLabel = activity.status === "completed" ? "បានបញ្ចប់" : "នាពេលខាងមុខ";
  const statusStyle =
    activity.status === "completed" ? "bg-success-bg text-success" : "bg-secondary-light text-secondary";

  return (
    <Link
      href={`/activity/${activity.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative h-28 w-full">
        <Image src={activity.image} alt={activity.name} fill className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <span className={`mb-2 w-fit rounded-full px-2 py-0.5 text-[10px] ${statusStyle}`}>{statusLabel}</span>
        <p className="line-clamp-2 text-sm font-semibold text-text-primary">{activity.name}</p>
        <div className="mt-2 space-y-1 text-[11px] text-text-secondary">
          <p className="flex items-center gap-1"><CalendarDays size={12} />{activity.date}</p>
          <p className="flex items-center gap-1"><MapPin size={12} />{activity.branch}</p>
        </div>
        <span className="mt-3 flex h-8 items-center justify-center rounded-lg bg-primary text-[11px] font-semibold text-white group-hover:bg-secondary-hover">
          មើលលម្អិត
        </span>
      </div>
    </Link>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <p className="text-sm font-bold">{title}</p>
      <ul className="mt-4 space-y-2 text-xs text-white/70">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}