"use client";


import IdCard from "@/components/card/idCard";
import CertificateCard from "@/components/card/certificate";
import DocumentPreviewCard from "@/components/card/DocumentPreviewCard";
import LetterOfAppointment from "@/components/card/LetterOfAppointment";


export default function DocumentContent({member}){


return (

<div className="flex justify-center gap-30 p-6">


<DocumentPreviewCard
title="ប័ណ្ណសម្គាល់សមាជិក"
data={[member]}
filename="member-card.csv"
previewClass="scale-[0.55]"
>

<IdCard user={member}/>

</DocumentPreviewCard>



<DocumentPreviewCard
title="លិខិតតែងតាំង"
data={[member]}
filename="letter.csv"
previewClass="scale-[0.35]"
>

<LetterOfAppointment user={member}/>

</DocumentPreviewCard>



<DocumentPreviewCard
title="បណ្ណសរសើរ"
data={[member]}
filename="certificate.csv"
previewClass="scale-[0.35]"
>

<CertificateCard user={member}/>

</DocumentPreviewCard>



</div>

);

}