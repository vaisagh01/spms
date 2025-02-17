"use client";
import { GraduationCap, Trophy, Code, Home } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useUser } from "@/app/context/UserContext";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import "../../../globals.css";

export default function StudentLayout({ children }) {
  const student_id = 1// Get student_id from route params
  const { user } = useUser();

  // Function to dynamically update URLs
  const updateUrls = (navData) => {
    return navData.map((item) => ({
      ...item,
      url: item.url ? item.url.replace("student/2", `student/${student_id}`) : item.url, // Update top-level URL
      items: item.items?.map((subItem) => ({
        ...subItem,
        url: subItem.url.replace("student/2", `student/${student_id}`), // Update nested URLs
      })),
    }));
  };

  // Define sidebar data dynamically
  const data = {
    user: {
      name: "Student",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    home: [
      {
        title: "Home",
        url: `teacher/${student_id}`, // Dynamically update home URL
        icon: Home,
        isActive: true,
      }, 
      {
        title: "Manage Students",
        url: `teacher/${student_id}`, // Dynamically update home URL
        icon: Home,
        isActive: true,
      }
    ],
    navMain: updateUrls([
      
    ]),
  };

  return (
    <div>
      <SidebarProvider>
        <AppSidebar data={data} />
        <SidebarInset>
          <Header />
          {/* Page main content */}
          {children}
          {/* Page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
