"use client";

import { useState } from "react";
import { Calendar, Link2, Plus, Trash2 } from "lucide-react";
import SaveButton from "@/components/forms/SaveButton";
import { RiAddCircleLine } from "react-icons/ri";


export default function EducationPage(){

  const [educations,setEducations] = useState([
    {
      id:1
    }
  ]);



  const addEducation = ()=>{

    setEducations([
      ...educations,
      {
        id:Date.now()
      }
    ]);

  };



  const removeEducation = (id)=>{

    if(educations.length === 1){
      return;
    }


    setEducations(
      educations.filter(
        item=>item.id !== id
      )
    );

  };



  return (

    <div className="space-y-4">


      <div className="rounded-xl border border-gray-200 bg-white p-5">


        <h2 className="text-lg font-bold text-primary">
          ការអប់រំ/បណ្តុះបណ្តាល
        </h2>



        <div className="mt-5 space-y-5">


          {
            educations.map((item,index)=>(


              <EducationGroup

                key={item.id}

                index={index}

                canDelete={educations.length > 1}

                onDelete={()=>removeEducation(item.id)}

              />


            ))
          }


        </div>



        {/* ADD BUTTON */}

        <div className="flex justify-center mt-6">


          <button

            onClick={addEducation}

            className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"

          >

            <RiAddCircleLine size={17}/>

            បន្ថែម

          </button>


        </div>


      </div>




      {/* SAVE */}

      <div className="flex justify-end">

        <SaveButton/>

      </div>



    </div>

  );

}







function EducationGroup({
  canDelete,
  onDelete
}){


return (

<div className="relative rounded-xl border border-gray-300 p-6">


<div className="grid grid-cols-3 gap-x-6 gap-y-5">



<FormInput

label="សាលា ឬ ស្ថាប័ន"

placeholder="បញ្ចូលឈ្មោះសាលា ឬ ស្ថាប័ន"

/>



<FormSelect

label="កម្រិត/ថ្នាក់"

placeholder="កម្រិត"

/>



<FormSelect

label="កម្រិត/ជំនាញ"

placeholder="ជ្រើសរើសជំនាញ"

/>





<FormSelect

label="ជំនាញឯកទេស"

placeholder="ជ្រើសរើសជំនាញ"

/>



<div className="flex items-end">


<button

className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white"

>

<Link2 size={17}/>

តំណភ្ជាប់ឯកសារ

</button>


</div>




<DateInput

label="ថ្ងៃចាប់ផ្តើម"

/>


<DateInput

label="ថ្ងៃបញ្ចប់"

/>



</div>





{
canDelete && (

<button

onClick={onDelete}

className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"

>

<Trash2 size={17}/>

លុប

</button>

)

}



</div>

);


}









function FormInput({
label,
placeholder
}){


return (

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









function FormSelect({
label,
placeholder
}){


return (

<div>


<label className="mb-2 block text-sm font-semibold text-text-primary">

{label}

</label>



<div className="relative">


<select

className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-12 text-sm text-gray-500 outline-none focus:border-primary"

>

<option>

{placeholder}

</option>


</select>



<div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">

<svg
width="14"
height="14"
viewBox="0 0 20 20"
fill="none"
>

<path
d="M5 7L10 12L15 7"
stroke="currentColor"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
/>


</svg>


</div>


</div>


</div>

);


}









function DateInput({
label
}){


return (

<div>


<label className="mb-2 block text-sm font-semibold text-text-primary">

{label}

</label>



<div className="relative">


<input

placeholder="ថ្ងៃ/ខែ/ឆ្នាំ"

className="h-11 w-full rounded-lg border border-gray-200 px-4 pr-12 text-sm text-gray-600 outline-none focus:border-primary"

/>


<Calendar

size={18}

className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"

/>


</div>


</div>

);


}