'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Carousel, CarouselItem, CarouselContent, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import EventCarousel from './EventCarousel';

export default function AlumniEventsPage() {
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
        <div className="p-2">
          <div className=''>
            <EventCarousel />
          </div>
        </div>
    );
}