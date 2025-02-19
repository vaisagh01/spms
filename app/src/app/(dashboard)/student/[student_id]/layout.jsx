"use client";
import { GraduationCap, Trophy, Code, Home } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useUser } from "@/app/context/UserContext";
import Header from "@/components/Header";
import "../../../globals.css";

export default function StudentLayout({ children }) {
  const student_id = 1// Get student_id from route params
  const { user } = useUser();

  // Function to dynamically update URLs
  const updateUrls = (navData) => {
    return navData.map((item) => ({
      ...item,
      url: item.url ? item.url.replace("student/2", `teacher/${student_id}`) : item.url, // Update top-level URL
      items: item.items?.map((subItem) => ({
        ...subItem,
        url: subItem.url.replace("student/2", `teacher/${student_id}`), // Update nested URLs
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
        url: `student/${student_id}`, // Dynamically update home URL
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
          { title: "Course Plan", url: "student/2/curricular/courses" },
          { title: "Assignments", url: "student/2/curricular/assignments" },
          { title: "Assessments", url: "student/2/curricular/assessments" },
        ],
      },
      {
        title: "Extra Curriculur",
        single: false,
        isActive: true,
        icon: Trophy,
        items: [
          { title: "Clubs home", url: "student/2/extra-curricular" },
          { title: "Clubs", url: "student/2/extra-curricular/clubs" },
          { title: "Events", url: "student/2/extra-curricular/events" },
          { title: "Achievements", url: "student/2/extra-curricular/achievements" },
        ],
      },
      {
        title: "Co-Curriculur",
        single: false,
        isActive: true,
        icon: Code,
        items: [
          { title: "Internships", url: "student/2/co-curricular/internships" },
          { title: "Projects", url: "student/2/co-curricular/projects" },
        ],
      },
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
