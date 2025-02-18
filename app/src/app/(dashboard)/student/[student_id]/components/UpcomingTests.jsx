import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useParams } from "next/navigation";

function UpcomingTests() {
  const [upcomingAssessments, setUpcomingAssessments] = useState([]);
  const params = useParams();

  useEffect(() => {
    const id = params.student_id;
    if (!id) return;

    axios.get(`http://127.0.0.1:8000/curricular/student/${id}/assignments-marks/`)
      .then(response => {
        const { assessments, marks } = response.data;

        // Extract assessment IDs that have marks
        const completedAssessmentIds = new Set(marks.map(mark => mark.assessment_id));

        // Get the current date
        const currentDate = new Date();

        // Filter the assessments by those that haven't been completed yet and are in the future
        const filteredAssessments = assessments.filter(assessment => {
          const assessmentDate = new Date(assessment.date_conducted);
          return (
            !completedAssessmentIds.has(assessment.assessment_id) &&
            assessmentDate > currentDate // Only show tests that are in the future
          );
        });

        setUpcomingAssessments(filteredAssessments);
      })
      .catch(error => {
        console.error("Error fetching upcoming assessments:", error);
      });
  }, [params.student_id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          Upcoming Tests
          <Button>View All Tests</Button>
        </CardTitle>
        <CardDescription>You have {upcomingAssessments.length} upcoming tests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {upcomingAssessments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming tests.</p>
          ) : (
            upcomingAssessments.map((item, index) => (
              <div key={index} className="flex items-center border-b-[1px] py-2 border-slate-200">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{item.assessment_type}</p>
                  <p className="text-sm text-muted-foreground">{item.subject_name} ({item.subject_code})</p>
                </div>
                <div className="ml-auto font-medium text-blue-500">
                  {format(new Date(item.date_conducted), "dd/MM/yy")}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default UpcomingTests;
