import Image from "next/image";
import {
  FaEnvelope,
  FaFacebookF,
  FaLocationDot,
  FaPhone,
  FaTelegram,
  FaYoutube,
} from "react-icons/fa6";

export default function Footer(){

return (
<footer
className="
bg-[#171d52]
px-16
py-10
text-white
"
>
{/* TOP FOOTER */}
<div
className="
grid
grid-cols-[3fr_1fr_1fr_1fr]
gap-6
"
>
{/* Logo Section */}
<div>
<div
className="
flex
items-center
gap-3
"
>
<Image
src="/logo.png"
width={45}
height={45}
alt="logo"
className="rounded-full"
/>
<h3
className="
text-sm
font-bold
"
>
សមាគមយុវជន
</h3>
</div>
<p
className="
mt-5
max-w-xs
text-xs
leading-6
text-gray-400
"
>
ជួយអភិវឌ្ឍសង្គម និងសហគមន៍
តាមរយៈសកម្មភាពស្ម័គ្រចិត្ត
</p>
{/* Social */}
<div
className="
mt-5
flex
gap-3
"
>
<div
className="
flex
h-8
w-8
items-center
justify-center
rounded-md
bg-white/10
text-sm
"
>
<FaFacebookF aria-label="Facebook" />
</div>
<div
className="
flex
h-8
w-8
items-center
justify-center
rounded-md
bg-white/10
text-sm
"
>
<FaTelegram aria-label="Telegram" />
</div>
<div
className="
flex
h-8
w-8
items-center
justify-center
rounded-md
bg-white/10
text-sm
"
>
<FaYoutube aria-label="YouTube" />
</div>
</div>
</div>
{/* Menu */}
<div>
<h3
className="
text-sm
font-semibold
"
>
ការរុករក
</h3>
<div
className="
mt-5
space-y-3
text-xs
text-gray-400
"
>
<p>ទំព័រដើម</p>
<p>លក្ខណៈពិសេស</p>
<p>ទំនាក់ទំនង</p>
<p>គោលការណ៍ឯកជន</p>
</div>
</div>
{/* Information */}
<div>
<h3
className="
text-sm
font-semibold
"
>
ជំនួយ
</h3>
<div
className="
mt-5
space-y-3
text-xs
text-gray-400
">
<p>មជ្ឈមណ្ឌលជំនួយ</p>
<p>ឯកសារបច្ចេកទេស</p>
<p>ទំនាក់ទំនងក្រុម</p>
</div>
</div>
{/* Contact */}
<div>
<h3
className="
text-sm
font-semibold
"
>
ទំនាក់ទំនង
</h3>
<div
className="
mt-5
space-y-4
text-xs
text-gray-400
"
>
<div
className="
flex
items-center
gap-3
"
>
<FaLocationDot size={15} className="text-white" />
<span>
ភ្នំពេញ, កម្ពុជា
</span>
</div>
<div
className="
flex
items-center
gap-3
"
>
<FaPhone size={15} className="text-white" />
<span>
+855 12 345 678
</span>
</div>
<div
className="
flex
items-center
gap-3
"
>
<FaEnvelope size={15} className="text-white" />
<span>
info@cny.org.kh
</span>
</div>
</div>
</div>
</div>
{/* Bottom */}
<div
className="
mt-8
flex
items-center
justify-between
border-t
border-white/10
pt-5
text-xs
text-gray-400
"
>
<p>
© 2026 សមាគមថ្នាលយុវជនកម្ពុជា
</p>
<div
className="
flex
gap-8
"
>
<span>លក្ខខណ្ឌប្រើប្រាស់</span>
<span>គោលការណ៍ឯកជនភាព</span>
<span>ជំនួយ</span>
</div>
</div>
</footer>

)

}
