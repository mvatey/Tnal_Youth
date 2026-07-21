"use client";

import { useState } from "react";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill";
import FormDate from "@/components/forms/FormDate";

import { getCurrentMember } from "@/lib/currentMember";


export default function FamilyPage() {

  const member = getCurrentMember();


  const [family, setFamily] = useState(
    member?.family || {
      spouse: {
        name_kh: "",
        name_en: "",
        occupation: "",
        date_of_birth: "",
        address: "",
      },

      father: {
        name_kh: "",
        name_en: "",
        occupation: "",
        status: "",
        address: "",
      },

      mother: {
        name_kh: "",
        name_en: "",
        occupation: "",
        status: "",
        address: "",
      },
    }
  );


  function handleFamilyChange(
    section,
    field,
    value
  ) {

    setFamily((previous) => ({
      ...previous,

      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));

  }



  function handleSubmit(event) {

    event.preventDefault();


    const updatedMember = {
      ...member,
      family,
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
        p-6
        "
      >


        <h2
          className="
          text-lg
          font-bold
          text-primary
          "
        >
          ព័ត៌មានគ្រួសារ
        </h2>



        <div
          className="
          mt-6
          grid
          grid-cols-1
          gap-x-6
          gap-y-6
          md:grid-cols-2
          xl:grid-cols-3
          "
        >



          {/* SPOUSE */}


          <BoxFill
            label="ឈ្មោះ ប្ដី/ប្រពន្ធ (ខ្មែរ)"
            placeholder="បញ្ចូលឈ្មោះ"
            value={
              family.spouse.name_kh
            }
            onChange={(e)=>
              handleFamilyChange(
                "spouse",
                "name_kh",
                e.target.value
              )
            }
          />


          <BoxFill
            label="ឈ្មោះ ប្ដី/ប្រពន្ធ (ឡាតាំង)"
            placeholder="បញ្ចូលឈ្មោះ"
            value={
              family.spouse.name_en
            }
            onChange={(e)=>
              handleFamilyChange(
                "spouse",
                "name_en",
                e.target.value
              )
            }
          />



          <BoxFill
            label="មុខរបរ ប្ដី/ប្រពន្ធ"
            placeholder="បញ្ចូលមុខរបរ"
            value={
              family.spouse.occupation
            }
            onChange={(e)=>
              handleFamilyChange(
                "spouse",
                "occupation",
                e.target.value
              )
            }
          />



          <FormDate
            label="ថ្ងៃខែឆ្នាំកំណើត"
            value={
              family.spouse.date_of_birth
            }
            onChange={(e)=>
              handleFamilyChange(
                "spouse",
                "date_of_birth",
                e.target.value
              )
            }
          />



          <div className="xl:col-span-2">

            <BoxFill

              label="ទីលំនៅប្ដី/ប្រពន្ធ"

              placeholder="បញ្ចូលទីលំនៅ"

              value={
                family.spouse.address
              }

              onChange={(e)=>
                handleFamilyChange(
                  "spouse",
                  "address",
                  e.target.value
                )
              }

            />

          </div>





          {/* FATHER */}



          <BoxFill

            label="ឈ្មោះឪពុក (ខ្មែរ)"

            placeholder="បញ្ចូលឈ្មោះ"

            value={
              family.father.name_kh
            }

            onChange={(e)=>
              handleFamilyChange(
                "father",
                "name_kh",
                e.target.value
              )
            }

          />



          <BoxFill

            label="ឈ្មោះឪពុក (ឡាតាំង)"

            placeholder="បញ្ចូលឈ្មោះ"

            value={
              family.father.name_en
            }

            onChange={(e)=>
              handleFamilyChange(
                "father",
                "name_en",
                e.target.value
              )
            }

          />



          <BoxFill

            label="មុខរបរឪពុក"

            placeholder="បញ្ចូលមុខរបរ"

            value={
              family.father.occupation
            }

            onChange={(e)=>
              handleFamilyChange(
                "father",
                "occupation",
                e.target.value
              )
            }

          />



          <RadioGroup

            label="ស្ថានភាពឪពុក"

            name="father"

            value={
              family.father.status
            }

            onChange={(value)=>
              handleFamilyChange(
                "father",
                "status",
                value
              )
            }

          />




          <div className="xl:col-span-2">

            <BoxFill

              label="ទីលំនៅឪពុក"

              placeholder="បញ្ចូលទីលំនៅ"

              value={
                family.father.address
              }

              onChange={(e)=>
                handleFamilyChange(
                  "father",
                  "address",
                  e.target.value
                )
              }

            />

          </div>





          {/* MOTHER */}




          <BoxFill

            label="ឈ្មោះម្តាយ (ខ្មែរ)"

            placeholder="បញ្ចូលឈ្មោះ"

            value={
              family.mother.name_kh
            }

            onChange={(e)=>
              handleFamilyChange(
                "mother",
                "name_kh",
                e.target.value
              )
            }

          />



          <BoxFill

            label="ឈ្មោះម្តាយ (ឡាតាំង)"

            placeholder="បញ្ចូលឈ្មោះ"

            value={
              family.mother.name_en
            }

            onChange={(e)=>
              handleFamilyChange(
                "mother",
                "name_en",
                e.target.value
              )
            }

          />



          <BoxFill

            label="មុខរបរម្តាយ"

            placeholder="បញ្ចូលមុខរបរ"

            value={
              family.mother.occupation
            }

            onChange={(e)=>
              handleFamilyChange(
                "mother",
                "occupation",
                e.target.value
              )
            }

          />



          <RadioGroup

            label="ស្ថានភាពម្តាយ"

            name="mother"

            value={
              family.mother.status
            }

            onChange={(value)=>
              handleFamilyChange(
                "mother",
                "status",
                value
              )
            }

          />



          <div className="xl:col-span-2">

            <BoxFill

              label="ទីលំនៅម្តាយ"

              placeholder="បញ្ចូលទីលំនៅ"

              value={
                family.mother.address
              }

              onChange={(e)=>
                handleFamilyChange(
                  "mother",
                  "address",
                  e.target.value
                )
              }

            />

          </div>



        </div>

      </div>



      <div className="flex justify-end">

        <SaveButton type="submit"/>

      </div>



    </form>

  );

}





function RadioGroup({
  label,
  name,
  value,
  onChange,
}) {


return (

<div>


<label
className="
mb-2
block
text-sm
font-semibold
text-text-primary
"
>

{label}

</label>


<div
className="
flex
gap-8
pt-2
"
>


<Radio
name={name}
label="នៅរស់"
value="នៅរស់"
checked={
value==="នៅរស់"
}
onChange={onChange}
/>



<Radio
name={name}
label="ស្លាប់"
value="ស្លាប់"
checked={
value==="ស្លាប់"
}
onChange={onChange}
/>


</div>


</div>

);

}




function Radio({
name,
label,
value,
checked,
onChange,
}) {


return (

<label
className="
flex
cursor-pointer
items-center
gap-3
text-sm
text-text-primary
"
>


<input

type="radio"

name={name}

value={value}

checked={checked}

onChange={()=>
onChange(value)
}

className="
h-5
w-5
accent-primary
"

/>


{label}


</label>

);

}