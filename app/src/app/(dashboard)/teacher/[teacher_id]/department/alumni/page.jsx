"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { PenBoxIcon, Trash2Icon } from "lucide-react";

const AlumniPage = () => {
  const [alumni, setAlumni] = useState([]);
  const [events, setEvents] = useState([]);
  const toast = useToast();
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    event_type: "Meetup",
    teacher_id: "",
    department_id: "",
  });
  const [editEvent, setEditEvent] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/alumni/alumni/")
      .then((res) => res.json())
      .then((data) => setAlumni(data));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/alumni/events/")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!newEvent.teacher_id || !newEvent.department_id) {
      toast.error("Please enter Teacher ID and Department ID.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/alumni/alumni-events/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast(`Error: ${errorData.error || "Failed to create event"}`);
        return;
      }

      const createdEvent = await response.json();
      setEvents([...events, createdEvent]);
      setOpenDialog(false);
      toast.success("Event created successfully!");
      setNewEvent({
        title: "",
        description: "",
        date: "",
        event_type: "Meetup",
        teacher_id: "",
        department_id: "",
      });
    } catch (error) {
      toast.error("An error occurred while creating the event.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/alumni/alumni-events/update/${editEvent.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editEvent),
      });

      if (!response.ok) {
        toast("Failed to update event");
        return;
      }

      setEvents(events.map(event => event.id === editEvent.id ? editEvent : event));
      setOpenEditDialog(false);
      toast.success("Event updated successfully!");
    } catch (error) {
      toast.error("Error updating event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`http://localhost:8000/alumni/alumni-events/delete/${id}/`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete event");
      setEvents(events.filter(event => event.id !== id));
      toast("Event deleted successfully!");
    } catch (error) {
      toast("Error deleting event");
    }
  };

  const filteredAlumni = alumni.filter((alumnus) =>
    `${alumnus.first_name} ${alumnus.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Alumni & Events</h1>

      <Input
        placeholder="Search Alumni..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <ScrollArea className="w-full max-h-96">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Graduation Year</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlumni.map((alumnus) => (
              <TableRow key={alumnus.alumni_id}>
                <TableCell>{alumnus.first_name} {alumnus.last_name}</TableCell>
                <TableCell>{alumnus.email}</TableCell>
                <TableCell>{alumnus.graduation_year}</TableCell>
                <TableCell>{alumnus.phone_number}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="flex gap-8 items-center">
        <h2 className="text-xl font-semibold mt-6">Alumni Events</h2>
        <div className="mt-6">
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>Create Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Alumni Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Teacher ID"
                  value={newEvent.teacher_id}
                  onChange={(e) => setNewEvent({ ...newEvent, teacher_id: e.target.value })}
                  required
                />
                <Input
                  placeholder="Department ID"
                  value={newEvent.department_id}
                  onChange={(e) => setNewEvent({ ...newEvent, department_id: e.target.value })}
                  required
                />
                <Input
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  required
                />
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
                <Select
                  value={newEvent.event_type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Meetup">Meetup</SelectItem>
                    <SelectItem value="Convocation">Convocation</SelectItem>
                    <SelectItem value="Talk">Talk</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="w-full max-h-96">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event, index) => (
              <TableRow key={index}>
                <TableCell>{event.title}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>{event.date}</TableCell>
                <TableCell>{event.event_type}</TableCell>
                <TableCell className="flex gap-4">
                  <Button onClick={() => { setEditEvent(event); setOpenEditDialog(true); }}><PenBoxIcon /></Button>
                  <Button onClick={() => handleDelete(event.id)} variant="destructive"><Trash2Icon /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <Dialog open={openEditDialog} onOpenChange={(open) => {
        setOpenEditDialog(open);
        if (!open) setEditEvent(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Alumni Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input placeholder="Event Title" value={editEvent?.title} onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })} required />
            <Textarea placeholder="Description" value={editEvent?.description} onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })} required />
            <Input type="date" value={editEvent?.date} onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })} required />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlumniPage;