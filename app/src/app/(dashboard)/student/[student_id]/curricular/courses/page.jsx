"use client"
import {React,useState} from 'react'
import { useUser } from '@/app/context/UserContext';
import MyCard from '@/components/MyCard';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
const semesters = [
  {title: "Semester 1"},
  {title: "Semester 2"},
  {title: "Semester 3"},
  {title: "Semester 4"},
  {title: "Semester 5"},
  {title: "Semester 6"},
  
]

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

const page = () => {
  const user = useUser();
  const params = useParams();
  const student_id = params.student_id;
  console.log(student_id);
  
  return (
    <div className='p-4'>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center gap-7 space-y-2 my-4'>

          <div className='mt-2'>
            <ArrowLeft />
          </div>

          <h2 className='text-4xl font-bold tracking-tight'>
            Course Plan for Semester {student_id}
          </h2>
        </div>

        <div className='flex justify-between items-center py-4'>
          <div className='flex gap-2'>
            {/* <MySelect data={semesters} /> */}
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-4'>
          {subjects.map((item,index) => (
            <div key={index} className='hover:' onClick={()=>{router.push('courses/subjects')}}>
              <MyCard key={index} data={item}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default page