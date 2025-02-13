import React from 'react'
import {Card, 
        CardHeader, 
        CardTitle, 
        CardContent, 
        CardFooter
} from '@/components/ui/card'
import { Button } from './ui/button'
const MyCard = ({data}) => {
  return (
    <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-xl font-bold'>
            {data?.title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className='text-2xl font-bold'>{data?.num}</div>
            <p className='text-xs text-muted-foreground'>
                {data?.desc}
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

export default MyCard