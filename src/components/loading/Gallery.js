import Image from "next/image";
import { gallery } from "./data";
export default function Gallery() {
  return (
    <section
      className="
      px-10
      py-12
      "
    >
      {/* Title */}
      <h2
        className="
        mt-10
        text-[32px]
        font-extrabold
        text-[#17194d]
        "
      >
        សកម្មភាពសប្បុរសធម៍របស់យើង
      </h2>
      <p
        className="
        mt-2
        text-sm
        text-gray-500
        "
      >
        រូបភាពខ្លះៗពីការចុះជួយសហគមន៍
      </p>
      {/* Images */}
      <div
        className="
        mt-8
        grid
        grid-cols-4
        gap-5
        "
      >
        {gallery.map((item, index) => (
          <div
            key={index}
            className="
              group
              h-[250px]
              overflow-hidden
              rounded-xl
              "
          >
            <Image
              src={item.image}
              width={400}
              height={200}
              alt={`gallery-${index}`}
              className="
                h-full
                w-full
                object-cover
                transition
                duration-300
                group-hover:scale-105
                "
            />
          </div>
        ))}
      </div>
    </section>
  );
}
