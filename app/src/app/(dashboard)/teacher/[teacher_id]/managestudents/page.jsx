<<<<<<< Updated upstream
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const StudentsTable = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { teacher_id } = useParams();
  const { toast } = useToast();
  const router = useRouter();
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    if (!teacher_id) return;

    axios.get(`http://localhost:8000/curricular/students/${teacher_id}`)
      .then((response) => {
        setCourses(response.data.courses || []);
        setStudents(response.data.students || []);
        if (response.data.courses.length > 0) {
          setSelectedCourse(response.data.courses[0].course_id);
        }
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setLoading(false));
  }, [teacher_id]);

  const fetchAttendance = async () => {
    if (!selectedCourse) return;

    try {
      const response = await axios.get(`http://localhost:8000/curricular/attendance/course/${selectedCourse}`);
      setAttendanceRecords(response.data.attendance_summary || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast({ title: "Error", description: "Failed to fetch attendance records", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedCourse]);

  const uniqueYears = [...new Set(students.map(student => student.year_of_study))].sort();

  const filteredStudents = students
    .filter(student => 
      (!selectedCourse || student.course__course_name === courses.find(c => c.course_id === selectedCourse)?.course_name) &&
      (!selectedYear || student.year_of_study === Number(selectedYear))
    )
    .sort((a, b) => a.year_of_study - b.year_of_study);

  const handleUpdateSemesters = async () => {
    if (!selectedCourse) return;
    
    setDialogOpen(false);
    setUpdating(true);
    try {
      const response = await axios.post("http://localhost:8000/curricular/update_semesters/", { course_id: selectedCourse });

      toast({ title: "Success", description: response.data.message, variant: "success" });

      axios.get(`http://localhost:8000/curricular/students/${teacher_id}`)
        .then((response) => {
          setStudents(response.data.students || []);
        });

    } catch (error) {
      console.error("Error updating semesters:", error);
      toast({ title: "Error", description: "Failed to update semesters", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Student List</h2>

      {/* Filters: Course & Year */}
      <div className="mb-4 flex items-center gap-4">
        <Select onValueChange={(value) => setSelectedCourse(Number(value))} value={selectedCourse?.toString()}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a Course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map(course => (
              <SelectItem key={course.course_id} value={course.course_id.toString()}>
                {course.course_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setSelectedYear(value === "all" ? null : value)} value={selectedYear || "all"}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {uniqueYears.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedCourse || updating}>{updating ? "Updating..." : "Update Semesters"}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Update</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to update all students' semesters? Graduated students will be removed.</p>
            <DialogFooter>
              <Button variant="destructive" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateSemesters} disabled={updating}>{updating ? "Updating..." : "Yes, Update"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Students Table with Attendance */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Enrollment No</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Present Hours</TableHead>
              <TableHead>Absent Hours</TableHead>
              <TableHead>Attendance (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
  {loading ? (
    Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        {Array(8).fill().map((_, i) => (
          <TableCell key={i}><Skeleton className="h-4 w-24" /></TableCell>
        ))}
      </TableRow>
    ))
  ) : students.length > 0 ? (
    students.map((student) => {
      const attendance = attendanceRecords.find(record => record.student_id === student.student_id) || { present_hours: 0, total_hours: 0 };
      const absentHours = attendance.total_hours - attendance.present_hours;
      const attendancePercentage = attendance.total_hours > 0 
        ? ((attendance.present_hours / attendance.total_hours) * 100).toFixed(2) 
        : "N/A";

      // Apply conditional styling
      const attendanceClass = attendancePercentage !== "N/A" 
        ? attendancePercentage < 75 ? "bg-red-100" 
        : attendancePercentage < 85 ? "bg-orange-200"
        : ""
        : "";

      return (
        <TableRow 
          key={student.student_id} 
          className={`cursor-pointer ${attendanceClass}`} 
          onClick={() => router.push(`managestudents/${student.student_id}`)}
        >
          <TableCell>{student.student_id}</TableCell>
          <TableCell>{student.username}</TableCell>
          <TableCell>{student.phone_number || "N/A"}</TableCell>
          <TableCell>{student.enrollment_number}</TableCell>
          <TableCell>{student.course__course_name}</TableCell>
          <TableCell className="text-green-600">{attendance.present_hours}</TableCell>
          <TableCell className="text-red-600">{absentHours}</TableCell>
          <TableCell className="font-bold">{attendancePercentage}%</TableCell>
        </TableRow>
      );
    })
  ) : (
    <TableRow>
      <TableCell colSpan={8} className="text-center">No students found</TableCell>
    </TableRow>
  )}
</TableBody>

        </Table>
      </div>
    </Card>
  );
};

export default StudentsTable;
=======
import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page
>>>>>>> Stashed changes
