"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventTable() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    axios
      .get("http://localhost:8000/extracurricular/events/")
      .then((response) => {
        setEvents(response.data.events);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card className="shadow-lg rounded-2xl p-4">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">All Events</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Club</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                </TableRow>
              ))
            ) : (
              events.map((event) => (
                <TableRow 
                  key={event.event_id} 
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => router.push(`${params.student_id}/extra-curricular/clubs/${event.club__club_id}/${event.event_id}`)}
                >
                  <TableCell>{event.event_name}</TableCell>
                  <TableCell>{event.description}</TableCell>
                  <TableCell>{new Date(event.event_date).toLocaleDateString()}</TableCell>
                  <TableCell>{event.club__club_name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
