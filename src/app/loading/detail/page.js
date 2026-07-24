import { notFound } from "next/navigation";

import ActivityDetailPage from "@/components/loading/ActivityDetailPage";
import { activities } from "@/components/loading/data";

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const id = Number(params?.id ?? 0);
  const activity = activities.find((item) => item.id === id);

  if (!activity) {
    notFound();
  }

  return <ActivityDetailPage activity={activity} />;
}
