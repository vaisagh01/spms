"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useNotifications from "../notifications/sendNoti";

const API_BASE_URL = "http://127.0.0.1:8000/curricular";

const AssignmentsPage = () => {
  const { teacher_id } = useParams();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [editAssignment, setEditAssignment] = useState(null);
  const [newAssignment, setNewAssignment] = useState({courseId:",", title: "", description: "", due_date: "", due_time: "", max_marks: "", subject_id: "" });
  const [isPosting, setIsPosting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [editSubmission, setEditSubmission] = useState(null);
  const { sendNotification } = useNotifications();

  
  useEffect(() => {
    if (!teacher_id) return;

    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/teacher/${teacher_id}/subjects/`);
        setSubjects(response.data.subjects || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, [teacher_id]);
  

  useEffect(() => {
    if (!teacher_id) return;

    const fetchAssignments = async () => {
      try {
        let url = `${API_BASE_URL}/assignments/teacher/${teacher_id}/`;

        const response = await axios.get(url);
        setAssignments(response.data.assignments || []);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, [teacher_id, selectedSubject]);
  

  const handlePostAssignment = async () => {
    if (!newAssignment.subject_id || !newAssignment.title || !newAssignment.description || !newAssignment.due_date || !newAssignment.due_time || !newAssignment.max_marks) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setIsPosting(true);
    try {
        const response = await axios.post(`${API_BASE_URL}/assignments/post/${teacher_id}/`, newAssignment);
        
        const newAssignmentData = {
            ...newAssignment,
            assignment_id: response.data.assignment_id,
            subject__subject_name: subjects.find(s => s.subject_id.toString() === newAssignment.subject_id)?.subject_name || "Unknown",
        };

        setAssignments(prevAssignments => [newAssignmentData, ...prevAssignments]);
        setNewAssignment({ subject_id: "", title: "", description: "", due_date: "", due_time: "", max_marks: "" });

        toast({ title: "Success", description: "Assignment posted successfully!" });

        // Send a notification after posting the assignment
        await sendNotification(newAssignment.subject_id, `New assignment posted: ${newAssignment.title}`);

      } catch (error) {
          console.error("Error posting assignment:", error);
          toast({ title: "Error", description: "Failed to post assignment", variant: "destructive" });
      }
      setIsPosting(false);
  };

  const handleEditClick = (submission) => {
    setEditSubmission({ ...submission }); // Clone the submission to edit
  };
  const handleUpdateAssignment = async () => {
    if (!editAssignment) return;
    
    try {
      await axios.put(`${API_BASE_URL}/update_assignment/${teacher_id}/${editAssignment.assignment_id}/`, editAssignment);
      setAssignments(prevAssignments => prevAssignments.map(a => (a.assignment_id === editAssignment.assignment_id ? editAssignment : a)));
      setEditAssignment(null);
      toast({ title: "Updated", description: "Assignment updated successfully!", variant: "default" });
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast({ title: "Error", description: "Failed to update assignment", variant: "destructive" });
    }
  };
  
  const handleDeleteAssignment = async (assignment_id) => {
    try {
      await axios.delete(`${API_BASE_URL}/assignments/delete/${assignment_id}/`);
      setAssignments(prevAssignments => prevAssignments.filter(a => a.assignment_id !== assignment_id));
  
      toast({ title: "Deleted", description: "Assignment deleted successfully!", variant: "default" });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast({ title: "Error", description: "Failed to delete assignment", variant: "destructive" });
    }
  };
  
  const handleViewSubmissions = async (assignment_id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assignments/${assignment_id}/submissions/`);
      setSubmissions(response.data.submissions || []);
      setSelectedAssignment(assignments.find(a => a.assignment_id === assignment_id));
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({ title: "Error", description: "Failed to fetch submissions", variant: "destructive" });
    }
  };
  const handleUpdateSubmission = async () => {
    if (!editSubmission) return;
    
    try {
      await axios.put(`${API_BASE_URL}/submissions/update/${editSubmission.submission_id}/`, editSubmission);
      setSubmissions(prev =>
        prev.map(sub =>
          sub.submission_id === editSubmission.submission_id ? editSubmission : sub
        )
      );
      setEditSubmission(null);
      toast({ title: "Updated", description: "Submission updated successfully!", variant: "default" });
    } catch (error) {
      console.error("Error updating submission:", error);
      toast({ title: "Error", description: "Failed to update submission", variant: "destructive" });
    }
  };
  const handleDateChange = (e) => {
    const today = new Date().toISOString().split("T")[0];
    if (e.target.value >= today) {
      setNewAssignment({ ...newAssignment, due_date: e.target.value });
    } else {
      toast({ title: "Invalid Date", description: "Please select a date from today onwards", variant: "destructive" });
    }
  };
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Assignments</h1>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4">Post New Assignment</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post New Assignment</DialogTitle>
          </DialogHeader>
          <Select value={newAssignment.subject_id} onValueChange={(val) => setNewAssignment({ ...newAssignment, subject_id: val, courseId:subjects.course_id })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.subject_id} value={subject.subject_id.toString()}>
                  {subject.subject_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Title" value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} />
          <Textarea placeholder="Description" value={newAssignment.description} onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} />
          <Input type="date" value={newAssignment.due_date} onChange={handleDateChange} />          
          <Input type="time" value={newAssignment.due_time} onChange={(e) => setNewAssignment({ ...newAssignment, due_time: e.target.value })} />
          <Input type="number" placeholder="Max Marks" value={newAssignment.max_marks} onChange={(e) => setNewAssignment({ ...newAssignment, max_marks: e.target.value })} />
          <Button onClick={handlePostAssignment} disabled={isPosting}>
            {isPosting ? "Posting..." : "Post Assignment"}
          </Button>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <Card 
            key={assignment.assignment_id} 
            className="relative p-4"
            >
              <CardHeader>
                <CardTitle className="text-xl">{assignment.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-md text-gray-500">Subject: {assignment.subject__subject_name}</p>
                <p className="text-md text-gray-500">Due: {assignment.due_date} at {assignment.due_time}</p>
                <p className="text-md text-gray-500">Max Marks: {assignment.max_marks}</p>
                <p className="mt-2">{assignment.description}</p>

                {editAssignment && (
                  <Dialog open={true} onOpenChange={() => setEditAssignment(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Assignment</DialogTitle>
                      </DialogHeader>
                      <Input placeholder="Title" value={editAssignment.title} onChange={(e) => setEditAssignment({ ...editAssignment, title: e.target.value })} />
                      <Textarea placeholder="Description" value={editAssignment.description} onChange={(e) => setEditAssignment({ ...editAssignment, description: e.target.value })} />
                      <Input type="date" value={editAssignment.due_date} onChange={(e) => setEditAssignment({ ...editAssignment, due_date: e.target.value })} />
                      <Input type="time" value={editAssignment.due_time} onChange={(e) => setEditAssignment({ ...editAssignment, due_time: e.target.value })} />
                      <Input type="number" placeholder="Max Marks" value={editAssignment.max_marks} onChange={(e) => setEditAssignment({ ...editAssignment, max_marks: e.target.value })} />
                      <Button onClick={handleUpdateAssignment}>Update Assignment</Button>
                    </DialogContent>
                  </Dialog>
                )}
                <Button className="mr-4" onClick={() => handleViewSubmissions(assignment.assignment_id)}>View</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="mt-4" variant="destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteAssignment(assignment.assignment_id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No assignments available</p>
        )}
        {selectedAssignment && (
        <Dialog open={true} onOpenChange={() => setSelectedAssignment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submissions for Assignment</DialogTitle>
            </DialogHeader>

            {submissions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.submission_id}>
                      <TableCell>{submission.student_name}</TableCell>
                      <TableCell>{submission.submission_date}</TableCell>

                      {/* Show marks as text unless editing */}
                      <TableCell>
                        {editSubmission?.submission_id === submission.submission_id ? (
                          <Input
                            type="number"
                            value={editSubmission.marks_obtained}
                            onChange={(e) =>
                              setEditSubmission({ ...editSubmission, marks_obtained: e.target.value })
                            }
                          />
                        ) : (
                          submission.marks_obtained || "Not graded"
                        )}
                      </TableCell>

                      {/* Show feedback as text unless editing */}
                      <TableCell>
                        {editSubmission?.submission_id === submission.submission_id ? (
                          <Input
                            type="text"
                            value={editSubmission.feedback}
                            onChange={(e) =>
                              setEditSubmission({ ...editSubmission, feedback: e.target.value })
                            }
                          />
                        ) : (
                          submission.feedback || "No feedback"
                        )}
                      </TableCell>

                      <TableCell>
                        {editSubmission?.submission_id === submission.submission_id ? (
                          <Button onClick={handleUpdateSubmission}>Save</Button>
                        ) : (
                          <Button onClick={() => handleEditClick(submission)}>Edit</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No submissions found</p>
            )}
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
};

export default AssignmentsPage;
