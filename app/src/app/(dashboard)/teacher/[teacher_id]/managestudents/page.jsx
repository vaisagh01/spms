"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const StudentsTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios.get("http://localhost:8000/curricular/students/")
      .then((response) => {
        setStudents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Student List</h2>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>Enrollment No</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Semester</TableHead>
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
            ) : (
              students.map((student) => (
                <TableRow className="cursor-pointer" onClick={()=> router.push(`managestudents/${student.student_id}`)} key={student.student_id}>
                  <TableCell>{student.student_id}</TableCell>
                  <TableCell>{student.username}</TableCell>
                  <TableCell>{student.phone_number || "N/A"}</TableCell>
                  <TableCell>{student.date_of_birth || "N/A"}</TableCell>
                  <TableCell>{student.enrollment_number}</TableCell>
                  <TableCell>{student.course__name}</TableCell>
                  <TableCell>{student.year_of_study || "N/A"}</TableCell>
                  <TableCell>{student.semester}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default StudentsTable;
