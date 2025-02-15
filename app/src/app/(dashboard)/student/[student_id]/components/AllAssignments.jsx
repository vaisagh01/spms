import React from 'react'
import {Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const pendingAssignments = [
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
  {
    title : "Assignments title",
    desc : "Assignments description",
    due_date: "12/2/2004",
    time: "12:59PM"
  },
]
const AllAssignments = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between ">Assignments<Button>View Assignments</Button></CardTitle>
        <CardDescription>You have 5 pending assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-9'>
          {
            pendingAssignments.map((item,index) => (
              <div key={index} className='flex items-center border-b-[1px] py-1 border-slate-200'>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm font-medium leading-none'>{item.title}</p>
                  <p className='text-sm text-muted-foreground'>
                    {item.desc}
                  </p>
                </div>
                <div className='ml-auto font-medium'>{item?.due_date}</div>
              </div>
            ))
          }
        </div>
      </CardContent>
    </Card>
  )
}

export default AllAssignments