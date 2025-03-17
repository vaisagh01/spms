'use client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

export default function Page() {
    const [alumni, setAlumni] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('http://localhost:8000/alumni/alumni/')
            .then(response => response.json())
            .then(data => setAlumni(data))
            .catch(error => console.error('Error fetching alumni data:', error));
    }, []);

    const filteredAlumni = alumni.filter(alum =>
        `${alum.first_name} ${alum.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.current_job?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-indigo-700">Alumni List</h1>
            <Input
                placeholder="Search alumni by name, email, or job..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4 p-2 border border-gray-300 rounded-lg"
            />
            <ScrollArea className="h-96 border rounded-lg p-4">
                <div className="space-y-4">
                    {filteredAlumni.map(alum => (
                        <Card key={alum.alumni_id} className="border border-gray-200 shadow-md flex flex-row items-center p-4">
                            <Image
                                src="/placeholder-avatar.png"
                                alt="Alumni Image"
                                width={100}
                                height={100}
                                className="rounded-full mr-4 border border-gray-300"
                            />
                            <div className="flex-1">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">{alum.first_name} {alum.last_name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p><span className="font-semibold">Email:</span> {alum.email}</p>
                                    <p><span className="font-semibold">Graduation Year:</span> {alum.graduation_year}</p>
                                    <p><span className="font-semibold">Phone:</span> {alum.phone_number}</p>
                                </CardContent>
                            </div>
                            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold text-sm">
                                {alum.current_job}
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
