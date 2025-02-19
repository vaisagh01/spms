"use client";

import React, { useEffect, useState } from 'react';
import MyCard from '@/components/MyCard';
import { useUser } from '@/app/context/UserContext';
import Link from 'next/link';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import ClubCard from '@/components/ClubCard';

const ClubsPage = () => {
  const { user } = useUser(); // Get user context (student_id)
  const [clubs, setClubs] = useState([]); // State to store the clubs the student is part of
  const [loading, setLoading] = useState(true); // State for loading
  const [error, setError] = useState(null); // State for error
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    const id = params.student_id; // Get student_id from URL params
    // Fetch the clubs data based on student_id
    axios.get(`http://127.0.0.1:8000/extracurricular/student/${id}/clubs/`)
      .then(response => {
        setClubs(response.data.clubs); // Assuming the response returns { clubs: [club_data] }
        setLoading(false);
      })
      .catch(error => {
        setError("Failed to fetch clubs");
        setLoading(false);
      });
  }, [user]);
  console.log(clubs);
  
  if (loading) {
    return <div>Loading clubs...</div>; // Display loading state
  }

  if (error) {
    return <div>{error}</div>; // Display error if fetching fails
  }
  console.log(clubs);
  
  return (
    <div className='p-4'>
      <div className='flex flex-1 flex-col space-y-2'>
        
        <div className='flex items-center justify-between space-y-2 my-4'>
          <h2 className='text-4xl font-bold tracking-tight'>
            Manage your clubs here...!
          </h2>
        </div>

        <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-4'>
          {clubs.length === 0 ? (
            <div>No clubs found for this student.</div> // Display message if no clubs are found
          ) : (
            clubs.map((item, index) => (
              <Link key={index} href={`clubs/${item.club_id}`}>
                <ClubCard data={item} />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ClubsPage;
