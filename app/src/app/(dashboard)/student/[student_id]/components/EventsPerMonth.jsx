"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useParams } from "next/navigation";

export default function EventsPerMonth() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = "http://localhost:8000/extracurricular";  // Adjust to your actual API URL
  const params = useParams();
  useEffect(() => {
    const id = params.student_id;  // Replace with dynamic student ID if needed
    const fetchEvents = async () => {
      try {
        const eventParticipationRes = await axios.get(`${API_BASE_URL}/student/${id}/events/`);
        const events = eventParticipationRes.data.events;

        // Process the events to count by month
        const eventCountByMonth = events.reduce((acc, event) => {
          const month = new Date(event.event_date).toLocaleString('default', { month: 'long' });
          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month] += 1;
          return acc;
        }, {});

        // Transform data into chart-friendly format
        const formattedData = Object.keys(eventCountByMonth).map((month) => ({
          month,
          desktop: eventCountByMonth[month],
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const chartConfig = {
    desktop: {
      label: "Events",
      color: "hsl(var(--chart-1))",
    },
    label: {
      color: "hsl(var(--background))",
    },
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Number of Events per Month</CardTitle>
          <CardDescription>Monthly Event Participation</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                right: 16,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="month"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                hide
              />
              <XAxis dataKey="desktop" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="desktop" layout="vertical" fill="var(--color-desktop)" radius={4}>
                <LabelList
                  dataKey="month"
                  position="insideLeft"
                  offset={8}
                  className="fill-[--color-label]"
                  fontSize={12}
                />
                <LabelList
                  dataKey="desktop"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
