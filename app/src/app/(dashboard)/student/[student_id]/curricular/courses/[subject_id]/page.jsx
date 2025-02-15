"use client"
import React, { useState,useEffect } from 'react'
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import axios from 'axios';
import MyAccordian from '@/components/MyAccordian';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const params = useParams();
    const searchParams = useSearchParams();
    const subjectName = searchParams.get('subject'); 
  
    useEffect(() => {
      const id = params.subject_id;
      console.log(id);
      
      if (!id) {
        setError("No student ID provided");
        setLoading(false);
        return;
      }
  
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/topics/subject/${id}/`);
          setData(response.data.topics);
        } catch (error) {
          console.error("Error fetching data:", error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
  
      return () => {
      };
    }, [params.student_id]); // Re-run effect when params.student_id changes
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    if (error) {
      return <div>Error: {error}</div>;
    }
    console.log(data);
    
  return (
    <div className='p-4 ml-8'>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2 my-4'>
          <h2 className='text-4xl flex font-bold tracking-tight'>
            <ArrowLeft className='mt-2 mr-9'/>Topics under {subjectName}
          </h2>
          <Link href={"/assignments"}>
            <Button>View Assignments</Button>
          </Link>
        </div>
        <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-3'>
            <div className='col-span-2'>
                {data.map((item, index) => (
                    <MyAccordian key={index} data={item} />
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}

export default page