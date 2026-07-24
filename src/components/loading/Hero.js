import Image from "next/image";

export default function Hero() {
  return (
    <section
      className="
relative
grid
grid-cols-2
items-center
gap-8
overflow-hidden
px-16
py-20
"
    >
      {/* =========================
    PURPLE DECORATIONS
========================= */}

      <div
        className="
absolute
left-[90px]
top-[50px]
h-[70px]
w-[55px]
rotate-[-15deg]
rounded-xl
border
border-purple-200
opacity-70
"
      />

      <div
        className="
absolute
left-[420px]
top-[220px]
h-[110px]
w-[80px]
rotate-[12deg]
rounded-2xl
border
border-purple-300
opacity-60
"
      />

      <div
        className="
absolute
left-[520px]
top-[80px]
h-[90px]
w-[65px]
rotate-[20deg]
rounded-xl
border
border-purple-200
opacity-60
"
      />

      <div
        className="
absolute
left-[180px]
bottom-[40px]
h-[100px]
w-[75px]
rotate-[8deg]
rounded-xl
border
border-purple-200
opacity-60
"
      />

      <div
        className="
absolute
right-[260px]
top-[-20px]
h-[130px]
w-[90px]
rotate-[18deg]
rounded-2xl
border
border-purple-300
opacity-70
"
      />

      <div
        className="
absolute
right-[70px]
top-[250px]
h-[90px]
w-[70px]
rotate-[-12deg]
rounded-xl
border
border-purple-200
opacity-60
"
      />

      <div
        className="
absolute
right-[420px]
bottom-[20px]
h-[120px]
w-[85px]
rotate-[15deg]
rounded-2xl
border
border-purple-300
opacity-60
"
      />

      {/* Purple glow */}

      <div
        className="
absolute
right-[120px]
top-[100px]
h-[350px]
w-[350px]
rounded-full
bg-purple-100/40
blur-3xl
"
      />

      {/* =========================
        TEXT AREA
========================= */}

      <div
        className="
relative
z-10
max-w-[560px]
"
      >
        <h1
          className="
text-[50px]
font-extrabold
leading-[1.12]
tracking-tight
text-[#17194d]
"
        >
          កសាងអនាគតយុវជនកម្ពុជា
          <br />
          <span
            className="
text-[#6541b5]
"
          >
            ដើម្បីសង្គមជាតិកាន់តែប្រសើរ
          </span>
        </h1>

        <p
          className="
mt-6
max-w-[520px]
text-[16px]
leading-8
text-gray-500
"
        >
          សមាគមថ្នាលយុវជនជាតិ ប្តេជ្ញាចិត្តក្នុងការអភិវឌ្ឍន៍សមត្ថភាព
          ភាពជាអ្នកដឹកនាំ និងស្មារតីសប្បុរសធម៌របស់យុវជន
          ដើម្បីក្លាយជាសសរទ្រូងដ៏រឹងមាំរបស់ប្រទេសជាតិ។
        </p>

        <div
          className="
mt-8
flex
gap-4
"
        >
          <button
            className="
rounded-lg
bg-[#4b3192]
px-8
py-3
text-sm
font-medium
text-white
shadow-lg
shadow-purple-200
transition-all
duration-300
hover:-translate-y-0.5
hover:bg-[#392477]
hover:shadow-xl
hover:shadow-purple-300/50
"
          >
            ចូលរួមជាមួយ →
          </button>

          <button
            className="
rounded-lg
border
border-gray-200
px-8
py-3
text-sm
font-medium
text-gray-600
transition-all
duration-300
hover:-translate-y-0.5
hover:border-[#4b3192]
hover:bg-[#4b3192]/5
hover:text-[#4b3192]
hover:shadow-md
"
          >
            ស្វែងយល់
          </button>
        </div>
      </div>

      {/* =========================
        IMAGE AREA
========================= */}

      <div
        className="
relative
h-[430px]
"
      >
        {/* Back Image */}

        <div
          className="
absolute
right-[-90px]
top-[90px]
rotate-[10deg]
rounded-[35px]
bg-white
p-4
shadow-2xl
border
border-gray-100
transition-all
duration-500
ease-out
hover:z-20
hover:-translate-y-3
hover:rotate-[6deg]
hover:scale-[1.03]
hover:shadow-[0_28px_55px_rgba(75,49,146,0.2)]
"
        >
          <Image
            src="/3.png"
            width={420}
            height={420}
            alt="image3"
            className="
h-[300px]
w-[250px]
rounded-[28px]
object-cover
"
          />
        </div>

        {/* Middle Image */}

        <div
          className="
absolute
right-[90px]
top-[45px]
rotate-[5deg]
rounded-[35px]
bg-white
p-4
shadow-2xl
border
border-gray-100
transition-all
duration-500
ease-out
hover:z-20
hover:-translate-y-3
hover:rotate-0
hover:scale-[1.03]
hover:shadow-[0_28px_55px_rgba(75,49,146,0.2)]
"
        >
          <Image
            src="/2.png"
            width={450}
            height={430}
            alt="image2"
            className="
h-[330px]
w-[270px]
rounded-[28px]
object-cover
"
          />
        </div>

        {/* Front Image */}

        <div
          className="
absolute
right-[300px]
top-[80px]
rotate-[-8deg]
rounded-[35px]
bg-white
p-4
shadow-2xl
border
border-gray-100
transition-all
duration-500
ease-out
hover:z-20
hover:-translate-y-3
hover:rotate-[-4deg]
hover:scale-[1.03]
hover:shadow-[0_28px_55px_rgba(75,49,146,0.2)]
"
        >
          <Image
            src="/1.png"
            width={400}
            height={420}
            alt="image1"
            className="
h-[310px]
w-[230px]
rounded-[28px]
object-cover
"
          />
        </div>
      </div>
    </section>
  );
}
