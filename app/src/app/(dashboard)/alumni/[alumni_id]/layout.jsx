"use client";
import { Home, NotebookPen, GroupIcon, NotebookTabs, Table2, Bell, CircleCheckBig, HomeIcon, Group, UsersRound, UsersRoundIcon, Calendar, House, HousePlug, HousePlus } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import "../../../globals.css";
import { useEffect, useState } from "react";

export default function StudentLayout({ children }) {
  const params = useParams();
  const alumni_id = params.alumni_id// Get student_id from route params
  const [user, setUser] = useState({ username: "Guest" })
  console.log(params.alumni_id);
  
  // Function to dynamically update URLs
  const updateUrls = (navData) => {
    return navData.map((item) => ({
      ...item,
      url: item.url ? item.url.replace("alumni/2", `alumni/${params.alumni_id}`) : item.url, // Update top-level URL
      items: item.items?.map((subItem) => ({
        ...subItem,
        url: subItem.url.replace("alumni/2", `alumni/${params.alumni_id}`), // Update nested URLs
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
        url: `alumni/${params.alumni_id}`, // Dynamically update home URL
        icon: House,
        isActive: true,
      },
      {
        title: "Alumni Events",
        url: `alumni/${params.alumni_id}/events`, // Dynamically update home URL
        icon: Calendar,
        isActive: true,
      },
      {
        title: "Alumnis",
        url: `alumni/${params.alumni_id}/alumnis`, // Dynamically update home URL
        icon: UsersRoundIcon,
        isActive: true,
      },
      {
        title: "Profile",
        url: `alumni/${params.alumni_id}/profile`, // Dynamically update home URL
        icon: UsersRoundIcon,
        isActive: true,
      },
      {
        title: "Send notis",
        url: `alumni/2/notifications`, // Dynamically update home URL
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
