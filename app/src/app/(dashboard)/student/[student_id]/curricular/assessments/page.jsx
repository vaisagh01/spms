"use client";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import UpcomingTests from "../../components/UpcomingTests";
import AssessmentMarks from "../../components/AssessmentMarks";

const API_BASE_URL = "http://127.0.0.1:8000/curricular";

const Page = () => {
  const [studentDetails, setStudentDetails] = useState(null);
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    const id = params.student_id // Fetch student_id from URL params
    if (!id) return;

    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/student/${id}/`);
        setStudentDetails(response.data);
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
        <div className='flex items-center gap-7 space-y-2 my-4'>
          <div className='mt-2 cursor-pointer' onClick={() => router.back()}>
            <ArrowLeft />
          </div>
          <h2 className='text-4xl font-bold tracking-tight'>Assessments</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-6">
        {/* Upcoming Tests - Takes 3 columns on medium & large screens */}
        <div className="col-span-1 md:col-span-3">
          <UpcomingTests />
        </div>

        {/* Assessment Marks - Takes 3 columns on medium & large screens */}
        <div className="col-span-1 md:col-span-3">
          <AssessmentMarks />
        </div>

        {/* Event Dates - Always spans full width (6 columns) */}
        {/* <div className="col-span-1 md:col-span-6">
          <EventDates />
        </div> */}

        {/* Notifications - Takes 3 columns on medium & large screens */}
        {/* <div className="col-span-1 md:col-span-3">
          <Notifications />
        </div> */}
      </div>

      </div>
    </div>
  );
};

export default Page;
