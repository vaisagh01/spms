"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EventDates(){
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    // Load events from local storage when the component mounts
    if (typeof window !== "undefined") {
      const savedEvents = localStorage.getItem("events");
      if (savedEvents) {
        setCurrentEvents(JSON.parse(savedEvents));
      }
    }
  }, []);

  useEffect(() => {
    // Save events to local storage whenever they change
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(currentEvents));
    }
  }, [currentEvents]);

  const handleDateClick = () => {
    setSelectedDate(selectedDate);
    setIsDialogOpen(true);
  };

  const handleEventClick = () => {
    // Prompt user for confirmation before deleting an event
    if (
      window.confirm(
        `Are you sure you want to delete the event "${selected.event.title}"?`
      )
    ) {
      selected.event.remove();
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewEventTitle("");
  };

  const handleAddEvent = () => {
    e.preventDefault();
    if (newEventTitle && selectedDate) {
      const calendarApi = selectedDate.view.calendar; // Get the calendar API instance.
      calendarApi.unselect(); // Unselect the date range.

      const newEvent = {
        id: `${selectedDate.start.toISOString()}-${newEventTitle}`,
        title: newEventTitle,
        start: selectedDate.start,
        end: selectedDate.end,
        allDay: selectedDate.allDay,
      };

      calendarApi.addEvent(newEvent);
      handleCloseDialog();
    }
  };

  return (
    <Card>
      <CardHeader>
          <CardTitle>Event Schedules</CardTitle>
      </CardHeader>
      <CardContent >

      <div className="flex px-10 justify-start items-start gap-8">
        <div className="w-[900px]">
          <FullCalendar
            height={"340px"}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // Initialize calendar with required plugins.
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek",
            }} // Set header toolbar options.
            initialView="dayGridMonth" // Initial view mode of the calendar.
            editable={true} // Allow events to be edited.
            selectable={true} // Allow dates to be selectable.
            selectMirror={true} // Mirror selections visually.
            dayMaxEvents={true} // Limit the number of events displayed per day.
            select={handleDateClick} // Handle date selection to create new events.
            eventClick={handleEventClick} // Handle clicking on events (e.g., to delete them).
            eventsSet={(events) => setCurrentEvents(events)} // Update state with current events whenever they change.
            initialEvents={
              typeof window !== "undefined"
              ? JSON.parse(localStorage.getItem("events") || "[]")
                : []
              } // Initial events loaded from local storage.
              />
        </div>
      </div>

      {/* Dialog for adding new events */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event Details</DialogTitle>
          </DialogHeader>
          <form className="space-x-5 mb-4" onSubmit={handleAddEvent}>
            <input
              type="text"
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)} // Update new event title as the user types.
              required
              className="border border-gray-200 p-3 rounded-md text-lg"
              />
            <button
              className="bg-green-500 text-white p-3 mt-5 rounded-md"
              type="submit"
              >
              Add
            </button>{" "}
            {/* Button to submit new event */}
          </form>
        </DialogContent>
      </Dialog>
              </CardContent>
    </Card>
  );
};

