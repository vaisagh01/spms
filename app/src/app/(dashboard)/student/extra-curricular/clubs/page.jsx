"use client"
import MyCard from '@/components/MyCard'
import Notifications from '../../components/Notifications'
import UpcomingEvents from '../../components/UpcomingEvents'
import { useUser } from '@/app/context/UserContext'
import axios from 'axios'
const clubs = [
  {
    title: "Club 1",
    img: "club_image.jpg",
    desc: "SC2",
    // button: true
  },
  
  {
    title: "Club 2",
    img: "club_image.jpg",
    desc: "SC2",
    // button: true
  },
  {
    title: "Club 3",
    img: "club_image.jpg",
    desc: "SC3",
    // button: true
  },
  {
    title: "Club 4",
    img: "club_image.jpg",
    desc: "SC4",
    // button: true
  },
  {
    title: "Club 5",
    img: "club_image.jpg",
    desc: "SC5",
    // button: true
  },
  {
    title: "Club 6",
    img: "club_image.jpg",
    desc: "SC6",
    // button: true
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
      <div className='flex flex-1 flex-col space-y-2'>
        
        <div className='flex items-center justify-between space-y-2 my-4'>
          <h2 className='text-4xl font-bold tracking-tight'>
            Manage your clubs here...!
          </h2>
        </div>

        <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-4'>
          {clubs.map((item,index) => (
            <MyCard key={index} data={item}/>
          ))}
        </div>
      </div>
    </div>
  )
}

export default page