import React from 'react'
import {Card, 
        CardHeader, 
        CardTitle, 
        CardContent, 
        CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
const MySubjectCard = ({data}) => {
  return (
    <Card className="hover:bg-slate-50">
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-xl font-bold flex justify-between w-full'>
              <p>{data?.subject_name}</p>
              <p className='text-slate-500'>{data?.subject_code}</p>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className='text-2xl font-bold'>{data?.num}</div>
            <p className='text-xs text-muted-foreground'>
                {data?.teacher_name}
                {data?.img && 
                  <img src="/club_image.jpg" alt="club" className='' />
                }
            </p>
        </CardContent>
        {
          data?.button && 
            <CardFooter className="w-full">
              <Button className="w-full">View Assignments</Button>
            </CardFooter>
        }
    </Card>
  )
}

export default MySubjectCard