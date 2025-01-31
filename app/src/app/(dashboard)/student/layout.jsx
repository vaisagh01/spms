"use client"
import { GraduationCap, Trophy, Code } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useUser } from "@/app/context/UserContext";
import Header from "@/components/Header";
import "../../globals.css";
const data = {
  user: {
    name: "Student",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Curriculur",
      isActive: true,
      icon:GraduationCap,
      items: [
        {
          title: "Course Plan",
          url: "student/curricular/courses",
        },
        {
          title: "Assignments",
          url: "student/curricular/assignments",
        },
        {
          title: "Subjects",
          url: "student/curricular/subjects",
        },
        {
          title: "Exams",
          url: "student/curricular/marks",
        },
      ],
    },
    {
      title: "Extra Curriculur",
      url: "#",
      isActive: true,
      icon:Trophy,
      items: [
        {
          title: "Clubs",
          url: "student/extra-curricular/clubs",
        },
        {
          title: "Events",
          url: "student/extra-curricular/events",
        },
        {
          title: "Acheivements",
          url: "student/extra-curricular/achievements",
        },
      ],
    },
    {
      title: "Co-Curriculur",
      url: "#",
      isActive: true,
      icon: Code,
      items: [
        {
          title: "Internships",
          url: "#",
        },
        {
          title: "Projects",
          url: "#",
        },
      ],
    },
  ]
}

  
export default function StudentLayout({ children }) {
  const { user } = useUser();
  console.log(data.user.name = user.name, data.user.email = user.email);
  
  return (
    <div>
      <SidebarProvider>
          <AppSidebar data={data} />
          <SidebarInset>
            <Header />
            {/* page main content */}
            {children}
            {/* page main content ends */}
          </SidebarInset>
        </SidebarProvider>
    </div>
  );
}
