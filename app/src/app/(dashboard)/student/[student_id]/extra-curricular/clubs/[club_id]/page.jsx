"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import { useParams } from "next/navigation";
import { Dialog, DialogTrigger,DialogHeader, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useRouter } from "next/navigation";

const ClubProfile = () => {
  const [club, setClub] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [newMember, setNewMember] = useState({ username: "", role: "Member" });
  const [newEvent, setNewEvent] = useState({ event_name: "", event_date: "" });
  const [newParticipant, setNewParticipant] = useState({ club_member: "", role_in_event: "", achievement: "" });
  const [clubMembers, setClubMembers] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [deleteMemberId, setDeleteMemberId] = useState(null);
  
  const params = useParams();
  const router = useRouter();
  useEffect(() => {
    const club_id = params.club_id;
    const student_id = params.student_id;
    
    // Fetch the club profile from the API
    axios
    .get(`http://localhost:8000/extracurricular/clubs/${club_id}/profile/`)
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
  // console.log(club);

  const handleAddMember = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/extracurricular/add_member/${params.club_id}/`, {
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
    if (member_id === club.leader_id) {
        alert("You cannot remove the club leader!");
        return;
    }

    try {
        await axios.delete(`http://localhost:8000/extracurricular/clubs/${params.club_id}/delete_member/`, {
            data: { member_id },
            headers: { "Content-Type": "application/json" }
        });

        setClub((prevClub) => ({
            ...prevClub,
            members: prevClub.members.filter(member => member.member_id !== member_id)
        }));
    } catch (error) {
        console.error("Error deleting member:", error.response ? error.response.data : error);
    }
};
    const handleDeleteEvent = async (event_id) => {
      try {
        await axios.delete(`http://localhost:8000/extracurricular/clubs/${params.club_id}/delete_event/`, { 
          data: { event_id: event_id } 
        });
        setClub((prevClub) => ({
          ...prevClub,
          events: prevClub.events.filter(event => event.event_id !== event_id)
        }));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    };
    // console.log(club);
    
  const handleAddEvent = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/extracurricular/add_event/${params.club_id}/`, {
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
  const handleAddParticipant = async (event_id,club_member_id) => {
    try {
      await axios.post(`http://localhost:8000/extracurricular/event/add_participant/`, {
        club_member: club_member_id,
        role_in_event: newParticipant.role_in_event,
        achievement: newParticipant.achievement,
        event_id: event_id
      });

      setClub((prevClub) => ({
        ...prevClub,
        events: prevClub.events.map(event => 
          event.event_id === selectedEventId 
            ? { ...event, participants: [...event.participants, newParticipant] } 
            : event
        )
      }));

      setNewParticipant({ club_member_id: "", role_in_event: "", achievement: "" });
    } catch (error) {
      console.error("Error adding participant:", error);
    }
  };
  if (!club) return <div>Loading...</div>;
  const confirmDeleteMember = async () => {
    try {
      await axios.delete(`http://localhost:8000/extracurricular/clubs/${params.club_id}/delete_member/`, {
        data: { member_id: deleteMemberId },
      });
      setClub((prevClub) => ({
        ...prevClub,
        members: prevClub.members.filter(member => member.member_id !== deleteMemberId),
      }));
      toast.success("Member deleted successfully");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to delete member");
    }
    setDeleteMemberId(null);
  };
  // console.log(club);
  

  
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={club.club_logo} alt={club.club_name} />
              <AvatarFallback>{club.club_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-4xl font-bold">{club.club_name}</CardTitle>
              <CardDescription className="text-sm">{club.club_category}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-500">{club.description || "No description available"}</p>
          <p className="mt-4 text-md">Faculty In Charge: {club?.faculty_incharge || "N/A"}</p>
          <p className="text-md">Leader: {club.leader || "N/A"}</p>
          <div className="w-full h-[1px] bg-slate-200 mt-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Members Table */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Members</h3>
                {isLeader && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="color" className="mt-4 bg-indigo-700 text-white">Add Member</Button>
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
                          {member.role_in_club==="Member" ?<Button variant="destructive" onClick={() => handleDeleteMember(member.member_id)}>Delete</Button> : null }
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
                      <TableRow key={index} onClick={()=>router.push(`${params.club_id}/${event.event_id}`)}>
                        <TableCell>{event.event_name}</TableCell>
                        <TableCell>{event.event_date}</TableCell>
                        {
                          isLeader && (
                            <TableCell>
                              {event.participants?.map((item, idx) => (
                                <div key={idx}>{item.name}</div>
                              ))}
                          <Dialog>
                            <DialogTrigger>View/Add Participants</DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Participants of {event.event_name}</DialogTitle>
                              </DialogHeader>
                              {isLeader && (
                                <>
                                  <Label htmlFor="club_member_id">Select Club Member</Label>
                                  <Select defaultValue="Selecta member" onValueChange={(value) => setNewParticipant({ ...newParticipant, event_id:event.event_id, club_member: value })}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {club.members.map((member,index)=> (
                                        <SelectItem key={index} value={member.member_id}>
                                          {member.name}
                                        </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Label htmlFor="role_in_event">Role</Label>
                                      <Input
                                        id="role_in_event"
                                        value={newParticipant.role_in_event}
                                        onChange={(e) => setNewParticipant({ ...newParticipant, role_in_event: e.target.value })}
                                      />
                                      <Label htmlFor="achievement">Achievement</Label>
                                      <Input
                                        id="achievement"
                                        value={newParticipant.achievement}
                                        onChange={(e) => setNewParticipant({ ...newParticipant, achievement: e.target.value })}
                                      />
                                      <Button onClick={() => { setSelectedEventId(event.event_id); handleAddParticipant(); }}>Add Participant</Button>
                                    </>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                                      )
                                    }
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
const columns = [
  {
    accessorKey: "event_name", // The event name
    header: "Event Name", // Column header
    cell: (info) => info.getValue(), // Display event name
  },
  {
    accessorKey: "club_name", // The club name
    header: "Club", // Column header
    cell: (info) => info.getValue(), // Display club name
  },
  {
    accessorKey: "role_in_event", // The role of the student in the event (e.g. Speaker, Volunteer)
    header: "Role", // Column header
    cell: (info) => info.getValue(), // Display role
  },
  {
    accessorKey: "achievement", // The role of the student in the event (e.g. Speaker, Volunteer)
    header: "Achievement", // Column header
    cell: (info) => info.getValue(), // Display role
  },
  {
    accessorKey: "event_date", // The date of the event
    header: "Date", // Column header
    cell: (info) => new Date(info.getValue()).toLocaleDateString(), // Format the date
  },
]
