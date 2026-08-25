"use client";

import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";


export default function DocumentTable({
  documents = [],
  currentPage,
  pageSize,
  onView,
  onEdit,
  onDelete,
}) {


  return (

    <div className="
      overflow-x-auto
      rounded-sm
      border
      border-border
      bg-bg-page-white
    ">


      <table
        className="
        w-full
        min-w-[760px]
        table-fixed
        border-collapse
        text-sm
        "
      >


        <colgroup>

          <col className="w-[6%]" />
          <col className="w-[8%]" />
          <col className="w-[25%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[11%]" />

        </colgroup>



        <thead className="bg-bg-page-gray">

          <tr className="border-b border-border">


            {[
              "ល.រ",
              "",
              "ឈ្មោះឯកសារ",
              "សាខា",
              "កាលបរិច្ឆេទ",
              "ទំហំ",
              "ប្រភេទឯកសារ",
              "សកម្មភាព",
            ].map((header,index)=>(

              <th
                key={index}
                className="
                h-11
                px-4
                text-xs
                font-semibold
                text-text-secondary
                text-left
                "
              >

                {header}

              </th>

            ))}


          </tr>

        </thead>



        <tbody>


          {
            documents.length > 0 ?

            documents.map((item,index)=>(


              <tr

                key={item.id}

                className="
                border-b
                border-border
                transition
                hover:bg-bg-page-gray/60
                "

              >


                <td className="h-12 px-4 text-text-secondary">

                  {
                    (currentPage - 1) *
                    pageSize +
                    index +
                    1
                  }

                </td>



                <td className="px-4">


                  <img

                    src={item.image}

                    className="
                    h-8
                    w-6
                    rounded
                    border
                    object-cover
                    "

                  />


                </td>




                <td className="px-4 text-text-secondary">


                  <div className="truncate">

                    {item.title}

                  </div>


                </td>




                <td className="px-4 text-text-secondary">

                  {item.branch}

                </td>




                <td className="px-4 text-text-secondary">

                  {item.date}

                </td>




                <td className="px-4 text-text-secondary">

                  {item.size}

                </td>





                <td className="px-4">


                  <span
                    className="
                    rounded-md
                    bg-error-bg
                    px-3
                    py-1
                    text-xs
                    text-error
                    "
                  >

                    {item.type}

                  </span>


                </td>





                <td className="px-4">


                  <div className="
                    flex
                    items-center
                    justify-center
                    gap-3
                  ">


                    <button onClick={()=>onView(item)}>

                      <Eye
                        size={18}
                        className="text-blue-500"
                      />

                    </button>



                    <button onClick={()=>onEdit(item)}>


                      <Pencil
                        size={18}
                        className="text-yellow-500"
                      />


                    </button>




                    <button onClick={()=>onDelete(item)}>


                      <Trash2
                        size={18}
                        className="text-red-500"
                      />


                    </button>


                  </div>


                </td>



              </tr>


            ))

            :

            <tr>

              <td
                colSpan="8"
                className="
                py-10
                text-center
                text-sm
                text-text-mute
                "
              >

                មិនមានទិន្នន័យ

              </td>

            </tr>

          }


        </tbody>



      </table>


    </div>


  );

}
