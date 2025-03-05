"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL = "http://127.0.0.1:8000/curricular";

const Page = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editTopic, setEditTopic] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { teacher_id } = useParams(); // Extract teacher_id from URL params

  useEffect(() => {
    if (!teacher_id) return;

    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/teacher/${teacher_id}/subjects/`);
        setSubjects(response.data.subjects || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, [teacher_id]);
  // console.log(subjects);
  
  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setIsDialogOpen(true);
  };

  const handleEditTopic = (topic) => {
    setEditTopic(topic);
  };

  const handleCheckboxChange = (e) => {
    setEditTopic((prev) => ({
      ...prev,
      is_completed: e.target.checked, // Toggle completion status
    }));
  };
  
  const handleSaveTopic = async () => {
    if (!editTopic || !selectedSubject) return;
    
    try {
      await axios.post(`http://127.0.0.1:8000/curricular/subjects/${selectedSubject.subject_id}/edit/`, {
        topic_id: editTopic.topic_id,
        topic_name: editTopic.topic_name,
        is_completed: editTopic.is_completed,
        // completion_time: editTopic.completion_time,
      });
      
      setSubjects((prev) =>
        prev.map((subject) =>
          subject.subject_id === selectedSubject.subject_id
            ? {
                ...subject,
                topics: subject.topics?.map((topic) =>
                  topic.topic_id === editTopic.topic_id ? editTopic : topic
                ),
              }
            : subject
        )
      );
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating topic:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Subjects</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subjects.length > 0 ? (
          subjects.map((subject) => {
            const allTopicsCompleted = subject.topics?.length > 0 && subject.topics.every(topic => topic.is_completed);

            return (
              <Card key={subject.subject_id} onClick={() => handleSubjectClick(subject)} className="cursor-pointer border-2 border-indigo-400 bg-indigo-100 hover:bg-indigo-200">
                <CardHeader>
                  <CardTitle className="w-full flex items-center justify-between">
                    <p className="text-lg">{subject.subject_name}</p>  {allTopicsCompleted && "✅"}
                  </CardTitle>
                  <p className="text-gray-500">Code: {subject.subject_code}</p>
                  <p className="text-gray-500">Semester: {subject.semester}</p>
                </CardHeader>
              </Card>
            );
          })
        ) : (
          <p>No subjects available</p>
        )}
      </div>

      {selectedSubject && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedSubject.subject_name} - Topics</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedSubject.topics?.length > 0 ? (
                selectedSubject.topics.map((topic) => (
                  <div key={topic.topic_id} className="flex items-center justify-between border p-2 rounded-md">
                    <div>
                      <p className="font-medium">{topic.topic_name}</p>
                      <p className="text-sm text-gray-500">
                        Completion Time: {topic.completion_time || "N/A"}
                      </p>
                      <p className="text-sm">
                        Completed: {topic.is_completed ? "✅ Yes" : "❌ No"}
                      </p>
                    </div>
                    <Button onClick={() => handleEditTopic(topic)} size="sm">
                      Edit
                    </Button>
                  </div>
                ))
              ) : (
                <p>No topics available</p>
              )}
            </div>

            {editTopic && (
              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium mb-2">Edit Topic</h3>
                <Input
                  value={editTopic.topic_name}
                  onChange={(e) => setEditTopic({ ...editTopic, topic_name: e.target.value })}
                  placeholder="Topic Name"
                />
                <Textarea
                  value={editTopic.completion_time || ""}
                  onChange={(e) => setEditTopic({ ...editTopic, completion_time: e.target.value })}
                  placeholder="Completion Time"
                  className="mt-2"
                />
                
                {/* Checkbox for Completion Status */}
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={editTopic.is_completed || false}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label className="text-sm">Mark as Completed</label>
                </div>

                <Button onClick={handleSaveTopic} className="mt-2 w-full">
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Page;
