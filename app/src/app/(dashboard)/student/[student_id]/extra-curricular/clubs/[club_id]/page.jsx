"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import { useParams } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ClubProfile = () => {
  const [club, setClub] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [newMember, setNewMember] = useState({ username: "", role: "Member" });
  const [newEvent, setNewEvent] = useState({ event_name: "", event_date: "" });
  const params = useParams();

  useEffect(() => {
    const club_id = params.club_id;
    const student_id = params.student_id;

    // Fetch the club profile from the API
    axios
      .get(`http://localhost:8000/api/clubs/${club_id}/profile/`)
      .then((response) => {
        const clubData = response.data.club_profile;
        setClub(clubData);

        // Check if the student is the leader
        if (clubData.leader_id === parseInt(student_id)) {
          setIsLeader(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching club data:", error);
      });
  }, [params.club_id, params.student_id]);

  const handleAddMember = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/api/add_member/${params.club_id}/`, {
        username: newMember.username,
        role: newMember.role
      });
  
      setClub((prevClub) => ({
        ...prevClub,
        members: [...prevClub.members, { name: newMember.username, role_in_club: newMember.role }]
      }));
  
      setNewMember({ username: "", role: "Member" }); // Reset input fields
    } catch (error) {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        if (error.response.status === 404) {
          alert("Error: The student does not exist. Please check the username and try again.");
        } else if (error.response.status === 400) {
          alert("Error: Invalid input. Please check the details and try again.");
        } else {
          alert("An error occurred while adding the member. Please try again later.");
        }
      } else if (error.request) {
        // No response received from server
        alert("No response from server. Please check your network connection.");
      } else {
        // Other errors
        alert("An unexpected error occurred.");
      }
      console.error("Error adding member:", error);
    }
  };
  const handleDeleteMember = async (member_id) => {
    try {
      await axios.delete(`http://localhost:8000/api/clubs/${params.club_id}/delete_member/`, { data: { member_id: member_id } });
      setClub((prevClub) => ({
        ...prevClub,
        members: prevClub.members.filter(member => member.member_id !== member_id)
      }));
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };
  const handleAddEvent = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/api/add_event/${params.club_id}/`, {
        event_name: newEvent.event_name,
        event_date: newEvent.event_date
      });
      console.log(response.data);
      setClub((prevClub) => ({
        ...prevClub,
        events: [...prevClub.events, { event_name: newEvent.event_name, event_date: newEvent.event_date }]
      }));
    } catch (error) {
      console.error("Error adding event:", error.response ? error.response.data : error);
    }
  };
  const handleDeleteEvent = async (event_id) => {
    try {
      await axios.delete(`http://localhost:8000/api/clubs/${params.club_id}/delete_event/`, { data: { event_id: event_id } });
      setClub((prevClub) => ({
        ...prevClub,
        events: prevClub.events.filter(event => event.event_id !== event_id)
      }));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };
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
          <p className="mt-4 text-md">Faculty In Charge: {club?.faculty_incharge || "N/A"}</p>
          <p className="text-md">Leader: {club.leader || "N/A"}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Members Table */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Members</h3>
                {isLeader && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="color"  className="mt-4 bg-indigo-700 text-white">Add Member</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Add New Member</DialogTitle>
                      <DialogDescription>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={newMember.username}
                          onChange={(e) => setNewMember({ ...newMember, username: e.target.value })}
                          required
                        />
                        <Label htmlFor="role">Role</Label>
                        <Input
                          id="role"
                          value={newMember.role}
                          onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                        />
                        <Button onClick={handleAddMember}>Submit</Button>
                      </DialogDescription>
                    </DialogContent>
                  </Dialog>
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
                  {club.members.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.role_in_club}</TableCell>
                      {isLeader && (
                        <TableCell>
                          <Button variant="destructive" onClick={() => handleDeleteMember(member.member_id)}>Delete</Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Events Table */}
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold mb-4">Events</h3>
                {isLeader && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-4">Add Event</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Add New Event</DialogTitle>
                      <DialogDescription>
                        <Label htmlFor="event_name">Event Name</Label>
                        <Input
                          id="event_name"
                          value={newEvent.event_name}
                          onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })}
                          required
                        />
                        <Label htmlFor="event_date">Event Date</Label>
                        <Input
                          id="event_date"
                          value={newEvent.event_date}
                          onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                          type="date"
                          required
                        />
                        <Button onClick={handleAddEvent}>Submit</Button>
                      </DialogDescription>
                    </DialogContent>
                  </Dialog>
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
                      {/* <TableHead>Details</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {club.events.map((event, index) => (
                      <TableRow key={index}>
                        <TableCell>{event.event_name}</TableCell>
                        <TableCell>{event.event_date}</TableCell>
                        {
                          isLeader && (
                            <TableCell>
                              <Button variant="destructive" onClick={() => handleDeleteEvent(event.event_id)}>Delete</Button>
                            </TableCell>
                          )
                        }
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubProfile;
