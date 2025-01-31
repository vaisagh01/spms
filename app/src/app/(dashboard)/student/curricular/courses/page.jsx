"use client"
import React from 'react'
import { useUser } from '@/app/context/UserContext';
const page = () => {
  const user = useUser();
  return (
    <div>courses</div>
  )
}

export default page