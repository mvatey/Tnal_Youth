"use client";

import { Calendar } from "lucide-react";
import SaveButton from "@/components/forms/SaveButton";


export default function FamilyPage(){

return(

<div className="space-y-4">


<div className="rounded-xl border border-gray-200 bg-white p-6">


<h2 className="text-lg font-bold text-primary">
ព័ត៌មានគ្រួសារ
</h2>



<div className="mt-6 grid grid-cols-3 gap-x-6 gap-y-6">


<FormInput
label="ឈ្មោះ ប្ដី/ប្រពន្ធ (ខ្មែរ)"
placeholder="បញ្ចូលឈ្មោះប្ដីប្រពន្ធជាភាសាខ្មែរ"
/>


<FormInput
label="ឈ្មោះ ប្ដី/ប្រពន្ធ (ឡាតាំង)"
placeholder="បញ្ចូលឈ្មោះជាភាសាឡាតាំង"
/>


<FormInput
label="មុខរបរ ប្ដី/ប្រពន្ធ"
placeholder="បញ្ចូល"
/>



<FormDate
label="ថ្ងៃខែឆ្នាំ កំណើត"
/>


<div className="col-span-2">

<FormInput
label="ទីកន្លែងកំណើត"
placeholder="បញ្ចូលទីកន្លែង"
/>

</div>





<FormInput
label="ឈ្មោះ កូន (ខ្មែរ)"
placeholder="បញ្ចូលឈ្មោះកូនជាភាសាខ្មែរ"
/>



<FormInput
label="ឈ្មោះ កូន (ឡាតាំង)"
placeholder="បញ្ចូលឈ្មោះកូនជាភាសាឡាតាំង"
/>



<FormInput
label="មុខរបរកូន"
placeholder="បញ្ចូល"
/>





<div>

<label className="mb-2 block text-sm font-semibold text-text-primary">
ស្ថានភាពកូន
</label>


<div className="flex gap-8 pt-2">

<Radio label="នៅរស់"/>

<Radio label="ស្លាប់"/>

</div>


</div>



<div className="col-span-2">

<FormInput
label="ទីកន្លែងកូន"
placeholder="បញ្ចូលទីកន្លែង"
/>

</div>







<FormInput
label="ឈ្មោះ ម្តាយ (ខ្មែរ)"
placeholder="បញ្ចូលឈ្មោះម្តាយ"
/>



<FormInput
label="ឈ្មោះ ម្តាយ (ឡាតាំង)"
placeholder="បញ្ចូលឈ្មោះម្តាយ"
/>



<FormInput
label="មុខរបរម្តាយ"
placeholder="បញ្ចូល"
/>





<div>

<label className="mb-2 block text-sm font-semibold text-text-primary">
ស្ថានភាពម្តាយ
</label>


<div className="flex gap-8 pt-2">

<Radio label="នៅរស់"/>

<Radio label="ស្លាប់"/>

</div>


</div>



<div className="col-span-2">

<FormInput
label="ទីកន្លែងម្តាយ"
placeholder="បញ្ចូលទីកន្លែង"
/>

</div>



</div>



</div>




<div className="flex justify-end">

<SaveButton />

</div>


</div>

);

}






function FormInput({label,placeholder}){


return(

<div>


<label className="mb-2 block text-sm font-semibold text-text-primary">
{label}
</label>



<input

placeholder={placeholder}

className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-600 outline-none focus:border-primary"

/>


</div>

);

}





function FormDate({label}){


return(

<div>


<label className="mb-2 block text-sm font-semibold text-text-primary">
{label}
</label>



<div className="relative">


<input

placeholder="ថ្ងៃ/ខែ/ឆ្នាំ"

className="h-11 w-full rounded-lg border border-gray-200 px-4 pr-10 text-sm text-gray-600 outline-none focus:border-primary"

/>


<Calendar

size={18}

className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"

/>


</div>



</div>

);

}





function Radio({label}){


return(

<label className="flex items-center gap-3 text-sm text-text-primary">


<input

type="radio"

name={label}

className="h-5 w-5 accent-primary"

/>


{label}


</label>

);

}