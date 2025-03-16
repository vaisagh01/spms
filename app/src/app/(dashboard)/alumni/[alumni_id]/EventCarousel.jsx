'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Carousel, CarouselItem, CarouselContent, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';

export default function EventCarousel() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/alumni/events/')
            .then(response => response.json())
            .then(data => {
                setEvents(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p className="text-center text-lg">Loading events...</p>;
    if (error) return <p className="text-center text-red-600">Error fetching events.</p>;

    return (
        <div>
            <Carousel>
                <CarouselContent>
                    {events.map(event => (
                        <CarouselItem key={event.id} className="flex justify-center">
                            <Card className="w-[80%] bg-gray-50 border border-gray-200 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-indigo-700">{event.title}</CardTitle>
                                    <Badge variant="outline" className="text-sm mt-2 bg-blue-100 text-blue-700">
                                        {event.event_type}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 mb-2">{event.description}</p>
                                    <p className="font-semibold text-gray-600">📅 {event.date}</p>
                                    <p className="font-semibold text-gray-600">🏛 Department: {event.department}</p>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    );
}