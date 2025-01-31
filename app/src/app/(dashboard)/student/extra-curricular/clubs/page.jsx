"use client"
import MyCard from '@/components/MyCard'
import Notifications from '../../components/Notifications'
import UpcomingEvents from '../../components/UpcomingEvents'
import { useUser } from '@/app/context/UserContext'
import axios from 'axios'
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
      <div className='flex flex-1 flex-col space-y-2'>

        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-4xl font-bold tracking-tight'>
            Hi, Welcome back {user.name}!
          </h2>
        </div>

        <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-4'>
          <MyCard />
          <MyCard />
          <MyCard />
          <MyCard />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'><UpcomingEvents /></div>
          <div className='col-span-4 md:col-span-3'>
            {/* sales arallel routes */}
            {<Notifications />}
          </div>
          <div className='col-span-4'>{<Notifications />}</div>
          <div className='col-span-4 md:col-span-3'>{<Notifications />}</div>
        </div>

      </div>
    </div>
  )
}

export default page