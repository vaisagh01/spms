"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";

const AttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [selectedHour, setSelectedHour] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const params = useParams();
  const { toast } = useToast();
  
  const HOUR_CHOICES = [
    { value: 1, label: "9-10" },
    { value: 2, label: "10-11" },
    { value: 3, label: "11-12" },
    { value: 4, label: "12-1" },
    { value: 5, label: "2-3" },
    { value: 6, label: "3-4" },
    { value: 7, label: "4-5" },
  ];

  useEffect(() => {
    if (!params.teacher_id) return;
    axios.get(`http://localhost:8000/curricular/students/${params.teacher_id}`)
      .then(response => {
        console.log(response.data);
        
        setCourses(response.data.courses || []);
        setSubjects(response.data.subjects || []);
        setStudents(response.data.students || []);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, [params.teacher_id]);

  const handleAttendanceChange = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "Present" ? "Absent" : "Present",
    }));
  };

  const getAbsentees = () => {
    return students.filter(student => !attendance[student.student_id] || attendance[student.student_id] === "Absent");
  };

  const confirmAndSubmitAttendance = () => {
    setDialogOpen(true);
  };

  const submitAttendance = async () => {
    setDialogOpen(false);
    const today = new Date().toISOString().split("T")[0];

    const attendanceData = students.map(student => ({
      student_id: student.student_id,
      subject_id: selectedSubject,
      course_id: selectedCourse,
      teacher_id: params.teacher_id,
      date: today,
      hour: selectedHour,
      status: attendance[student.student_id] || "Absent",
    }));

    try {
      (await axios.post("http://localhost:8000/curricular/attendance/mark/", attendanceData));
      toast({ title: "Success", description: "Attendance marked successfully", variant: "success" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark attendance", variant: "destructive" });
    }
  };

  return (
    <Card className="p-4 w-full mx-auto m-2">
      <h2 className="text-xl font-bold mb-4 text-center">Mark Attendance</h2>

      {/* Selection Inputs */}
      <div className="mb-4 flex flex-wrap gap-2 sm:gap-4">
        {/* Course Selection */}
        <Select onValueChange={(value) => setSelectedCourse(parseInt(value))}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select Course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map(course => (
              <SelectItem key={course.course_id} value={course.course_id.toString()}>
                {course.course_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Subject Selection */}
        <Select onValueChange={(value) => setSelectedSubject(parseInt(value))}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subject => (
              <SelectItem key={subject.subject_id} value={subject.subject_id.toString()}>
                {subject.subject_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Hour Selection */}
        <Select onValueChange={(value) => setSelectedHour(parseInt(value))}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Select Hour" />
          </SelectTrigger>
          <SelectContent>
            {HOUR_CHOICES.map(hour => (
              <SelectItem key={hour.value} value={hour.value}>{hour.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Attendance Table (Scrollable) */}
      <div className="overflow-auto max-w-full">
        <Table className="w-full min-w-[400px]">
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Enrollment No.</TableHead>
              <TableHead>Present</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map(student => (
              <TableRow key={student.student_id}>
                <TableCell>{student.username}</TableCell>
                <TableCell>{student.enrollment_number}</TableCell>
                <TableCell>
                  <Checkbox checked={attendance[student.student_id] === "Present"} onCheckedChange={() => handleAttendanceChange(student.student_id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Submit Button */}
      <Button className="mt-4 w-full sm:w-auto" onClick={confirmAndSubmitAttendance} disabled={!selectedCourse || !selectedSubject}>
        Submit Attendance
      </Button>

      {/* Dialog for Confirming Absentees */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="p-4 max-w-sm mx-auto">
          <DialogTitle>Confirm Absentees</DialogTitle>
          <DialogDescription>
            The following students are marked as absent:
            <ul className="list-disc pl-5">
              {getAbsentees().map(student => (
                <li key={student.student_id}>{student.username} ({student.enrollment_number})</li>
              ))}
            </ul>
          </DialogDescription>
          <Button className="w-full mt-2" onClick={submitAttendance}>Confirm & Submit</Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AttendancePage;
