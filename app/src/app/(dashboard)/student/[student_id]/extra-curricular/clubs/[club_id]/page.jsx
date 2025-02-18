"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import { useParams } from "next/navigation";

const ClubProfile = () => {
  const [club, setClub] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const params = useParams();

  useEffect(() => {
    const club_id = params.club_id; // Get club_id from URL params
    const student_id = params.student_id; // Get student_id from URL params

    if (club_id && student_id) {
      // Fetch the club profile from the API
      axios
        .get(`http://localhost:8000/api/clubs/${club_id}/profile/`)
        .then((response) => {
          const clubData = response.data.club_profile;
          setClub(clubData); // Set the club data in the state
          
          // Check if the student is the leader
          if (clubData.leader_id === parseInt(student_id)) {
            setIsLeader(true);
          }
        })
        .catch((error) => {
          console.error("Error fetching club data:", error);
        });
    }
  }, [params.club_id, params.student_id]); // Fetch data when club_id or student_id changes

  if (!club) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/path/to/default-avatar.jpg" alt={club.club_name} />
              <AvatarFallback>{club.club_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">{club.club_name}</CardTitle>
              <CardDescription className="text-sm">{club.club_category}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{club.club_description || "No description available"}</p>
          <p className="mt-4 text-md">Faculty In Charge: {club.faculty_incharge || "N/A"}</p>
          <p className="text-md">Leader: {club.leader || "N/A"}</p>

          {/* Grid for members and events sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Members Table */}
              <div>
              <div className="flex justify-between">
              <h3 className="text-xl font-semibold mb-4">Members</h3>
              {isLeader && (
                <Button variant="outline" className="mt-4">Add Member</Button>
              )}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {club.members.map((member) => (
                    <TableRow key={member.member_id}>
                      <TableCell>{member.student_username}</TableCell>
                      <TableCell>{member.role_in_club}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Add Member Button for the leader */}
              
            </div>

            {/* Events Table */}
            <div>
              <div className="flex justify-between">
              <h3 className="text-xl font-semibold mb-4">Events</h3>
              {isLeader && (
                <Button variant="outline" className="mt-4">Add Event</Button>
              )}
              </div>
              {club.events.length === 0 ? (
                <p>No upcoming events</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {club.events.map((event, index) => (
                      <TableRow key={index}>
                        <TableCell>{event.event_name}</TableCell>
                        <TableCell>{event.event_date}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Event
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {/* Add Event Button for the leader */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubProfile;
