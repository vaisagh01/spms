"use client"

import { useEffect, useState } from 'react';
import {Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter
} from '@/components/ui/card'
import Notifications from '../components/Notifications';
import UpcomingEvents from '../components/UpcomingEvents';
import { useUser } from '@/app/context/UserContext';
import axios from 'axios';
import EventsPerMonth from '../components/EventsPerMonth';
import EventDates from '../components/EventDates';
import EventCalendar from '../components/EventCalender';
import AllClubs from '../components/AllClubs';
import { useParams } from 'next/navigation';

const Page = () => {
  const { user } = useUser();
  const [clubData, setClubData] = useState(null);
  const params = useParams();

  useEffect(() => {
    const studentId = params.student_id; // Get student_id from URL params
    // Fetch clubs and events the student is part of
    axios.get(`http://127.0.0.1:8000/api/student/${studentId}/clubs/`)
      .then(response => {
        setClubData(response.data.clubs);
      })
      .catch(error => console.error("Error fetching clubs data:", error));
  }, [params.student_id]);

  // const stats = [
  //   {
  //     title: "Number of Events",
  //     desc: clubData ? clubData.events?.length : "Loading...",
  //   },
  //   {
  //     title: "Number of Clubs",
  //     desc: "42", // Assuming this is a static value
  //   },
  //   {
  //     title: "Number of Achievements",
  //     desc: clubData ? clubData.events?.reduce((acc, event) => acc + event.participants.length, 0) : "Loading...",
  //   },
  // ];
  console.log(clubData);
  
  return (
    <div className='p-4'>
      <div className='flex flex-1 flex-col space-y-2 gap-1'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-4xl font-bold tracking-tight'>
            Hi, Welcome back {user?.name}!
          </h2>
        </div>

        <div className='grid gap-2 md:grid-cols-6 lg:grid-cols-6'>
          <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-xl font-bold'>
                      title
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className='text-2xl font-bold'>num</div>
                      
                  </CardContent>
                  
              </Card>
          <div className='col-span-3 p-4'>
            <h1 className='text-xl font-bold'>Your next event will be shown here</h1>
            {clubData && clubData.events.length > 0 ? (
              <span>
                Event Name: {clubData.events[0].event_name} - {clubData.events[0].event_date}
              </span>
            ) : (
              <span>Loading event data...</span>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-6'>
          <div className='col-span-4 md:col-span-3'>
            <EventsPerMonth />
          </div>
          <div className='col-span-4 md:col-span-3'>
            <AllClubs />
          </div>
          <div className='col-span-4 md:col-span-3'><Notifications /></div>
          <div className='col-span-4 md:col-span-3'><Notifications /></div>
        </div>
      </div>
    </div>
  );
};

export default Page;
