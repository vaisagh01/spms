"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";

const Page = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const searchParams = useSearchParams();
  const subjectName = searchParams.get("subject");

  useEffect(() => {
    const id = params.subject_id;

    if (!id) {
      setError("No subject ID provided");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/curricular/topics/subject/${id}/`
        );
        setData(response.data.topics);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.subject_id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4 ml-8">
      <div className="flex flex-1 flex-col space-y-2">
        <div className="flex items-center justify-between space-y-2 my-4">
          <h2 className="text-4xl flex font-bold tracking-tight">
            <ArrowLeft className="mt-2 mr-4" /> Topics under {subjectName}
          </h2>
          <Link href="/assignments">
            <Button>View Assignments</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {data.map((item, index) => (
            <Card key={index} className="flex flex-row items-center justify-between p-4 shadow-md">
              <CardContent className="flex flex-col space-y-2 w-full">
                <h3 className="text-lg font-bold">{item.topic_name}</h3>
                <p className="text-sm text-gray-600">
                  {item.description || "No description provided"}
                </p>
                <p className="text-sm text-gray-500">
                  Completion Time: {item.completion_time || "N/A"}
                </p>
              </CardContent>
              <div className="text-4xl">
                {item.is_completed ? (
                  <CheckCircle className="text-green-500" />
                ) : (
                  <XCircle className="text-red-500" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
