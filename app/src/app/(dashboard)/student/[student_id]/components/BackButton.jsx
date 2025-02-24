import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
    const router = useRouter();
  return (
    <div className='mt-2 cursor-pointer' onClick={() => router.back()}>
        <ArrowLeft />
    </div>
  )
}

export default BackButton