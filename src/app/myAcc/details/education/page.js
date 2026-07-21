"use client";

import { useState } from "react";
import { RiAddCircleLine } from "react-icons/ri";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill";
import FormDate from "@/components/forms/FormDate";
import FormSelect from "@/components/forms/FormSelect";
import DeleteButton from "@/components/forms/DeleteButton";
import ButtonDropLink from "@/components/forms/ButtonDropLink";

import locationData from "@/data/location.json";
import educationData from "@/data/education.json";

import { getCurrentMember } from "@/lib/currentMember";


function createEmptyEducation() {

  return {
    id: `edu-${Date.now()}`,
    ...educationData.emptyEducation,
  };

}



export default function EducationPage() {


  const member = getCurrentMember();



  const [educations, setEducations] = useState(

    member?.educationHistory?.length
      ? member.educationHistory
      : [createEmptyEducation()]

  );




  function handleEducationChange(
    id,
    field,
    value
  ){

    setEducations((previous)=>

      previous.map((education)=>

        education.id === id

        ? {
            ...education,
            [field]:value,
          }

        : education

      )

    );

  }





  function addEducation(){

    setEducations((previous)=>[
      ...previous,
      createEmptyEducation()
    ]);

  }





  function removeEducation(id){

    setEducations((previous)=>{

      if(previous.length===1){
        return previous;
      }


      return previous.filter(
        item=>item.id!==id
      );

    });

  }





  function handleSubmit(event){

    event.preventDefault();


    const updatedMember={

      ...member,

      educationHistory:educations

    };


    console.log(
      "Updated member:",
      updatedMember
    );


  }





  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >


      <div
        className="
        rounded-xl
        border
        border-gray-200
        bg-white
        p-5
        "
      >


        <h2
          className="
          text-lg
          font-bold
          text-primary
          "
        >
          កម្រិតការបណ្ដុះបណ្ដាល
        </h2>



        <div className="mt-5 space-y-5">


          {
            educations.map(
              (education,index)=>(

                <EducationGroup

                  key={education.id}

                  index={index}

                  education={education}

                  canDelete={
                    educations.length>1
                  }

                  onChange={
                    (field,value)=>
                      handleEducationChange(
                        education.id,
                        field,
                        value
                      )
                  }


                  onDelete={()=>
                    removeEducation(
                      education.id
                    )
                  }

                />

              )
            )
          }


        </div>



        <div
          className="
          mt-6
          flex
          justify-center
          "
        >

          <button

            type="button"

            onClick={addEducation}

            className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-success
            px-5
            py-2
            text-sm
            font-semibold
            text-white
            hover:bg-green-700
            "
          >

            <RiAddCircleLine size={17}/>

            បន្ថែម

          </button>


        </div>


      </div>



      <div className="flex justify-end">

        <SaveButton type="submit"/>

      </div>


    </form>

  );

}





function EducationGroup({
  index,
  education,
  canDelete,
  onDelete,
  onChange,
}){


const provinces =
Array.isArray(locationData.provinces)
? locationData.provinces
: [];


const countries =
Array.isArray(locationData.countries)
? locationData.countries
: [];


const degrees =
Array.isArray(educationData.degrees)
? educationData.degrees
: [];



return (

<div
className="
rounded-xl
border
border-gray-300
p-6
"
>


<h3
className="
mb-5
text-sm
font-semibold
text-text-primary
"
>
ប្រវត្តិការសិក្សា ទី {index+1}
</h3>



<div
className="
grid
grid-cols-1
gap-5
md:grid-cols-2
xl:grid-cols-3
"
>


<BoxFill

label="សាលា ឬ ស្ថាប័ន"

placeholder="បញ្ចូលឈ្មោះសាលា"

value={education.school || ""}

onChange={(e)=>
onChange(
"school",
e.target.value
)
}

/>



<FormSelect

label="រាជធានី/ខេត្ត/រដ្ឋ"

placeholder="ជ្រើសរើស"

value={education.province || ""}

onChange={(e)=>
onChange(
"province",
e.target.value
)
}

options={provinces}

/>



<FormSelect

label="ប្រទេស"

placeholder="ជ្រើសរើស"

value={education.country || ""}

onChange={(e)=>
onChange(
"country",
e.target.value
)
}

options={countries}

/>



<FormSelect

label="កម្រិតសញ្ញាប័ត្រ"

placeholder="ជ្រើសរើស"

value={education.degree || ""}

onChange={(e)=>
onChange(
"degree",
e.target.value
)
}

options={degrees}

/>



<div className="flex items-end">

<ButtonDropLink

value={
education.documentLink || ""
}

onChange={(value)=>
onChange(
"documentLink",
value
)
}

/>

</div>




<FormDate

label="ថ្ងៃចាប់ផ្ដើម"

name={`start-${education.id}`}

value={
education.startDate || ""
}

onChange={(e)=>
onChange(
"startDate",
e.target.value
)
}

/>




<FormDate

label="ថ្ងៃបញ្ចប់"

name={`end-${education.id}`}

value={
education.endDate || ""
}

onChange={(e)=>
onChange(
"endDate",
e.target.value
)
}

/>



</div>




<div className="mt-6 flex justify-end">

<DeleteButton

canDelete={canDelete}

onClick={onDelete}

/>

</div>



</div>

);

}