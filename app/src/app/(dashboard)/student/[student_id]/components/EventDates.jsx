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
import { ScrollArea } from "@/components/ui/scroll-area";

const Calendar = () => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const params = useParams();
  const API_BASE_URL = "http://localhost:8000/api";

  useEffect(() => {
    const id = params.student_id;
    if (!id) return;

    const fetchData = async () => {
      try {
        setCurrentEvents([]);
        
        const now = new Date();

        // Fetch assignments
        const assignmentsRes = await axios.get(`${API_BASE_URL}/assignments/student/${id}/`);
        const assignmentEvents = assignmentsRes.data.assignments
          .map((assignment) => ({
            title: `${assignment.title} (Assignment)`,
            type: "Assignment",
            due_date: assignment.due_date,
            max_marks: assignment.max_marks,
            subject_name: assignment.subject_name,
            start: new Date(assignment.due_date).toISOString(),
            allDay: true,
            color: "green",
          }))
          .filter((event) => new Date(event.start) >= now);

        // Fetch assessments
        const assessmentsRes = await axios.get(`${API_BASE_URL}/student/${id}/assignments-marks/`);
        const assessmentEvents = assessmentsRes.data.assessments
          .map((assessment) => ({
            title: `${assessment.assessment_type} (Assessment)`,
            type: "Assessment",
            due_date: assessment.date_conducted,
            max_marks: assessment.total_marks,
            subject_name: assessment.subject_name,
            start: new Date(assessment.date_conducted).toISOString(),
            allDay: true,
            color: "purple",
          }))
          .filter((event) => new Date(event.start) >= now);

        // Merge and sort events
        const sortedEvents = [...assignmentEvents, ...assessmentEvents].sort(
          (a, b) => new Date(a.start) - new Date(b.start)
        );

        setCurrentEvents(sortedEvents);
        setUpcomingEventsCount(sortedEvents.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [params.student_id]);

  const handleDateClick = (selected) => {
    const clickedDate = selected.startStr;
    setSelectedDate(clickedDate);
    const eventsForDate = currentEvents.filter((event) => event.start.startsWith(clickedDate));
    setSelectedEvents(eventsForDate);
    setIsDialogOpen(true);
  };

  return (
    <div>
      <Card className="p-5">
        <CardContent>
          <div className="flex flex-col md:flex-row w-full justify-start items-start gap-8">
            <ScrollArea className="h-[350px] rounded-md border p-4">
              <div className="w-full">
                <div className="py-2 text-md font-extrabold px-1">
                  Calendar Events <span className="text-sm text-gray-500">({upcomingEventsCount} upcoming)</span>
                </div>
                <ul className="space-y-4">
                  {currentEvents.length === 0 && (
                    <div className="italic text-center text-gray-400">No Upcoming Events</div>
                  )}
                  {currentEvents.map((event, index) => (
                    <li
                      key={index}
                      className={`cursor-pointer border border-gray-200 shadow p-2 rounded-md relative pl-3 ${
                        event.color === "green"
                          ? "border-l-4 border-green-500 text-green-800"
                          : "border-l-4 border-purple-400 text-purple-800"
                      }`}
                      onClick={() => setSelectedEvents([event]) || setIsDialogOpen(true)}
                    >
                      <div>
                        <p className="text-xs text-gray-600">Due: {event.due_date} </p>
                        <p className="font-xs text-gray-800">{event.title}</p>
                        <p className="text-xs text-gray-500">Type: {event.type}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
            <div className="w-full md:w-9/12">
              <FullCalendar
                height="360px"
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{ left: "", center: "title", right: "prev,next today" }}
                initialView="dayGridMonth"
                selectable
                select={handleDateClick}
                events={currentEvents}
              />
            </div>
          </div>
        </CardContent>
      </Card>
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
                <p className="text-sm text-gray-600">Max Marks: {event.max_marks}</p>
                <p className="text-sm text-gray-500">Type: {event.type}</p>
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
