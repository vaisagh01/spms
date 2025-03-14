"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const AlumniEventCreate = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    event_type: "Meetup",
    teacher_id: "", // HOD ID required
  });
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.teacher_id) {
      toast({ title: "Error", description: "Teacher ID is required.", variant: "destructive" });
      return;
    }

    const response = await fetch("http://localhost:8000/alumni/events/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (response.ok) {
      toast({ title: "Success", description: "Event created successfully!" });
      setOpen(false);
      setForm({ title: "", description: "", date: "", event_type: "Meetup", teacher_id: "" });
    } else {
      toast({ title: "Error", description: data.error || "Failed to create event.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create Alumni Event</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Alumni Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Teacher ID (HOD Only)" value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} required />
            <Input placeholder="Event Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <Select onValueChange={(value) => setForm({ ...form, event_type: value })}>
              <SelectTrigger>
                <SelectValue>{form.event_type}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Meetup">Meetup</SelectItem>
                <SelectItem value="Convocation">Convocation</SelectItem>
                <SelectItem value="Talk">Talk</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlumniEventCreate;
