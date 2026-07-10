"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import DataTable from "@/components/table/DataTable.js";
import ConfirmDeleteModal from "@/components/popup/Confirmdeletemodal.js";


const initialDonationData = [
  {
    id: 1,
    month: "មករា",
    amount: "$20.00",
    date: "12 មករា 2025",
    recordedBy: "ផាន វិទ្ធី",
    paymentMethod: "Cash",
  },
  {
    id: 2,
    month: "កុម្ភៈ",
    amount: "$10.00",
    date: "4 កុម្ភៈ 2025",
    recordedBy: "ផាន វិទ្ធី",
    paymentMethod: "ABA",
  },
  {
    id: 3,
    month: "មីនា",
    amount: "$50.00",
    date: "4 មីនា 2025",
    recordedBy: "ផាន វិទ្ធី",
    paymentMethod: "ACELEDA",
  },
  {
    id: 4,
    month: "មេសា",
    amount: "$15.00",
    date: "10 មេសា 2025",
    recordedBy: "សុខ ដារ៉ា",
    paymentMethod: "Cash",
  },
  {
    id: 5,
    month: "ឧសភា",
    amount: "$30.00",
    date: "8 ឧសភា 2025",
    recordedBy: "សុខ ដារ៉ា",
    paymentMethod: "ABA",
  },
  {
    id: 6,
    month: "មិថុនា",
    amount: "$25.00",
    date: "15 មិថុនា 2025",
    recordedBy: "លី សុភា",
    paymentMethod: "ACELEDA",
  },
  {
    id: 7,
    month: "កក្កដា",
    amount: "$40.00",
    date: "20 កក្កដា 2025",
    recordedBy: "លី សុភា",
    paymentMethod: "Cash",
  },
  {
    id: 8,
    month: "សីហា",
    amount: "$35.00",
    date: "6 សីហា 2025",
    recordedBy: "ចាន់ រតនា",
    paymentMethod: "ABA",
  },
  {
    id: 9,
    month: "កញ្ញា",
    amount: "$18.00",
    date: "14 កញ្ញា 2025",
    recordedBy: "ចាន់ រតនា",
    paymentMethod: "ACELEDA",
  },
  {
    id: 10,
    month: "តុលា",
    amount: "$22.00",
    date: "9 តុលា 2025",
    recordedBy: "ផាន វិទ្ធី",
    paymentMethod: "Cash",
  },
];


export default function DonationPage() {


  const [donations,setDonations] = useState(initialDonationData);


  const [query,setQuery] = useState("");

  const [methodFilter,setMethodFilter] = useState("");


  const [deleteModal,setDeleteModal] = useState(false);

  const [selectedDonation,setSelectedDonation] = useState(null);



  const paymentMethods = useMemo(()=>{

    return [
      ...new Set(
        donations.map(
          item=>item.paymentMethod
        )
      )
    ];

  },[donations]);




  const filteredData = useMemo(()=>{


    return donations.filter((item)=>{


      const search = query.toLowerCase();


      const matchesQuery =
        item.month.toLowerCase().includes(search) ||
        item.amount.toLowerCase().includes(search) ||
        item.recordedBy.toLowerCase().includes(search);



      const matchesMethod =
        !methodFilter ||
        item.paymentMethod === methodFilter;



      return matchesQuery && matchesMethod;


    });


  },[
    donations,
    query,
    methodFilter
  ]);





  const handleDelete = ()=>{


    if(!selectedDonation) return;



    setDonations((prev)=>

      prev.filter(
        item=>item.id !== selectedDonation.id
      )

    );


    setDeleteModal(false);

    setSelectedDonation(null);


  };





  const columns=[


    {
      header:"ល.រ",
      width:"w-[6%]",
      align:"center",
      render:(_,index)=>index,
    },


    {
      header:"ប្រចាំខែ",
      width:"w-[16%]",
      align:"left",
      accessor:"month",
    },


    {
      header:"ចំនួន",
      width:"w-[14%]",
      align:"left",
      accessor:"amount",
    },


    {
      header:"ថ្ងៃបរិច្ឆេទ",
      width:"w-[18%]",
      align:"left",
      accessor:"date",
    },


    {
      header:"កត់ត្រាដោយ",
      width:"w-[18%]",
      align:"left",
      accessor:"recordedBy",
    },


    {
      header:"វិធីសាស្រ្តទូទាត់",
      width:"w-[18%]",
      align:"left",
      accessor:"paymentMethod",
    },


    {
      header:"សកម្មភាព",
      width:"w-[10%]",
      align:"center",

      render:(item)=>(

        <button

          onClick={()=>{

            setSelectedDonation(item);

            setDeleteModal(true);

          }}

          className="
          inline-flex
          items-center
          justify-center
          text-red-500
          hover:text-red-600
          "

        >

          <Trash2 className="h-5 w-5"/>

        </button>

      )

    }


  ];





  const filters=[

    {

      value:methodFilter,

      onChange:setMethodFilter,

      options:paymentMethods,

      placeholder:"វិធីសាស្រ្តទូទាត់"

    }

  ];






return (

<div className="space-y-3">


<h2 className="text-lg font-semibold text-text-primary">

បញ្ជីការធ្វើវិភាគទាន

</h2>




<DataTable

data={filteredData}

columns={columns}

filters={filters}

searchQuery={query}

onSearchChange={setQuery}

searchPlaceholder="ស្វែងរក..."

pageSize={10}

/>





<ConfirmDeleteModal


open={deleteModal}



onClose={()=>{

setDeleteModal(false);

setSelectedDonation(null);

}}



onConfirm={handleDelete}



title="លុបវិភាគទាន?"



description={

selectedDonation

?

`តើអ្នកប្រាកដថាចង់លុបវិភាគទាន ${selectedDonation.amount} នេះទេ?`

:

"តើអ្នកប្រាកដថាចង់លុបទិន្នន័យនេះទេ?"

}



cancelLabel="បោះបង់"



confirmLabel="លុប"



/>




</div>

);


}