"use client";

import MyCard from "@/components/MyCard";
import Notifications from "./components/Notifications";
import UpcomingEvents from "./components/UpcomingEvents";
import { useParams } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import EventsPerMonth from "./components/EventsPerMonth";
import EventDates from "./components/EventDates";
import AllClubs from "./components/AllClubs";
const API_BASE_URL = "http://127.0.0.1:8000/extracurricular";

const Page = () => {
  const [studentDetails, setStudentDetails] = useState(null);
  const params = useParams();
  useEffect(() => {
    const id = params.student_id // Fetch student_id from URL params
    if (!id) return;

    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/curricular/student/${id}/`);
        setStudentDetails(response.data.student);
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    fetchStudentDetails();
  }, [params.student_id]);
  console.log(studentDetails);
  
  return (
    <div className="p-4">
      <div className="flex flex-1 flex-col space-y-2 gap-1">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-4xl flex items-center gap-4 font-bold tracking-tight">
            <p className="text-slate-500">Hey! </p> {studentDetails ? `${studentDetails.first_name} ${studentDetails.last_name}` : ""}!
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-6">
          <div className="col-span-2 md:col-span-2">
            <AllClubs />
          </div>
          <div className="col-span-4 md:col-span-4">{<EventDates />}</div>
          <div className="col-span-4 md:col-span-3">{<Notifications />}</div>
          <div className="col-span-4 md:col-span-3">{<Notifications />}</div>
        </div>
      </div>
    </div>
  );
};

export default Page;
