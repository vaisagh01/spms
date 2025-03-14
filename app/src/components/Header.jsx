"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Get student_id from URL
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "./ui/sidebar";
import { Bell } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Pusher from "pusher-js";
import { useToast } from "@/hooks/use-toast"; // Import toast

export default function Header() {
  const { toast } = useToast(); // Initialize toast
  const [courseId, setCourseId] = useState("1");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);

  // Initialize Pusher
  useEffect(() => {
    if (!courseId) return;

    const pusher = new Pusher("d35d4c488b32e53913fd", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe(`course-1`);

    channel.bind("new-notification", (data) => {
      setNotifications((prev) => [data, ...prev]);

      // Show a toast when a new notification is received
      toast({
        title: "New Notification",
        description: data.message,
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [courseId, toast]);

  // Fetch existing notifications from the backend
  useEffect(() => {
    if (!courseId) return;

    axios
      .get(`http://127.0.0.1:8000/noti/course-notifications/${courseId}/`)
      .then((response) => {
        if (response.data.status === "success") {
          setNotifications(response.data.notifications);
        }
      })
      .catch((error) => console.error("Error fetching notifications:", error));
  }, [courseId]);

  // Send notification using Axios
  const sendNotification = async () => {
    if (!courseId || !message) {
      alert("Please enter a course ID and message.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/noti/send-course-notification/",
        { course_id: courseId, message },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === "success") {
        setMessage(""); // Clear the input field
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      alert("Error sending notification: " + error.message);
    }
  };

  return (
    <div className="p-4 flex justify-between items-center border-b">
      <div className="flex items-center gap-2">
          <SidebarTrigger />
      </div>
      <div className="w-1/4 flex justify-between items-center gap-3">
        <Input placeholder="Search..." />
        <Sheet>
          <SheetTrigger className="ml-4 flex items-center gap-1 bg-slate-200 p-2 rounded-full">
            {notifications.length}
            <Bell className="size-4" />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="p-3 border-b-2 border-gray-100">Notifications</SheetTitle>
              <SheetDescription>
                <h2 className="text-lg font-semibold mt-5">Notifications</h2>
                <ul className="mt-3">
                  {notifications.map((notif) => (
                    <li key={notif.id} className="border p-2 rounded mb-2">
                      <strong>{notif.message}</strong>
                      <div className="text-xs text-gray-500">
                        {new Date(notif.created_at).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
