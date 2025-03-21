"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format } from "date-fns";
import Link from "next/link";

function StudentClubs() {
  const [clubs, setClubs] = useState([]);
  const [semester, setSemester] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const params = useParams();
  
  useEffect(() => {
    const studentId = params.student_id; // Get student_id from URL params
    // Fetch clubs and events the student is part of
    axios.get(`http://127.0.0.1:8000/extracurricular/student/${studentId}/clubs/`)
      .then(response => {
        setClubs(response.data.clubs);
      })
      .catch(error => console.error("Error fetching clubs data:", error));
  }, [params.student_id]);

  // Sort clubs by creation date
  const sortedClubs = [...clubs].sort((a, b) => {
    return sortOrder === "asc"
      ? new Date(a.created_date) - new Date(b.created_date)
      : new Date(b.created_date) - new Date(a.created_date);
  });

  return (
    <Card className="border-2 border-slate-300" >
      <CardHeader>
        <CardTitle>Clubs & Events</CardTitle>
        <CardDescription>View the clubs and events you are part of.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[335px]">
        {/* Sorting */}
        <div className="flex gap-1">
          <Select onValueChange={setSortOrder} defaultValue="desc">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Display Clubs and Latest Event */}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full table-auto">
            <thead className="">
              <tr>
                <th className="px-4 text-start py-2">Club</th>
                <th className="px-4 text-start py-2">Event</th>
              </tr>
            </thead>
            <tbody>
              {sortedClubs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-sm text-gray-500">No clubs found.</td>
                </tr>
              ) : (
                sortedClubs.map((club) => {
                  // Get the latest event for this club
                  const latestEvent = club.events_participated.length > 0
                    ? club.events_participated.sort((a, b) => new Date(b.event_date) - new Date(a.event_date))[0]
                    : null;

                  return (
                    <tr key={club.club_id} className="border-t">
                      <td className="px-4 py-2">{club.club_name}</td>
                      {/* <td className="px-4 py-2">{club.club_category}</td> */}
                      {/* <td className="px-4 py-2">{club.club_description}</td> */}
                      <td className="px-4 py-2">
                        {latestEvent ? (
                          <Link href={`${params.student_id}/extra-curricular/clubs/${club.club_id}/${latestEvent.event_id}`} className="text-blue-500 hover:underline">
                            {latestEvent.event_name}
                          </Link>
                        ) : (
                          <span className="text-gray-500">No events</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default StudentClubs;
