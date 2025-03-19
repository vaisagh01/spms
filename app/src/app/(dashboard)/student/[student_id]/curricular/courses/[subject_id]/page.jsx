"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
<<<<<<< Updated upstream
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
=======
import Link from "next/link";
import axios from "axios";
import MyAccordian from "@/components/MyAccordian";
import { ArrowLeft } from "lucide-react";
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
    console.log(id);
>>>>>>> Stashed changes

    if (!id) {
      setError("No subject ID provided");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
<<<<<<< Updated upstream
        const response = await axios.get(
          `http://127.0.0.1:8000/curricular/topics/subject/${id}/`
        );
=======
        const response = await axios.get(`http://127.0.0.1:8000/curricular/topics/subject/${id}/`);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            <ArrowLeft className="mt-2 mr-4" /> Topics under {subjectName}
=======
            <ArrowLeft className="mt-2 mr-9" />
            Topics under {subjectName}
>>>>>>> Stashed changes
          </h2>
          <Link href="/assignments">
            <Button>View Assignments</Button>
          </Link>
        </div>

<<<<<<< Updated upstream
        <div className="space-y-4">
          {data.map((item, index) => (
            <Card key={index} className="flex flex-row items-center justify-between p-4 shadow-md">
              <CardContent className="flex flex-col space-y-2 w-full">
                <h3 className="text-lg font-bold">{item.topic_name}</h3>
                <p className="text-sm text-gray-600">
                  {item.description || "No description provided"}
=======
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
          <div className="col-span-2">
            {data.map((item, index) => (
              <div key={index} className="border p-4 rounded-lg shadow-sm mb-4">
                <h3 className="text-lg font-bold">{item.topic_name}</h3>
                <p className="text-sm text-gray-600">{item.description || "No description provided"}</p>
                <p className="text-sm mt-1">
                  Status: {item.is_completed ? "✅ Completed" : "❌ Not Completed"}
>>>>>>> Stashed changes
                </p>
                <p className="text-sm text-gray-500">
                  Completion Time: {item.completion_time || "N/A"}
                </p>
<<<<<<< Updated upstream
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
=======
              </div>
            ))}
          </div>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
};

<<<<<<< Updated upstream
export default Page;
=======
export default Page;
>>>>>>> Stashed changes
