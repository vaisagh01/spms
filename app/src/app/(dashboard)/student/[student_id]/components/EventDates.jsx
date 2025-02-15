"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

const Calendar = () => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const params = useParams();
  const API_BASE_URL = "http://localhost:8000/api"; // Update with actual API URL

  useEffect(() => {
    const id = params.student_id;
    if (!id) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/assignments/student/${id}/`);
        const today = new Date();

        const assignmentEvents = response.data.assignments
          .filter(assignment => new Date(assignment.due_date) >= today)
          .map((assignment) => ({
            id: assignment.assignment_id,
            title: assignment.title,
            description: assignment.description,
            due_date: assignment.due_date,
            due_time: assignment.due_time,
            max_marks: assignment.max_marks,
            subject_name: assignment.subject_name,
            is_completed: assignment.is_completed,
            submission_date: assignment.submission_date,
            marks_obtained: assignment.marks_obtained,
            feedback: assignment.feedback,
            start: new Date(assignment.due_date).toISOString(),
            allDay: true,
            color: "green", // Assignment events in green
          }));
        
        setCurrentEvents(assignmentEvents);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchData();
  }, [params.student_id]);
  
  // Handle clicking an event in the calendar
  const handleDateClick = (selected) => {
    const clickedDate = selected.startStr;
    setSelectedDate(clickedDate);
    const eventsForDate = currentEvents.filter(event => event.start.startsWith(clickedDate));
    setSelectedEvents(eventsForDate);
    setIsDialogOpen(true);
  };

  // Handle clicking an event from the events list
  const handleEventClickFromList = (event) => {
    setSelectedDate(event.due_date);
    setSelectedEvents([event]); // Set only the clicked event
    setIsDialogOpen(true);
  };

  return (
    <div className="">
      <Card className="p-5">
        <CardContent>
          <div className="flex flex-col md:flex-row w-full justify-start items-start gap-8">
            {/* Events List */}
            <div className="w-full md:w-3/12">
              <div className="py-2 text-md font-extrabold px-1">Calendar Events</div>
              <ul className="space-y-4">
                {currentEvents.length === 0 && (
                  <div className="italic text-center text-gray-400">No Events Present</div>
                )}
                {currentEvents.map((event) => (
                  <li
                    key={event.id}
                    className={`cursor-pointer border border-gray-200 shadow p-2 rounded-md ${
                      event.color === "green" ? "text-green-800" : "text-blue-800"
                    }`}
                    onClick={() => handleEventClickFromList(event)}
                  >
                    <div>
                      <p className="text-xs text-gray-600">Due: {event.due_date}</p>
                      <p className="font-medium text-gray-800">{event.title}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Calendar */}
            <div className="w-full md:w-9/12">
              <FullCalendar
                height="360px"
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                  left: "",
                  center: "title",
                  right: "prev,next today",
                }}
                initialView="dayGridMonth"
                selectable
                select={handleDateClick}
                events={currentEvents}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog for Event Details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event, index) => (
              <div key={index} className="p-2 border-b border-gray-200">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-gray-600">Subject: {event.subject_name}</p>
                <p className="text-sm text-gray-600">Due Date: {event.due_date}</p>
                {event.due_time && <p className="text-sm text-gray-600">Due Time: {event.due_time}</p>}
                <p className="text-sm text-gray-600">Max Marks: {event.max_marks}</p>
                {event.is_completed && <p className="text-sm text-green-600">Completed</p>}
                {event.submission_date && <p className="text-sm text-gray-600">Submitted on: {event.submission_date}</p>}
                {event.marks_obtained !== null && <p className="text-sm text-gray-600">Marks: {event.marks_obtained}/{event.max_marks}</p>}
                {event.feedback && <p className="text-sm text-gray-600">Feedback: {event.feedback}</p>}
              </div>
            ))
          ) : (
            <p className="text-gray-400">No events on this day</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
