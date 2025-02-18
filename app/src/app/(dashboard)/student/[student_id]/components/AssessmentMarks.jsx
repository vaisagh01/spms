import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format } from "date-fns";

function AssessmentMarks() {
  const [assessments, setAssessments] = useState([]);
  const [marks, setMarks] = useState([]);
  const [semester, setSemester] = useState("all");
  const [subject, setSubject] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortByMarks, setSortByMarks] = useState("none");

  const params = useParams();

  useEffect(() => {
    const id = params.student_id; // Default for testing
    axios.get(`http://127.0.0.1:8000/curricular/student/${id}/assignments-marks/`)
      .then(response => {
        setAssessments(response.data.assessments);
        setMarks(response.data.marks);
      })
      .catch(error => console.error("Error fetching assessment marks:", error));
  }, []);
  
  // Get unique semesters and subjects for filters
  const semesters = [...new Set(assessments.map(item => item.semester))];
  const subjects = [...new Set(assessments.map(item => item.subject_name))];

  // Filter assessments by semester and subject
  let filteredMarks = marks.filter(mark => {
    let assessment = assessments.find(a => a.assessment_id === mark.assessment_id);
    if (!assessment) return false;
    return (semester === "all" || assessment.semester == semester) &&
           (subject === "all" || assessment.subject_name === subject);
  });

  // Sort by date or marks
  filteredMarks.sort((a, b) => {
    if (sortByMarks !== "none") {
      return sortByMarks === "asc" ? a.marks_obtained - b.marks_obtained : b.marks_obtained - a.marks_obtained;
    }
    return sortOrder === "asc"
      ? new Date(a.date_conducted) - new Date(b.date_conducted)
      : new Date(b.date_conducted) - new Date(a.date_conducted);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          Assessment Marks
        </CardTitle>
        <CardDescription>View your assessment performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1">
            <Select onValueChange={setSemester} defaultValue="all">
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Semester" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesters.map((sem, index) => (
                <SelectItem key={index} value={sem}>{`Semester ${sem}`}</SelectItem>
                ))}
            </SelectContent>
            </Select>

            {/* Filter by Subject */}
            <Select onValueChange={setSubject} defaultValue="all">
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Subject" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subj, index) => (
                <SelectItem key={index} value={subj}>{subj}</SelectItem>
                ))}
            </SelectContent>
            </Select>

            {/* Sort by Date */}
            <Select onValueChange={setSortOrder} defaultValue="desc">
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by Date" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
            </Select>

            {/* Sort by Marks */}
            <Select onValueChange={setSortByMarks} defaultValue="none">
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by Marks" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="none">No Sorting</SelectItem>
                <SelectItem value="desc">Highest-Lowest</SelectItem>
                <SelectItem value="asc">Lowest-Highest</SelectItem>
            </SelectContent>
            </Select>
        </div>

        {/* Display Assessment Marks */}
        <div className="space-y-6 mt-4">
          {assessments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assessments found.</p>
          ) : (
            assessments.map((assessment, index) => {
              const mark = marks.find(m => m.assessment_id === assessment.assessment_id);
              return (
                <div key={index} className="flex items-center border-b-[1px] py-2 border-slate-200">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{assessment.assessment_type}</p>
                    <p className="text-sm text-muted-foreground">{assessment.subject_name} ({assessment.subject_code})</p>
                  </div>
                  <div className="ml-auto font-medium text-blue-500">
                    {format(new Date(assessment.date_conducted), "dd/MM/yyyy")}
                  </div>
                  <div className="ml-4 font-xs">
                    {mark ? `${mark.marks_obtained}/${mark.total_marks}` : <p className="text-xs text-slate-400">-/-</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AssessmentMarks;
