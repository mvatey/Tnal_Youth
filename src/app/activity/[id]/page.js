import Image from "next/image";
import Link from "next/link";

import { Calendar, MapPin, Clock } from "lucide-react";

const activities = [
  {
    title: "កម្មវិធីចែកអំណោយ",
    image: "/5.jpg",
    date: "Feb 16, 2026",
    time: "8:00 AM",
    location: "ភ្នំពេញ",

    description: "សកម្មភាពចែកអំណោយជួយដល់ប្រជាពលរដ្ឋ និងសហគមន៍ដែលមានតម្រូវការ។",

    gallery: ["/5.jpg", "/6.jpg", "/7.jpg"],
  },

  {
    title: "សកម្មភាពយុវជន",
    image: "/6.jpg",
    date: "Mar 10, 2026",
    time: "9:30 AM",
    location: "សៀមរាប",

    description: "ការចូលរួមរបស់យុវជនក្នុងការអភិវឌ្ឍសង្គម។",

    gallery: ["/6.jpg", "/7.jpg", "/8.jpg"],
  },
];

export default function ActivityDetail({ params }) {
  const activity = activities[params.id];

  if (!activity) {
    return <div>Not Found</div>;
  }

  return (
    <div
      className="
min-h-screen
bg-white
"
    >
      {/* HERO IMAGE */}

      <section
        className="
relative
h-[420px]
overflow-hidden
"
      >
        <Image
          src={activity.image}
          fill
          alt="cover"
          className="
object-cover
"
        />

        <div
          className="
absolute
inset-0
bg-black/40
"
        />

        <div
          className="
absolute
bottom-10
left-10
rounded-xl
bg-white/90
p-6
shadow-xl
"
        >
          <h1
            className="
text-2xl
font-bold
text-[#17194d]
"
          >
            {activity.title}
          </h1>

          <div
            className="
mt-3
flex
gap-5
text-sm
text-gray-500
"
          >
            <span>
              <Calendar size={14} className="inline" />
              {activity.date}
            </span>

            <span>
              <Clock size={14} className="inline" />
              {activity.time}
            </span>

            <span>
              <MapPin size={14} className="inline" />
              {activity.location}
            </span>
          </div>
        </div>
      </section>

      {/* CONTENT */}

      <section
        className="
mx-auto
max-w-5xl
px-6
py-10
"
      >
        <p
          className="
leading-8
text-gray-600
"
        >
          {activity.description}
        </p>

        {/* Gallery */}

        <h2
          className="
mt-10
text-xl
font-bold
text-[#17194d]
"
        >
          រូបភាពសកម្មភាព
        </h2>

        <div
          className="
mt-5
grid
grid-cols-3
gap-5
"
        >
          {activity.gallery.map((img, index) => (
            <div
              key={index}
              className="
overflow-hidden
rounded-xl
"
            >
              <Image
                src={img}
                width={400}
                height={250}
                alt="gallery"
                className="
h-[220px]
w-full
object-cover
"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
