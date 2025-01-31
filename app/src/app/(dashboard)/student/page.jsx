"use client"
import MyCard from '@/components/MyCard'
import React from 'react'
import { useUser } from "@/app/context/UserContext";
import Notifications from './components/Notifications'
const page = () => {
  const {user} = useUser()
  return (
    <div className='bg-slate-100 h-auto p-4 flex flex-col gap-4'>
      <div>
        <span className='text-5xl'>Welcome {user.name} f!</span>
      </div>  

      <div className="flex gap-4">
        <section className="flex flex-1 gap-4 p-4 bg-slate-300">
          <div className='flex flex-1 flex-wrap gap-4'>
            <MyCard />
            <MyCard />
          </div>
        </section>
        <section className="flex w-auto bg-slate-300 p-4">
          <Notifications />
        </section>
      </div>
    </div>
  )
}

export default page