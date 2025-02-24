"use client";
import { GraduationCap, Trophy, Code, Home, NotebookPen, GroupIcon, NotebookTabs, Table2, Bell } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useUser } from "@/app/context/UserContext";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import "../../../globals.css";
import { useEffect, useState } from "react";

export default function StudentLayout({ children }) {
  const params = useParams();
  const teacher_id = params.teacher_id// Get student_id from route params
  const [user, setUser] = useState({ username: "Guest" })

  // Function to dynamically update URLs
  const updateUrls = (navData) => {
    return navData.map((item) => ({
      ...item,
      url: item.url ? item.url.replace("teacher/2", `teacher/${teacher_id}`) : item.url, // Update top-level URL
      items: item.items?.map((subItem) => ({
        ...subItem,
        url: subItem.url.replace("teacher/2", `teacher/${teacher_id}`), // Update nested URLs
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
        url: `teacher/${teacher_id}`, // Dynamically update home URL
        icon: Home,
        isActive: true,
      }, 
      {
        title: "Students",
        url: `teacher/${teacher_id}/managestudents`, // Dynamically update home URL
        icon: GroupIcon,
        isActive: true,
      },
      {
        title: "Subjects",
        url: `teacher/${teacher_id}/managesubjects`, // Dynamically update home URL
        icon: Table2,
        isActive: true,
      },
      {
        title: "assignments",
        url: `teacher/${teacher_id}/assignments`, // Dynamically update home URL
        icon: NotebookPen,
        isActive: true,
      },
      {
        title: "assessments",
        url: `teacher/${teacher_id}/assessments`, // Dynamically update home URL
        icon: NotebookTabs,
        isActive: true,
      },
      {
        title: "Send notis",
        url: `teacher/${teacher_id}/notifications`, // Dynamically update home URL
        icon: Bell,
        isActive: true,
      },

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
