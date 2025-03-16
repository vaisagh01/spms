"use client";
import { Home, NotebookPen, GroupIcon, NotebookTabs, Table2, Bell, CircleCheckBig, Building2, Table2Icon } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import "../../../globals.css";
import { useEffect, useState } from "react";

export default function StudentLayout({ children }) {
  const params = useParams();
  const teacher_id = params.teacher_id// Get student_id from route params
  const [user, setUser] = useState({ username: "Guest" })
  console.log(params.teacher_id);
  
  // Function to dynamically update URLs
  const updateUrls = (navData) => {
    return navData.map((item) => ({
      ...item,
      url: item.url ? item.url.replace("teacher/2", `teacher/${params.teacher_id}`) : item.url, // Update top-level URL
      items: item.items?.map((subItem) => ({
        ...subItem,
        url: subItem.url.replace("teacher/2", `teacher/${params.teacher_id}`), // Update nested URLs
      })),
    }));
  };
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  // Define sidebar data dynamically
  const data = {
    user: {
      name: `${user.name}`,
      email: `${user.email}`,
      avatar: "/avatars/shadcn.jpg",
    },
    home: [
      {
        title: "Home",
        url: `teacher/${params.teacher_id}`, // Dynamically update home URL
        icon: Home,
        isActive: true,
      }, 
      {
        title: "Attendance",
        url: `teacher/${params.teacher_id}/attendance`, // Dynamically update home URL
        icon: CircleCheckBig,
        isActive: true,
      }, 
      {
        title: "Students",
        url: `teacher/${params.teacher_id}/managestudents`, // Dynamically update home URL
        icon: GroupIcon,
        isActive: true,
      },
      {
        title: "Subjects",
        url: `teacher/${params.teacher_id}/managesubjects`, // Dynamically update home URL
        icon: Table2Icon,
        isActive: true,
      },
      {
        title: "assignments",
        url: `teacher/${params.teacher_id}/assignments`, // Dynamically update home URL
        icon: NotebookPen,
        isActive: true,
      },
      {
        title: "assessments",
        url: `teacher/${params.teacher_id}/assessments`, // Dynamically update home URL
        icon: NotebookTabs,
        isActive: true,
      },
      {
        title: "Send notis",
        url: `teacher/${params.teacher_id}/notifications`, // Dynamically update home URL
        icon: Bell,
        isActive: true,
      },

    ],
    navMain: updateUrls([
      
    ]),
    
  };
  // Add "Department" navigation if the user is an HOD
  if (user.designation === "HOD") {
    data.home.push({
      title: "Department",
      url: `teacher/${teacher_id}`,
      icon: Building2,
      isActive: true,
    });
    console.log(user.role);
    
  }

  return (
    <div className="">
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
