import React from 'react'
import {Card, 
        CardHeader, 
        CardTitle, 
        CardContent, 
        CardFooter
} from '@/components/ui/card'
import { Button } from './ui/button'
const ClubCard = ({data}) => {
  console.log(data);
  
  return (
    <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-xl font-bold'>
            {data?.club_name}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className='text-2xl font-bold'>{data?.num}</div>
            <p className='text-xs text-muted-foreground'>
                {data?.club_category}
                {data?.img && 
                  <img src="/club_image.jpg" alt="club" className='' />
                } <br />
                next event : {data?.events_participated[0]?.event_name}
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

export default ClubCard