'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AlumniProfilePage() {
    const params = useParams();
    const toast = useToast();
    const [alumni, setAlumni] = useState(null);
    const [updatedData, setUpdatedData] = useState({ current_job: '', phone_number: '' });
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8000/alumni/alumni/${params.alumni_id}/`)
            .then(res => res.json())
            .then(data => {
                setAlumni(data);
                setUpdatedData({ current_job: data.current_job || '', phone_number: data.phone_number || '' });
            })
            .catch(err => console.error('Error fetching alumni data:', err));
    }, [params.alumni_id]);

    const handleUpdate = () => {
        fetch(`http://localhost:8000/alumni/alumni/${params.alumni_id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    toast.error('Update failed. Please try again.');
                } else {
                    setAlumni(data);
                    setOpen(false);
                    toast.success('Profile updated successfully!');
                }
            })
            .catch(() => toast.error('Update failed. Please try again.'));
    };

    if (!alumni) return <p className="text-center text-gray-500">Loading...</p>;

    return (
        <div className="flex flex-col items-center min-h-screen p-6 bg-gray-50">
            <Card className="w-full max-w-2xl border border-gray-100 shadow-md bg-white">
                <CardHeader className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src="/placeholder-user.png" alt="Alumni" />
                        <AvatarFallback>{alumni.first_name.charAt(0)}{alumni.last_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-xl font-semibold">{alumni.first_name} {alumni.last_name}</CardTitle>
                        <p className="text-sm text-gray-500">{alumni.email}</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p><span className="font-semibold">Graduation Year:</span> {alumni.graduation_year}</p>
                    <p><span className="font-semibold">Department:</span> {alumni.department}</p>
                    <div className="flex justify-between">
                        <p className="font-semibold">Current Job:</p>
                        <p className="text-indigo-600 font-semibold">{alumni.current_job}</p>
                    </div>
                    <p><span className="font-semibold">Phone:</span> {alumni.phone_number}</p>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Edit Profile</Button>
                        </DialogTrigger>
                        <DialogContent className="p-6">
                            <DialogTitle className="text-lg font-semibold">Edit Your Information</DialogTitle>

                            <label className="block text-sm font-semibold mt-2">Current Job</label>
                            <Input
                                value={updatedData.current_job}
                                onChange={(e) => setUpdatedData({ ...updatedData, current_job: e.target.value })}
                            />

                            <label className="block text-sm font-semibold mt-2">Phone Number</label>
                            <Input
                                value={updatedData.phone_number}
                                onChange={(e) => setUpdatedData({ ...updatedData, phone_number: e.target.value })}
                            />

                            <DialogFooter className="mt-4 flex justify-end">
                                <Button onClick={handleUpdate} className="bg-green-600 hover:bg-green-700">Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
}
