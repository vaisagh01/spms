"use client";
import { GraduationCap, Trophy, Code, Home, NotebookPenIcon, CheckCircle2Icon } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/Header";
import "../../../globals.css";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function StudentLayout({ children }) {
  const params = useParams();
  const student_id = params.student_id// Get student_id from route params
  const [user,setUser] = useState({name:"vaisagh",email:"student01@gmail.com"})
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
      avatar: "",
    },
    home: [
      {
        title: "Home",
        url: `student/${params.student_id}`, // Dynamically update home URL
        icon: Home,
        isActive: true,
      },
      {
        title: "Attendance",
        url: `student/${params.student_id}/attendance`, // Dynamically update home URL
        icon: CheckCircle2Icon,
        isActive: true,
      },
      {
        title: "Perfomance",
        url: `student/${params.student_id}/perfomance`, // Dynamically update home URL
        icon: NotebookPenIcon,
        isActive: true,
      },
      {
        title: "Resume",
        url: `student/${params.student_id}/resume`, // Dynamically update home URL
        icon: Home,
        isActive: true,
      },
    ],
    navMain: updateUrls([
      {
        title: "Curriculur",
        single: false,
        isActive: true,
        icon: GraduationCap,
        items: [
          { title: "Course Plan", url: `student/${params.student_id}/curricular/courses` },
          { title: "Assignments", url: `student/${params.student_id}/curricular/assignments` },
          { title: "Assessments", url: `student/${params.student_id}/curricular/assessments` },
        ],
      },
      {
        title: "Extra Curriculur",
        single: false,
        isActive: true,
        icon: Trophy,
        items: [
          { title: "Clubs home", url: `student/${params.student_id}/extra-curricular` },
          { title: "Clubs", url: `student/${params.student_id}/extra-curricular/clubs` },
          { title: "Events", url: `student/${params.student_id}/extra-curricular/events` },
          // { title: "Achievements", url: `student/${params.student_id}/extra-curricular/achievements" },
        ],
      },
      {
        title: "Co-Curriculur",
        single: false,
        isActive: true,
        icon: Code,
        items: [
          { title: "Internships", url: `student/${params.student_id}/cocurricular/internship` },
          { title: "Projects", url: `student/${params.student_id}/cocurricular/project`},
          { title: "Certificates", url: `student/${params.student_id}/cocurricular/certificates`},
        ],
      },
      
    ]),
  };
  useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }, []);

  return (
    <div>
      <SidebarProvider>
        <AppSidebar  data={data} />
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
