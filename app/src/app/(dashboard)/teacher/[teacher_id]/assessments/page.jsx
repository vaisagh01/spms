"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select,SelectItem,SelectTrigger,SelectValue,SelectContent } from "@/components/ui/select";
import useNotifications from "../notifications/sendNoti";

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [openMarksDialog, setOpenMarksDialog] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [newAssessment, setNewAssessment] = useState({
    subject_id: "",
    assessment_type: "",
    total_marks: "",
    date_conducted: "",
  });
  const { sendNotification } = useNotifications();


  const { toast } = useToast();
  const teacherId = 1; // Replace with dynamic teacher_id

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data } = await axios.get(`http://localhost:8000/curricular/assessments/${teacherId}/`);
      setAssessments(data.assessments || []);
      const subjectsRes = await axios.get(`http://localhost:8000/curricular/teacher/${teacherId}/subjects/`);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  console.log(assessments);
  
  async function fetchStudents(assessmentId, subjectId) {
    try {
      const { data: studentsData } = await axios.get(`http://localhost:8000/curricular/students/${subjectId}/`);
      
      // Fetch marks
      const marksRes = await axios.get(`http://localhost:8000/curricular/assessment/${assessmentId}/marks/`);
      
      // Merge students with their marks
      const studentsWithMarks = studentsData.students.map((student) => {
        const markEntry = marksRes.data.marks.find((m) => m.student_id === student.student_id);
        return {
          ...student,
          marks_obtained: markEntry ? markEntry.marks_obtained : "", // Show marks if they exist
        };
      });

      // Update state with fetched data
      setStudents(studentsWithMarks);
      setSelectedAssessment({ assessmentId, subjectId });
      setOpenMarksDialog(true);
    } catch (error) {
      console.error("Error fetching students and marks:", error);
    }
  }

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:8000/curricular/assessments/create/", {
        ...newAssessment,
        teacher_id: teacherId,
      });
      console.log(newAssessment);
      

      toast({ title: "Success", description: "Assessment Created Successfully!" });
      // await sendNotification(, `New assignment posted: ${newAssignment.title}`);
      setOpen(false);
      setNewAssessment({ subject_id: "", assessment_type: "", total_marks: "", date_conducted: "" });
      await sendNotification(newAssessment.subject_id, `New assignment posted: ${newAssessment.title}`);
      fetchData(); // Refresh table after submission
    } catch (error) {
      console.error("Error submitting assessment:", error);
      alert("Error creating assessment.");
    }
  };

  async function handleMarksSubmit() {
    try {
      await axios.post(`http://localhost:8000/curricular/assessment/${selectedAssessment.assessmentId}/marks/`, {
        marks: students.map(({ student_id, marks_obtained }) => ({
          student_id,
          marks_obtained,
        })),
      });

      toast({ title: "Success", description: "Marks Updated Successfully!" });
      setOpenMarksDialog(false);
    } catch (error) {
      console.error("Error updating marks:", error);
    }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Assessments</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Assessment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Assessment</DialogTitle>
              </DialogHeader>
              <form className="space-y-4">
                {/* Select Subject */}
                <Select
                  value={newAssessment.subject_id}
                  onValueChange={(value) => setNewAssessment({ ...newAssessment, subject_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.subject_id} value={String(subject.subject_id)}>
                        {subject.subject_name} ({subject.subject_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Select Assessment Type */}
                <Select
                  value={newAssessment.assessment_type}
                  onValueChange={(value) => setNewAssessment({ ...newAssessment, assessment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Assessment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mid Semester">Mid Semester</SelectItem>
                    <SelectItem value="End Semester">End Semester</SelectItem>
                    <SelectItem value="Lab">Lab</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Total Marks"
                  value={newAssessment.total_marks}
                  onChange={(e) => setNewAssessment({ ...newAssessment, total_marks: e.target.value })}
                  required
                />
                <Input
                  type="date"
                  value={newAssessment.date_conducted}
                  onChange={(e) => setNewAssessment({ ...newAssessment, date_conducted: e.target.value })}
                  required
                />
                <Button type="button" onClick={handleSubmit}>
                  Submit
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>Date Conducted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment.assessment_id}>
                  <TableCell>{assessment.assessment_type}</TableCell>
                  <TableCell>{assessment.subject_name} ({assessment.subject_code})</TableCell>
                  <TableCell>{assessment.total_marks}</TableCell>
                  <TableCell>{assessment.date_conducted}</TableCell>
                  <TableCell>
                    <Button onClick={() => fetchStudents(assessment.assessment_id, assessment.subject_id)}>
                      Enter Marks
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Marks Entry Dialog */}
      <Dialog open={openMarksDialog} onOpenChange={setOpenMarksDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Marks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Marks Obtained</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.student_id}>
                    <TableCell>{student.first_name} {student.last_name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={student.marks_obtained}
                        onChange={(e) => {
                          const newMarks = [...students];
                          newMarks[index].marks_obtained = e.target.value;
                          setStudents(newMarks);
                        }}
                        placeholder="Enter Marks"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={handleMarksSubmit}>Save Marks</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
