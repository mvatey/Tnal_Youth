"use client";

import Image from "next/image";
import {
  Calendar,
  MapPin,
  Clock,
  Facebook,
  Youtube,
  Instagram,
} from "lucide-react";


export default function LoadingPage(){


const activities = [
  {
    image:"/meeting.jpg",
    title:"កម្មវិធីសំណេះសំណាល",
  },
  {
    image:"/member.jpg",
    title:"សកម្មភាពសហគមន៍",
  },
  {
    image:"/admin.jpg",
    title:"ការងារសង្គម",
  },
  {
    image:"/tree planning.jpg",
    title:"ដាំដើមឈើ"
  }
];



const cards = [
{
image:"/meeting.jpg",
title:"កម្មវិធីចែកអំណោយ",
},
{
image:"/member.jpg",
title:"សកម្មភាពយុវជន",
},
{
image:"/admin.jpg",
title:"ការប្រជុំ",
},
{
image:"/tree planning.jpg",
title:"ការអភិវឌ្ឍសហគមន៍",
},
{
image:"/dinner.webp",
title:"កម្មវិធីសង្គម",
}
];



return (

<div className="
min-h-screen
bg-white
text-[#17194d]
">


{/* HEADER */}

<header
className="
h-[70px]
border-b
flex
items-center
justify-between
px-8
"
>


<div className="
flex
items-center
gap-3
">


<Image

src="/logo.png"

width={45}

height={45}

alt="logo"

/>


<div
className="
font-bold
text-sm
"
>
សមាគមយុវជន
</div>


</div>



<nav
className="
hidden
md:flex
gap-10
text-sm
"
>

<span>
ទំព័រដើម
</span>

<span>
សកម្មភាព
</span>

<span>
ព័ត៌មាន
</span>


</nav>




<button

className="
rounded-lg
bg-[#4b3192]
px-5
py-2
text-white
text-sm
"

>
ចូលប្រព័ន្ធ
</button>



</header>







{/* HERO */}

<section
className="
relative
grid
grid-cols-2
gap-10
px-12
py-16
overflow-hidden
"
>



<div>


<h1
className="
text-5xl
font-bold
leading-tight
"
>

សមាគមយុវជន
<br/>

ដើម្បីសង្គមកម្ពុជា

</h1>



<p
className="
mt-5
max-w-lg
text-gray-500
leading-7
"
>

សមាគមរបស់យើងមានគោលបំណង
ជួយអភិវឌ្ឍសង្គម
និងចូលរួមជាមួយសហគមន៍

</p>



<div
className="
mt-7
flex
gap-4
"
>

<button
className="
rounded-full
bg-[#4b3192]
px-6
py-3
text-white
"
>
ចូលរួមជាមួយ
</button>



<button
className="
rounded-full
border
px-6
py-3
"
>
ស្វែងយល់
</button>


</div>



</div>





<div
className="
relative
"
>


<Image

src="/meeting.jpg"

width={600}

height={400}

alt="hero"

className="
rounded-3xl
object-cover
shadow-xl
"

/>


</div>


</section>







{/* GALLERY */}

<section
className="
px-8
"
>


<h2
className="
text-2xl
font-bold
mb-6
"
>

សកម្មភាពសង្គមរបស់យើង

</h2>



<div
className="
grid
grid-cols-4
gap-4
"
>


{
activities.map((item,index)=>(


<div
key={index}
className="
h-[130px]
overflow-hidden
rounded-lg
"
>


<Image

src={item.image}

width={300}

height={150}

alt={item.title}

className="
h-full
w-full
object-cover
"

/>


</div>


))
}



</div>



</section>







{/* EVENT CARDS */}


<section
className="
px-8
py-10
"
>


<h2
className="
text-2xl
font-bold
mb-6
"
>

គម្រោង និងសកម្មភាព

</h2>




<div
className="
grid
grid-cols-5
gap-4
"
>


{
cards.map((item,index)=>(


<div

key={index}

className="
rounded-xl
border
overflow-hidden
bg-white
shadow-sm
"


>


<Image

src={item.image}

width={250}

height={120}

alt={item.title}

className="
h-[120px]
w-full
object-cover
"

/>


<div
className="
p-4
"
>


<h3
className="
font-bold
text-sm
"
>

{item.title}

</h3>




<div
className="
mt-3
space-y-2
text-xs
text-gray-500
"
>

<div className="flex gap-2">
<Calendar size={14}/>
Feb 16, 2026
</div>


<div className="flex gap-2">
<MapPin size={14}/>
ភ្នំពេញ
</div>


<div className="flex gap-2">
<Clock size={14}/>
8:00 AM
</div>


</div>




<button
className="
mt-4
w-full
rounded-md
bg-[#4b3192]
py-2
text-xs
text-white
"
>

ចូលរួម

</button>


</div>


</div>


))
}



</div>


</section>







{/* FOOTER */}


<footer

className="
bg-[#171b52]
px-10
py-10
text-white
"

>


<div

className="
grid
grid-cols-4
gap-8
"

>


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

width={40}

height={40}

alt="logo"

/>


<b>
សមាគមយុវជន
</b>


</div>



<p
className="
mt-5
text-sm
text-gray-300
"
>

ជួយអភិវឌ្ឍសង្គម
និងសហគមន៍

</p>



<div className="
mt-5
flex
gap-3
">

<Facebook size={18}/>
<Instagram size={18}/>
<Youtube size={18}/>


</div>


</div>





<div>

<h3>
ម៉ឺនុយ
</h3>

<p className="mt-3 text-sm text-gray-300">
ទំព័រដើម
</p>

<p className="text-sm text-gray-300">
កម្មវិធី
</p>


</div>





<div>

<h3>
ព័ត៌មាន
</h3>

<p className="mt-3 text-sm text-gray-300">
ព័ត៌មានថ្មី
</p>


</div>





<div>

<h3>
ទំនាក់ទំនង
</h3>

<p className="mt-3 text-sm text-gray-300">
+855 12 345 678
</p>

<p className="text-sm text-gray-300">
info@example.com
</p>


</div>


</div>




<div
className="
mt-10
border-t
border-white/20
pt-5
text-xs
text-gray-300
"
>

© 2026 សមាគមយុវជន

</div>


</footer>



</div>


);

}