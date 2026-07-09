import { redirect } from "next/navigation";


export default async function Page({ params }) {

  const { id } = await params;


  redirect(
    `/member/memberInfo/${id}/details/personal`
  );

}