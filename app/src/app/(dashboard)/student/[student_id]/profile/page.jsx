"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function StudentProfilePage() {
    const [profile, setProfile] = useState({});
    const [editing, setEditing] = useState(false);
    const [updatedData, setUpdatedData] = useState({});
    const { student_id } = useParams();
    const { toast } = useToast();

    useEffect(() => {
        fetchStudentProfile();
    }, []);

    const fetchStudentProfile = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/profilepage/profile/student/${student_id}/`);
            setProfile(response.data);
            setUpdatedData(response.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedData({ ...updatedData, [name]: value });
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:8000/profilepage/profile/student/${student_id}/`, updatedData);
            toast({ title: "Profile updated successfully." });
            setEditing(false);
            fetchStudentProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ title: "Failed to update profile.", variant: "destructive" });
        }
    };
    console.log(profile);
    

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-100 p-6">
            <Card className="w-full max-w-screen p-8 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-semibold text-center mb-6">Student Profile</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input name="name" value={`${profile.name || ''}`} disabled />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-sm font-medium">Enrollment Number</label>
                        <Input name="enrollment_number" value={profile.enrollment_number || ''} disabled />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input
                            name="phone_number"
                            value={editing ? updatedData.phone_number : profile.phone_number || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-sm font-medium">Date of Birth</label>
                        <Input
                            name="date_of_birth"
                            value={editing ? updatedData.date_of_birth : profile.date_of_birth || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-sm font-medium">Year of Study</label>
                        <Input
                            name="year_of_study"
                            value={editing ? updatedData.year_of_study : profile.year_of_study || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-sm font-medium">Semester</label>
                        <Input
                            name="semester"
                            value={editing ? updatedData.semester : profile.semester || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm font-medium">Course</label>
                        <Input name="course" value={profile.course || ''} disabled />
                    </div>
                    <div className="col-span-2 flex justify-end space-x-4">
                        {editing ? (
                            <>
                                <Button onClick={handleUpdate}>Save</Button>
                                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                            </>
                        ) : (
                            <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
