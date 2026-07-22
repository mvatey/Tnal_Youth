"use client";

import { useState } from "react";

import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  RiAddCircleLine,
} from "react-icons/ri";


import DataTable from "@/components/table/DataTable";

import AddDocumentForm from "@/components/document/AddDocumentForm";
import EditDocumentForm from "@/components/document/EditDocumentForm";
import CompanyDocumentPreview from "@/components/document/CompanyDocumentPreview";


import documentCompany from "@/data/documentCompany.json";



export default function CompanyDocumentPage() {


  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("");

  const [dateFilter, setDateFilter] = useState("");



  const [showAddForm, setShowAddForm] =
    useState(false);



  const [selectedDocument, setSelectedDocument] =
    useState(null);



  const [editDocument, setEditDocument] =
    useState(null);





  const [form, setForm] = useState({

    title: "",

    branch: "",

    description: "",

    fileName: "",

    fileSize: "",

  });








  const documents = documentCompany;







  const filteredDocuments =
    documents.filter((item)=>{


      const matchSearch =
        item.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );



      const matchType =
        typeFilter === ""
        ||
        item.type === typeFilter;



      const matchDate =
        dateFilter === ""
        ||
        item.date === dateFilter;



      return (
        matchSearch &&
        matchType &&
        matchDate
      );


    });









  const columns = [



    {
      header:"ល.រ",

      width:"w-[6%]",

      align:"center",


      render:(_,index)=>index,

    },







    {
      header:"ឯកសារ",

      width:"w-[8%]",



      render:(item)=>(


        <img

          src={item.image}

          alt="document"

          className="
          h-8
          w-6
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

      width:"w-[25%]",

    },








    {
      header:"សាខា",

      accessor:"branch",

      width:"w-[15%]",

    },








    {
      header:"កាលបរិច្ឆេទ",

      accessor:"date",

      width:"w-[15%]",

    },








    {
      header:"ទំហំ",

      accessor:"size",

      width:"w-[10%]",

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

      width:"w-[11%]",

      align:"center",



      render:(item)=>(


        <div

          className="
          flex
          justify-center
          gap-3
          "

        >





          {/* VIEW */}

          <button

            onClick={() =>
              setSelectedDocument(item)
            }

          >

            <Eye

              size={18}

              className="text-blue-500"

            />

          </button>








          {/* EDIT */}

          <button

            onClick={() =>
              setEditDocument(item)
            }

          >

            <Pencil

              size={18}

              className="text-yellow-500"

            />

          </button>








          {/* DELETE */}

          <button>

            <Trash2

              size={18}

              className="text-red-500"

            />

          </button>





        </div>


      ),

    },


  ];









  const filters = [



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

        type => ({

          label:type,

          value:type,

        })

      ),



      onChange:setTypeFilter,

    },







    {

      name:"date",

      type:"date",

      value:dateFilter,


      onChange:setDateFilter,

    },


  ];









  const addButton = (


    <button

      onClick={() =>
        setShowAddForm(true)
      }


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


      បញ្ចូលឯកសារ


    </button>


  );









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

        downloadFilename="company-documents.csv"

      />












      {/* ADD DOCUMENT */}

      {
        showAddForm && (


          <Modal>


            <AddDocumentForm


              form={form}


              setForm={setForm}



              onClose={() =>
                setShowAddForm(false)
              }



              onSave={()=>{


                console.log(
                  "new document",
                  form
                );


                setShowAddForm(false);


              }}


            />


          </Modal>


        )
      }












      {/* EDIT DOCUMENT */}

      {
        editDocument && (


          <Modal>


            <EditDocumentForm


              form={editDocument}


              setForm={setEditDocument}



              onClose={() =>
                setEditDocument(null)
              }



              onSave={(updated)=>{


                console.log(
                  "updated document",
                  updated
                );


                setEditDocument(null);


              }}


            />


          </Modal>


        )
      }












      {/* PREVIEW DOCUMENT */}

      {
        selectedDocument && (


          <CompanyDocumentPreview


            document={selectedDocument}


            onClose={() =>
              setSelectedDocument(null)
            }


          />


        )
      }




    </>

  );

}









function Modal({
  children
}) {


  return (

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
        w-[520px]
        rounded-xl
        bg-white
        p-6
        shadow-xl
        "

      >

        {children}


      </div>


    </div>

  );

}