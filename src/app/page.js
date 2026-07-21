import AuthLayout from "@/app/auth/layout";
import LoginPage from "@/app/auth/login/page";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/auth/login");
}
