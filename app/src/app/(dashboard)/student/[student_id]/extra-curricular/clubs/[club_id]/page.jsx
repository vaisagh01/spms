"use client"
import { useParams } from 'next/navigation'
import React from 'react'

const page = () => {
  const params = useParams(); // Extract club ID from the URL
  const club_id = params.club_id
  return (
    <div>
      <h1>Club Details Page</h1>
      <p>Club Name: {club_id}</p>
    </div>
  )
}

export default page