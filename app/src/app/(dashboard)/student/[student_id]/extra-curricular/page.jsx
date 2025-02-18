"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import Notifications from "../components/Notifications";
import { useUser } from "@/app/context/UserContext";
import axios from "axios";
import EventsPerMonth from "../components/EventsPerMonth";
import AllClubs from "../components/AllClubs";
import { useParams } from "next/navigation";

const Page = () => {
  const { user } = useUser();
  const [clubData, setClubData] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  const [totalEventsParticipated, setTotalEventsParticipated] = useState(0);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const params = useParams();

  useEffect(() => {
    if (true) {
      const studentId = params.student_id; // Get student_id from URL params
      axios
        .get(`http://127.0.0.1:8000/api/student/${studentId}/clubs/`)
        .then((response) => {
          const clubs = response.data.clubs || [];
          setClubData(clubs);

          // Extract all events from the clubs and sort them by date
          const allEvents = clubs
            .flatMap((club) => club.events_participated || [])
            .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

          // Set the next event (if available)
          setNextEvent(allEvents.length > 0 ? allEvents[0] : null);

          // Calculate total number of events participated
          const totalEvents = clubs.reduce(
            (sum, club) => sum + (club.events_participated?.length || 0),
            0
          );
          setTotalEventsParticipated(totalEvents);

          // Calculate total number of achievements
          const totalAch = allEvents.filter(event => event.achievement).length;
          setTotalAchievements(totalAch);
        })
        .catch((error) => console.error("Error fetching clubs data:", error));
    }
  }, [params.student_id]);
  console.log(clubData);
  
  return (
    <div className="p-4">
      <div className="flex flex-1 flex-col space-y-2 gap-1">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-4xl font-bold tracking-tight">
            Hi, Welcome back {user?.name}!
          </h2>
        </div>

        <div className="grid gap-2 md:grid-cols-6 lg:grid-cols-6">
          {/* Card for Number of Clubs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md text-slate-500">Number of Clubs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clubData.length}</div>
            </CardContent>
          </Card>

          {/* Card for Total Events Participated */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md text-slate-500">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEventsParticipated}</div>
            </CardContent>
          </Card>

          {/* Card for Total Achievements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md text-slate-500">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAchievements}</div>
            </CardContent>
          </Card>

          <div className="col-span-3 p-4">
            <h1 className="text-xl font-bold">Your next event</h1>
            {nextEvent ? (
              <span>
                Event Name: {nextEvent.event_name} -{" "}
                {new Date(nextEvent.event_date).toLocaleDateString()}
              </span>
            ) : (
              <span>No upcoming events</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-6">
          <div className="col-span-4 md:col-span-3">
            <EventsPerMonth />
          </div>
          <div className="col-span-4 md:col-span-3">
            <AllClubs />
          </div>
          <div className="col-span-4 md:col-span-3">
            <Notifications />
          </div>
          <div className="col-span-4 md:col-span-3">
            <Notifications />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
