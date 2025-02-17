"use client"
import MyCard from '@/components/MyCard'
import Notifications from '../components/Notifications'
import UpcomingEvents from '../components/UpcomingEvents'
import { useUser } from '@/app/context/UserContext'
import axios from 'axios'
import EventsPerMonth from '../components/EventsPerMonth'
import EventDates from '../components/EventDates'
import EventCalendar from '../components/EventCalender'

const stats = [
  {
    title: "Number of Events",
    desc: "24",
  },
  {
    title: "Number of Clubs",
    desc: "42",
  },
  {
    title: "Number of Achievements",
    desc: "21",
  },
]

const page = () => {
  const {user} = useUser();
  const axios = require('axios');  // Only needed if you're using Node.js

  axios.get('http://127.0.0.1:8000/api/clubs/')
    .then(response => {
      console.log("Clubs Data:", response.data);  // This will log the clubs' JSON data
    })
    .catch(error => {
      console.error("Error fetching clubs:", error);
    });
  return (
    <div className='p-4'>
      <div className='flex flex-1 flex-col space-y-2 gap-1'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-4xl font-bold tracking-tight'>
            Hi, Welcome back {user.name}!
          </h2>
        </div>

        <div className='grid gap-2 md:grid-cols-6 lg:grid-cols-6'>

          {stats.map((item,index) => (
                <MyCard key={index} data={item}/>
          ))}
          
          <div className='col-span-3 p-4'>
            <h1 className='text-xl font-bold'>Your next event will be shown here</h1>
            <span>Event Name : XX/XX/XXXX</span>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-6'>
          <div className='col-span-4 md:col-span-3'>
            <EventsPerMonth />
          </div>
          <div className='col-span-4 md:col-span-3'>
            {/* sales arallel routes */}
            <EventCalendar />
          </div>
          
          <div className='col-span-4 md:col-span-3'>{<Notifications />}</div>
          <div className='col-span-4 md:col-span-3'>{<Notifications />}</div>
        </div>

      </div>
    </div>
  )
}

export default page