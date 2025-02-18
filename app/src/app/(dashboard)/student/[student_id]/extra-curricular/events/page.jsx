"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useParams } from "next/navigation";

const Page = () => {
  const [data, setData] = useState([]);
  const [clubs, setClubs] = useState([]); // For the select dropdown
  const [selectedClub, setSelectedClub] = useState(""); // Selected club filter
  const params = useParams();

  useEffect(() => {
    const id = params.student_id; // Assuming the student ID is passed as a URL param
    // Fetch events data for the specific student
    axios
      .get(`http://localhost:8000/api/student/${id}/events/`)
      .then((response) => {
        setData(response.data.events);
      })
      .catch((error) => {
        console.error("Error fetching events data:", error);
      });

    // Fetch clubs for the Select dropdown
    axios
      .get(`http://localhost:8000/api/student/${id}/clubs/`)
      .then((response) => {
        setClubs(response.data.clubs);
      })
      .catch((error) => {
        console.error("Error fetching clubs:", error);
      });
  }, [params.student_id]);

  const handleClubChange = (value) => {
    setSelectedClub(value);
  };

  const filteredData = selectedClub
    ? data.filter((event) => event.club_name === selectedClub)
    : data;

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-bold tracking-tight">
            Manage your events here
          </CardTitle>
          <CardDescription>
            Filter and manage events based on clubs
          </CardDescription>
        </CardHeader>

        {/* Select Dropdown to filter by club */}
        <CardContent className="container mx-auto flex flex-col gap-3">  
          <div className="w-48">
            <Select onValueChange={handleClubChange} className="w-32">
              <SelectTrigger>
                <SelectValue placeholder="Select Club" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club.club_id} value={club.club_name}>
                    {club.club_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
