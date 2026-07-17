import Image from "next/image";
import Link from "next/link";

import {
  Calendar,
  MapPin,
  Clock
} from "lucide-react";


import { activities } from "./data";



export default function ActivitySection(){


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
text-[32px]
font-extrabold
text-[#17194d]
"
>
ព្រឹត្តិការណ៍ជាសាធារណៈ
</h2>



<p
className="
mt-2
text-sm
text-gray-500
"
>
សកម្មភាព និងកម្មវិធីថ្មីៗរបស់សមាគម
</p>





{/* Cards */}

<div
className="
mt-8
grid
grid-cols-5
gap-5
"
>


{
activities.map((item)=>(


<div
key={item.id}
className="
flex
min-h-[390px]
flex-col
overflow-hidden
rounded-xl
border
border-gray-100
bg-white
shadow-sm
transition
hover:shadow-md
"
>


{/* Image */}

<Image

src={item.image}

width={300}

height={180}

alt={item.title}

className="
h-[160px]
w-full
object-cover
"

/>





{/* Content */}

<div
className="
flex
flex-1
flex-col
p-4
"
>



<h3
className="
text-sm
font-bold
leading-6
text-[#17194d]
"
>

{item.title}

</h3>





{/* Info */}

<div
className="
mt-3
space-y-2
text-xs
text-gray-500
"
>


<div
className="
flex
items-center
gap-2
"
>

<Calendar size={13}/>

<span>
{item.date}
</span>


<span>
|
</span>


<Clock size={13}/>

<span>
{item.time}
</span>


</div>





<div
className="
flex
items-center
gap-2
"
>

<MapPin size={13}/>

<span>
{item.location}
</span>

</div>


</div>






{/* Description */}

<p
className="
mt-4
line-clamp-3
text-xs
leading-5
text-gray-500
"
>

{item.description}

</p>







{/* Button */}

<Link

href={`/loading/detail?id=${item.id}`}

className="
mt-auto
block
w-full
rounded-md
bg-[#4b3192]
py-2.5
text-center
text-sm
font-medium
text-white
transition
hover:bg-[#392477]
"

>

មើលបន្ថែម

</Link>



</div>


</div>


))

}


</div>




</section>


)

}
