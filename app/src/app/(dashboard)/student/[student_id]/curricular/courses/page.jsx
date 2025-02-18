"use client"
import { React, useState, useEffect } from 'react';
import MyCard from '@/components/MyCard';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import MySubjectCard from '../../components/MySubjectCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE_URL = "http://localhost:8000/curricular";

const Page = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null); // State for selected semester
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const id = params.student_id;

    if (!id) {
      setError("No student ID provided");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/subjects/student/${id}/`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.student_id]); // Re-run effect when student_id changes

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Extract unique semesters from subjects
  const semesters = [...new Set(data.subjects.map(subject => subject.semester))];

  // Filter subjects based on selected semester
  const filteredSubjects = selectedSemester
    ? data.subjects.filter(subject => subject.semester === Number(selectedSemester))
    : data.subjects.filter(subject => subject.semester === data.current_semester); // Show all subjects if no semester is selected

  return (
    <div className='p-4'>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center gap-7 space-y-2 my-4'>
          <div className='mt-2 cursor-pointer' onClick={() => router.back()}>
            <ArrowLeft />
          </div>

          <h2 className='text-4xl font-bold tracking-tight'>
            Course Plan for {data.course_name}
          </h2>
        </div>

        {/* Semester Selection Dropdown */}
        <div className='flex justify-between items-center py-4'>
          <div className='flex gap-2'>
            <Select defaultValue={data.current_semester.toString()} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((sem, index) => (
                  <SelectItem key={index} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Display Filtered Subjects */}
        <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-4'>
          {filteredSubjects.map((item, index) => (
            <div 
              key={index} 
              className='cursor-pointer' 
              onClick={() => { router.push(`courses/${item.subject_id}?subject=${encodeURIComponent(item.subject_name)}`); }}
            >
              <MySubjectCard key={index} data={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
