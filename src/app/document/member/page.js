"use client";

import { useState } from "react";

import {
  Eye,
  X,
} from "lucide-react";

import {
  RiAddCircleLine,
} from "react-icons/ri";


import DataTable from "@/components/table/DataTable";

import CertificateForm from "@/components/document/CertificateForm";

import CertificatePreview from "@/components/document/certificatePreview";


import documentMember from "@/data/documentMember.json";



export default function MemberDocumentPage() {


  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("");

  const [dateFilter, setDateFilter] = useState("");



  // Add certificate popup

  const [showAddForm, setShowAddForm] = useState(false);



  // Preview popup

  const [selectedCertificate, setSelectedCertificate] = useState(null);






  const [form, setForm] = useState({

    title:"",

    branch:"",

    type:"វិញ្ញាបនបត្រ",

    gender:"ប្រុស",

    member:"",

    description:"",

    font:"Kantumruy Pro",

    fontSize:"6px",

    color:"#12224c",

    language:"ភាសាខ្មែរ",

  });








  const documents = documentMember;








  const filteredDocuments = documents.filter((item)=>{


    const matchSearch =

      item.title
      .toLowerCase()
      .includes(search.toLowerCase())


      ||

      item.memberName
      .toLowerCase()
      .includes(search.toLowerCase());





    const matchType =

      typeFilter === ""

      ||

      item.type === typeFilter;





    const matchDate =

      dateFilter === ""

      ||

      item.date === dateFilter;





    return (

      matchSearch

      &&

      matchType

      &&

      matchDate

    );


  });









  const columns=[



    {
      header:"ល.រ",

      width:"w-[5%]",

      align:"center",

      render:(_,index)=>index,

    },





    {
      header:"រូបភាព",

      width:"w-[8%]",


      render:(item)=>(

        <img

          src={item.image}

          alt="certificate"

          className="
          h-8
          w-12
          rounded
          border
          object-cover
          "

        />

      ),

    },






    {
      header:"ឈ្មោះឯកសារ",

      accessor:"title",

      width:"w-[15%]",

    },






    {
      header:"សមាជិក",

      accessor:"memberName",

      width:"w-[15%]",

    },






    {
      header:"ភេទ",

      accessor:"gender",

      width:"w-[8%]",

    },






    {
      header:"សាខា",

      accessor:"branch",

      width:"w-[12%]",

    },






    {
      header:"កាលបរិច្ឆេទ",

      accessor:"date",

      width:"w-[12%]",

    },






    {
      header:"ទំហំ",

      accessor:"size",

      width:"w-[8%]",

    },






    {
      header:"ប្រភេទឯកសារ",

      width:"w-[10%]",


      render:(item)=>(


        <span

          className="
          rounded-md
          bg-red-100
          px-3
          py-1
          text-xs
          text-red-500
          "

        >

          {item.type}

        </span>


      ),

    },









    {
      header:"សកម្មភាព",

      width:"w-[7%]",

      align:"center",




      render:(item)=>(


        <button

          onClick={()=>

            setSelectedCertificate(item)

          }

        >

          <Eye

            size={18}

            className="text-blue-500"

          />


        </button>


      ),


    },



  ];









  const filters=[



    {

      name:"type",

      placeholder:"ប្រភេទ",

      value:typeFilter,


      options:[

        ...new Set(

          documents.map(

            item=>item.type

          )

        )

      ].map(

        type=>(

          {

            label:type,

            value:type

          }

        )

      ),


      onChange:setTypeFilter,

    },






    {

      name:"date",

      placeholder:"ថ្ងៃ/ខែ/ឆ្នាំ",

      value:dateFilter,


      options:[

        ...new Set(

          documents.map(

            item=>item.date

          )

        )

      ].map(

        date=>(

          {

            label:date,

            value:date

          }

        )

      ),


      onChange:setDateFilter,

    },


  ];









  const addButton=(


    <button


      onClick={()=>setShowAddForm(true)}


      className="
      flex
      items-center
      gap-2
      rounded-lg
      bg-success
      px-4
      py-2
      text-sm
      font-medium
      text-white
      "


    >


      <RiAddCircleLine size={18}/>


      បង្កើតឯកសារ



    </button>


  );









  function handleSave(){


    console.log(
      "new certificate:",
      form
    );


    setShowAddForm(false);


  }









  return (


    <>



      <DataTable


        data={filteredDocuments}


        columns={columns}


        filters={filters}


        searchQuery={search}


        onSearchChange={setSearch}


        actionButton={addButton}


        pageSize={15}


        downloadFilename="member-documents.csv"


      />









      {/* CREATE CERTIFICATE POPUP */}


      {
        showAddForm && (

          <div

            className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-5
            "

          >


            <div

              className="
              relative
              max-h-[90vh]
              w-[1100px]
              overflow-y-auto
              rounded-xl
              bg-white
              p-6
              shadow-xl
              "

            >



              <button

                onClick={()=>
                  setShowAddForm(false)
                }

                className="
                absolute
                right-5
                top-5
                "

              >

                <X size={22}/>

              </button>





              <CertificateForm


                form={form}


                setForm={setForm}


                onSave={handleSave}


                onClose={()=>
                  setShowAddForm(false)
                }


              />



            </div>


          </div>

        )
      }









      {/* CERTIFICATE PREVIEW POPUP */}



      {
        selectedCertificate && (

          <CertificatePreview


            document={selectedCertificate}


            onClose={()=>


              setSelectedCertificate(null)


            }


          />

        )
      }






    </>


  );

}