"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ChatComponent from "./ChatEvent";

const Page = () => {
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [isLeader, setIsLeader] = useState();
  const [newParticipant, setNewParticipant] = useState({ club_member_id: "", role_in_event: "", achievement: "" });
  const [clubMembers, setClubMembers] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/extracurricular/clubs/${params.club_id}/profile/`)
      .then((response) => {
        const clubData = response.data.club_profile;
        if (clubData.leader_id === parseInt(params.student_id)) {
          setIsLeader(true);
        }
        const matchedEvent = clubData.events.find((e) => e.event_id === parseInt(params.event_id));
        setEvent(matchedEvent);
        setClubMembers(clubData.members);
      })
      .catch((error) => console.error("Error fetching club data:", error));
  }, [params.club_id, params.event_id]);

  const handleAddParticipant = async () => {
    try {
      await axios.post("http://localhost:8000/extracurricular/event/add_participant/", {
        club_member_id: newParticipant.club_member_id,
        role_in_event: newParticipant.role_in_event,
        achievement: newParticipant.achievement,
        event_id: params.event_id,
      });

      const addedParticipant = clubMembers.find((member) => member.member_id === parseInt(newParticipant.club_member_id));
      setEvent((prevEvent) => ({
        ...prevEvent,
        participants: [...prevEvent.participants, { ...addedParticipant, ...newParticipant }],
      }));

      setNewParticipant({ club_member_id: "", role_in_event: "", achievement: "" });
    } catch (error) {
      console.error("Error adding participant:", error);
    }
  };

  if (!event) return <p className="text-center text-gray-600">Loading event data...</p>;

  return (
    <div className="p-6">
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{event.event_name}</CardTitle>
          <p className="text-gray-500">📅 Date: {event.event_date}</p>
          <p className="mt-2">{event.description}</p>
        </CardHeader>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chat Section */}
          <div className="border rounded-xl p-4 shadow-sm bg-white">
            <ChatComponent isLeader={isLeader} clubId={params.club_id} eventId={params.event_id} userId={params.student_id} />
          </div>

          {/* Participants Section */}
          <div className="border rounded-xl p-4 shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-4">Participants</h3>
            {event.participants.length === 0 ? (
              <p className="text-gray-500">No participants yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Achievement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.participants.map((participant, index) => (
                    <TableRow key={index}>
                      <TableCell>{participant.participant_name}</TableCell>
                      <TableCell>{participant.role_in_event}</TableCell>
                      <TableCell>{participant.achievement}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {
              isLeader && (

            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700">Add Participant</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Add Participant</DialogTitle>

                <div className="space-y-3">
                  <Label htmlFor="club_member_id">Select Club Member</Label>
                  <select
                    id="club_member_id"
                    className="p-2 border rounded w-full"
                    value={newParticipant.club_member_id}
                    onChange={(e) => setNewParticipant({ ...newParticipant, club_member_id: e.target.value })}
                    >
                    <option value="">Select a Member</option>
                    {clubMembers.map((member, index) => (
                      <option key={index} value={member.member_id}>
                        {member.name}
                      </option>
                    ))}
                  </select>

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

                  <Button className="w-full bg-green-600 text-white hover:bg-green-700" onClick={handleAddParticipant}>
                    Submit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
                  )
                }
                {/* Add Participant Dialog */}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Page;
