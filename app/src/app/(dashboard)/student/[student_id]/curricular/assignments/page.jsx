"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MyAssignments from "@/components/MyAssignments";
import axios from "axios";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const API_BASE_URL = "http://localhost:8000/curricular";

const Page = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // Default: Newest first
  const [selectedStatus, setSelectedStatus] = useState("all"); // Default: Show all
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  const params = useParams();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const id = params.student_id;
    if (!id) {
      setError("No student ID provided");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/assignments/student/${id}/`
      );
      const assignments = response.data.assignments.map((assignment) => ({
        ...assignment,
        status: determineStatus(assignment),
      }));
      setData({ ...response.data, assignments });
      setFilteredAssignments(assignments);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [params.student_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to determine assignment status
  const determineStatus = (assignment) => {
    const dueDate = new Date(assignment.due_date);
    const now = new Date();

    if (assignment.is_completed) {
      return "completed";
    } else if (dueDate > now) {
      return "pending";
    } else {
      return "missing";
    }
  };

  // Apply filtering when subject, status, or sorting changes
  useEffect(() => {
    if (data && data.assignments) {
      let filtered = data.assignments;

      // Filter by subject
      if (selectedSubject !== "all") {
        filtered = filtered.filter(
          (assignment) => assignment.subject_code === selectedSubject
        );
      }

      // Filter by status
      if (selectedStatus !== "all") {
        filtered = filtered.filter((assignment) => assignment.status === selectedStatus);
      }

      // Sort by date
      filtered = filtered.sort((a, b) => {
        return sortOrder === "asc"
          ? new Date(a.due_date) - new Date(b.due_date)
          : new Date(b.due_date) - new Date(a.due_date);
      });

      setFilteredAssignments(filtered);
    }
  }, [selectedSubject, selectedStatus, sortOrder, data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex flex-1 flex-col space-y-2">
        {/* Page Header */}
        <div className="flex items-center gap-7 space-y-2 my-4">
          <div className="mt-2 cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft />
          </div>
          <h2 className="text-4xl font-bold tracking-tight">Assignments</h2>
        </div>

        {/* Filters */}
        <div className="flex justify-between mx-6 items-center py-4">
          <div className="flex gap-2">
            {/* Subject Filter */}
            <Select onValueChange={setSelectedSubject} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {Array.from(
                  new Set(data.assignments.map((a) => a.subject_code))
                ).map((subject, index) => (
                  <SelectItem key={index} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select onValueChange={setSelectedStatus} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort by Date Filter */}
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
        </div>

        {/* Assignments Grid */}
        <div className="grid mx-[3%] gap-4 md:grid-cols-1 lg:grid-cols-1">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((item, index) => (
              <Link key={index} href="#">
                <MyAssignments
                  data={item}
                  studentId={params.student_id}
                  refreshData={fetchData} // <-- Pass refresh function
                />
              </Link>
            ))
          ) : (
            <p className="text-gray-500">No assignments found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
