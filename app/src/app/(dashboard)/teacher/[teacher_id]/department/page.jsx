'use client'
import React from 'react'
import AlumniEvents from './AlumniEvents'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
const page = () => {
  const router = useRouter();
  return (
    <div>
        {/* <div>Alumni events</div> */}
        <Button onClick={()=>router.push('department/alumni/')}>Manage Alumni Activites</Button>
    </div>
  )
}

export default page