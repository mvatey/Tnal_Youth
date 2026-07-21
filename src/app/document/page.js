"use client";

import { useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

import DataTable from "@/components/table/DataTable";
import DocumentTabs from "@/components/document/DocumentTabs";

import documentsData from "@/data/documents.json";


export default function DocumentPage() {

  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState("institution");

  const [typeFilter, setTypeFilter] = useState("");

  const [dateFilter, setDateFilter] = useState("");



  const documents = documentsData;



  const filteredDocuments = documents.filter((item) => {


    const matchSearch =
      item.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );



    const matchType =
      typeFilter === ""
        ? true
        : item.type === typeFilter;



    const matchDate =
      dateFilter === ""
        ? true
        : item.date === dateFilter;



    const matchTab =
      activeTab === "institution"
        ? item.category === "institution"
        : item.category === "member";



    return (
      matchSearch &&
      matchType &&
      matchDate &&
      matchTab
    );

  });





  const types = [
    ...new Set(
      documents.map(
        item => item.type
      )
    )
  ];



  const dates = [
    ...new Set(
      documents.map(
        item => item.date
      )
    )
  ];





  const columns = [

    {
      header:"ល.រ",
      width:"w-[6%]",
      align:"center",
      render:(_, index)=>index,
    },


    {
      header:"ឯកសារ",
      width:"w-[8%]",
      render:(item)=>(
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
      )
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
      )
    },


    {
      header:"សកម្មភាព",
      width:"w-[11%]",
      align:"center",

      render:()=>(
        <div className="flex justify-center gap-3">

          <Eye
            size={18}
            className="text-blue-500"
          />

          <Pencil
            size={18}
            className="text-yellow-500"
          />

          <Trash2
            size={18}
            className="text-red-500"
          />

        </div>
      )
    }

  ];






  const filters = [

    {
      name:"type",
      placeholder:"ប្រភេទ",
      value:typeFilter,

      options:types.map(
        type=>({
          label:type,
          value:type
        })
      ),

      onChange:setTypeFilter
    },



    {
      name:"date",
      placeholder:"ថ្ងៃ/ខែ/ឆ្នាំ",
      value:dateFilter,

      options:dates.map(
        date=>({
          label:date,
          value:date
        })
      ),

      onChange:setDateFilter
    }

  ];






  const addButton = (

    <button
      className="
      flex
      items-center
      gap-2
      rounded-lg
      bg-green-600
      px-4
      py-2
      text-sm
      font-medium
      text-white
      "
    >

      <Plus size={18}/>

      បញ្ចូលឯកសារ

    </button>

  );





  return (

    <div className="space-y-5">


      <DocumentTabs

        activeTab={activeTab}

        onChangeTab={setActiveTab}

      />



      <DataTable

        title=""

        data={filteredDocuments}

        columns={columns}

        filters={filters}

        searchQuery={search}

        onSearchChange={setSearch}

        actionButton={addButton}

        pageSize={10}

        downloadFilename="documents.csv"

      />


    </div>

  );

}