"use client"
import React from 'react'
import { Button } from '@/components/ui/button';
import { useUser } from '@/app/context/UserContext';
import Link from 'next/link';
import MyAccordian from '@/components/MyAccordian';
import { ArrowLeft } from 'lucide-react';

const topics = [
    {
        title:"Unit Title Example 1",
        hours : 45,
        desc:"Teacher 1",
        chapters:[
            {
                title:"chapter 1",
            },
            {
                title:"chapter 1",
            },
            {
                title:"chapter 1",
            },
        ]
    },
    
    {
        title:"Unit Title Example 2",
        hours : 45,
        desc:"Teacher 1",
        chapters:[
            {
                title:"chapter 1",
            },
            {
                title:"chapter 1",
            },
            {
                title:"chapter 1",
            },
        ]
    },
    {
        title:"Unit Title Example 3",
        hours : 45,
        desc:"Teacher 1",
        chapters:[
            {
                title:"chapter 1",
            },
            {
                title:"chapter 1",
            },
            {
                title:"chapter 1",
            },
        ]
    },
    {
        title:"Unit Title Example 4",
        hours : 45,
        desc:"Teacher 1",
        chapters:[
            {
                title:"chapter 1",
            },
            {
                title:"chapter 1",
            },
            {
                title:"chapter 1",
            },
        ]
    },

]
const page = () => {
  const user = useUser();
  return (
    <div className='p-4 ml-8'>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2 my-4'>
          <h2 className='text-4xl flex font-bold tracking-tight'>
            <ArrowLeft className='mt-2 mr-9'/>Topics under subject
          </h2>
          <Link href={"/assignments"}>
            <Button>View Assignments</Button>
          </Link>
        </div>
        <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-3'>
            <div className='col-span-2'>
                <MyAccordian data={topics} />
            </div>
        </div>
      </div>
    </div>
  )
}

export default page