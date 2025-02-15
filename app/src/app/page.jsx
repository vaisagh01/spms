"use client"
import Image from "next/image";
import { redirect } from "next/navigation";
import { useUser } from "./context/UserContext";
export default function Home() {
  const { user } = useUser();
  redirect('/auth/login');
  // if (user.name === "Student") {
  //   return redirect('/student');
  // } else {
  //   redirect('/auth/login');
  // }
}
