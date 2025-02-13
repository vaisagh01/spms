"use client"
import React from 'react'
import { useUser } from '@/app/context/UserContext';
import MyCard from '@/components/MyCard';
import MySelect from '@/components/MySelect';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MyAssignments from '@/components/MyAssignments';
const subjects = [
  {
    title: "Subject 1",
    img: "club_image.jpg",
    desc: "SC2",
    button: true
  },
  
  {
    title: "Subject 2",
    img: "club_image.jpg",
    desc: "SC2",
    button: true
  },
  {
    title: "Subject 3",
    img: "club_image.jpg",
    desc: "SC3",
    button: true
  },
  {
    title: "Subject 4",
    img: "club_image.jpg",
    desc: "SC4",
    button: true
  },
  {
    title: "Subject 5",
    img: "club_image.jpg",
    desc: "SC5",
    button: true
  },
  {
    title: "Subject 6",
    img: "club_image.jpg",
    desc: "SC6",
    button: true
  },

]

const Assignments = [
  {
    title : "Assignments title",
    desc : "AsAssignments descriptionAssignments descriptionsignments descriptionAssignments descriptionAssignments description",
    due_date: "12/2/2004",
    time: "12:59PM"
  },
  
  {
    title : "Assignments title",
    desc : "Assignments description",
    due_date: "12/2/2004",
    time: "12:59PM"
  },
  {
    title : "Assignments title",
    desc : "Assignments description",
    due_date: "12/2/2004",
    time: "12:59PM"
  },
  {
    title : "Assignments title",
    desc : "Assignments description",
    due_date: "12/2/2004",
    time: "12:59PM"
  },
]

const page = () => {
  const user = useUser();
  return (
    <div className='p-4'>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center gap-7 space-y-2 my-4'>

          <div className='mt-2'>
            <ArrowLeft />
          </div>

          <h2 className='text-4xl font-bold tracking-tight'>
            Assignments
          </h2>
        </div>

        <div className='flex justify-between items-center py-4'>
          <div className='flex gap-2'>
            {/* <MySelect data={semesters} /> */}
          </div>
        </div>

        <div className='grid mx-[3%] gap-4 md:grid-cols-1 lg:grid-cols-1'>
          {Assignments.map((item,index) => (
            <Link key={index} href="#">
              <MyAssignments data={item}/>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default page