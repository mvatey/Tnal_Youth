import Image from "next/image";

import {
  MapPin,
  Phone,
  Mail
} from "lucide-react";



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
f
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
◎
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
▶
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
ម៉ឺនុយ
</h3>



<div
className="
mt-5
space-y-3
text-xs
text-gray-400
"
>

<p>
ទំព័រដើម
</p>


<p>
កម្មវិធី
</p>


<p>
សកម្មភាព
</p>


<p>
អំពីយើង
</p>


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

ព័ត៌មាន

</h3>




<div
className="
mt-5
space-y-3
text-xs
text-gray-400
"
>


<p>
ព័ត៌មានថ្មីៗ
</p>


<p>
សកម្មភាពសង្គម
</p>


<p>
ព្រឹត្តិការណ៍
</p>


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

<MapPin size={15}/>

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

<Phone size={15}/>

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

<Mail size={15}/>

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
© 2026 សមាគមយុវជន
</p>



<div
className="
flex
gap-8
"
>

<span>
គោលការណ៍ឯកជនភាព
</span>


<span>
លក្ខខណ្ឌប្រើប្រាស់
</span>


<span>
ជំនួយ
</span>


</div>



</div>





</footer>


)

}