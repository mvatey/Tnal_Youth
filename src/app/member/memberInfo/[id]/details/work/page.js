"use client";

import { useState } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import SaveButton from "@/components/forms/SaveButton";
import { RiAddCircleLine } from "react-icons/ri";


export default function WorkPage(){

  const [works,setWorks] = useState([
    {
      id:1,
      company:"",
      position:"",
      type:"",
      reason:"",
      startDate:"",
      endDate:""
    }
  ]);



  const addWork = ()=>{

    setWorks([
      ...works,
      {
        id:Date.now(),
        company:"",
        position:"",
        type:"",
        reason:"",
        startDate:"",
        endDate:""
      }
    ]);

  };




  const removeWork=(id)=>{

    if(works.length === 1){
      return;
    }


    setWorks(
      works.filter(
        item=>item.id !== id
      )
    );

  };




  return(

    <div className="space-y-4">


      <div className="rounded-xl border border-gray-200 bg-white p-6">


        <h2 className="text-lg font-bold text-primary">
          ប្រវត្តិការងារ
        </h2>



        <div className="mt-6 space-y-6">


          {
            works.map((work,index)=>(


              <div
                key={work.id}
                className="rounded-xl border border-gray-300 p-6"
              >



                <div className="grid grid-cols-3 gap-6">



                  <FormInput
                    label="ឈ្មោះ ស្ថាប័ន"
                    placeholder="បញ្ចូលឈ្មោះស្ថាប័ន"
                  />



                  <FormInput
                    label="មុខតំណែង"
                    placeholder="បញ្ចូលមុខតំណែង"
                  />



                  <FormSelect
                    label="ប្រភេទ"
                    placeholder="ជ្រើសរើសប្រភេទ"
                  />





                  <FormSelect
                    label="កាលបរិច្ឆេទចាប់ផ្តើម"
                    placeholder="ជ្រើសរើស"
                  />



                  <FormDate
                    label="ចូលធ្វើការ"
                  />



                  <FormDate
                    label="ចាកចេញ"
                  />



                </div>




                <div className="mt-6 flex justify-end">


                  <button

                    disabled={index===0}

                    onClick={()=>removeWork(work.id)}

                    className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold text-white ${
                      
                      index===0
                      ?
                      "cursor-not-allowed bg-gray-300"
                      :
                      "bg-red-600 hover:bg-red-700"

                    }`}

                  >

                    <Trash2 size={16}/>

                    លុប

                  </button>


                </div>



              </div>


            ))

          }



          {/* ADD BUTTON */}

          <div className="flex justify-center">


            <button

              onClick={addWork}

              className="flex items-center gap-2 rounded-lg bg-success px-6 py-2 text-sm font-semibold text-white hover:bg-green-700"

            >

              <RiAddCircleLine size={18}/>

              បន្ថែម

            </button>


          </div>



        </div>



      </div>





      {/* SAVE */}

      <div className="flex justify-end">

        <SaveButton/>

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







function FormSelect({label,placeholder}){


return(

<div>


<label className="mb-2 block text-sm font-semibold text-text-primary">

{label}

</label>



<div className="relative">


<select

className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-500 outline-none focus:border-primary"

>


<option>

{placeholder}

</option>


</select>



<div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">

<svg width="14" height="14" viewBox="0 0 20 20" fill="none">

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