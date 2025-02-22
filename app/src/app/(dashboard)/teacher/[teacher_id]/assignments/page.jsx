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

const API_BASE_URL = "http://127.0.0.1:8000/curricular";

const AssignmentsPage = () => {
  const { teacher_id } = useParams();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [editAssignment, setEditAssignment] = useState(null);
  const [newAssignment, setNewAssignment] = useState({ title: "", description: "", due_date: "", due_time: "", max_marks: "", subject_id: "" });
  const [isPosting, setIsPosting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
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
        if (selectedSubject) {
          url += `?subject_id=${selectedSubject}`;
        }

        const response = await axios.get(url);
        setAssignments(response.data.assignments || []);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, [teacher_id, selectedSubject]);

  const handlePostAssignment = async () => {
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
  
      toast({ title: "Success", description: "Assignment posted successfully!", variant: "default" });
    } catch (error) {
      console.error("Error posting assignment:", error);
      toast({ title: "Error", description: "Failed to post assignment", variant: "destructive" });
    }
    setIsPosting(false);
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
      setSelectedAssignment(assignment_id);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({ title: "Error", description: "Failed to fetch submissions", variant: "destructive" });
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
          <Select value={newAssignment.subject_id} onValueChange={(val) => setNewAssignment({ ...newAssignment, subject_id: val })}>
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
          <Input type="date" value={newAssignment.due_date} onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })} />
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
            className="relative p-4" onClick={() => handleViewSubmissions(assignment.assignment_id)}
            >
              <CardHeader>
                <CardTitle>{assignment.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Subject: {assignment.subject__subject_name}</p>
                <p className="text-sm text-gray-500">Due: {assignment.due_date} at {assignment.due_time}</p>
                <p className="text-sm text-gray-500">Max Marks: {assignment.max_marks}</p>
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
              <ul>
                {submissions.map((submission) => (
                  <li key={submission.submission_id} className="p-2 border-b">
                    {submission.student_name} - {submission.submission_date}
                  </li>
                ))}
              </ul>
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
