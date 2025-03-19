'use client'
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Home } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
<<<<<<< Updated upstream

const TeacherNav = ({ teacher_id }) => {
  const params = useParams()
  const data = {
    home: [
      { title: "Home", url: `/teacher/1`, icon: Home },
      // { title: "Department", url: `/teacher/${params.teacher_id}/department`, icon: Building2 },
      { title: "Manage Students", url: `/teacher/${params.teacher_id}/managestudents`, icon: Home },
      { title: "Manage Subjects", url: `/teacher/${params.teacher_id}/managesubjects`, icon: Home },
      { title: "Manage Assignments", url: `/teacher/${params.teacher_id}/assignments`, icon: Home },
      { title: "Manage Assessments", url: `/teacher/${params.teacher_id}/assessments`, icon: Home },
      { title: "Send Notifications", url: `/teacher/${params.teacher_id}/notifications`, icon: Home },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {data.home.map((item, index) => (
        <Link key={index} href={item.url}>
          <Card className="cursor-pointer hover:shadow-lg transition duration-300">
            <CardContent className="flex items-center space-x-4 p-4">
              {/* <item.icon className="w-6 h-6" /> */}
              <span className="text-lg font-semibold">{item.title}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
=======
import axios from "axios";
import { useEffect, useState } from "react";
import EventsPerMonth from "./components/EventsPerMonth";
import EventDates from "./components/EventDates";
import AllAssignments from "./components/AllAssignments";

const API_BASE_URL = "http://127.0.0.1:8000/curricular";

const Page = () => {
  const [teacherDetails, setTeacherDetails] = useState(null);
  const params = useParams();

  useEffect(() => {
    const id = params.teacher_id; // Fetch teacher_id from URL params
    if (!id) return;

    const fetchTeacherDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/teacher/${id}/`);
        setTeacherDetails(response.data);
      } catch (error) {
        console.error("Error fetching teacher details:", error);
      }
    };

    fetchTeacherDetails();
  }, [params.teacher_id]);
  
  console.log(teacherDetails);

  return (
    <div className="p-4">
      <div className="flex flex-1 flex-col space-y-2 gap-1">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-4xl font-bold tracking-tight">
            <p className="text-slate-500 text-2xl">Hi, Welcome back</p>{" "}
            {teacherDetails
              ? `${teacherDetails.first_name} ${teacherDetails.last_name}`
              : ""}
            !
          </h2>
        </div>

        {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-6">
          <div className="col-span-2 md:col-span-2">
            <AllAssignments />
          </div>
          <div className="col-span-4 md:col-span-4">{<EventDates />}</div>
          <div className="col-span-4 md:col-span-3">{<Notifications />}</div>
          <div className="col-span-4 md:col-span-3">{<Notifications />}</div>
        </div> */}
      </div>
>>>>>>> Stashed changes
    </div>
  );
};

export default TeacherNav;
